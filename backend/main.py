import os
import io
import json
import zipfile
import shutil
import uuid
import tempfile
import threading
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

import numpy as np
from PIL import Image
import pydicom
from pydicom.errors import InvalidDicomError

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

# --- APP CONFIGURATION ---
app = FastAPI(title="MedView DICOM Service")

# Configure CORS (Cross-Origin Resource Sharing) to allow React client communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all origins; tighten in production (e.g. ['http://localhost:5173'])
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Establish temporary directory for processing uploaded studies
TEMP_BASE_DIR = Path(tempfile.gettempdir()) / "medview_studies"
TEMP_BASE_DIR.mkdir(parents=True, exist_ok=True)

# Mount directory as static folder to serve generated slice images directly via HTTP
app.mount("/static", StaticFiles(directory=str(TEMP_BASE_DIR)), name="static")

MAX_UPLOAD_WORKERS = int(os.getenv("MEDVIEW_UPLOAD_WORKERS", "4"))
SKIP_ZIP_NAMES = {"Thumbs.db", ".DS_Store"}


# --- HELPER FUNCTIONS ---

def clean_dicom_value(val: Any) -> Any:
    """
    Sanitizes raw DICOM header values to be fully JSON serializable.
    Converts multivalues, person names, and binary data into safe representations.
    """
    if val is None:
        return ""
    if isinstance(val, (int, float, str)):
        return val
    if isinstance(val, pydicom.multival.MultiValue):
        # Recursively sanitize lists of values
        return [clean_dicom_value(v) for v in val]
    if isinstance(val, pydicom.valuerep.PersonName):
        return str(val)
    if isinstance(val, bytes):
        try:
            return val.decode('utf-8', errors='ignore')
        except Exception:
            return ""
    return str(val)


def cleanup_old_studies():
    """
    Scans the temporary studies folder and deletes folders older than 30 minutes.
    This maintains a low disk usage footprint without needing a persistent database.
    """
    import time
    now = time.time()
    for item in TEMP_BASE_DIR.iterdir():
        if item.is_dir():
            # Retrieve last modification timestamp
            mtime = item.stat().st_mtime
            if (now - mtime) > 1800:  # 30 minutes threshold
                try:
                    shutil.rmtree(item)
                    print(f"[Cleanup] Deleted stale study folder: {item.name}")
                except Exception as e:
                    print(f"[Cleanup] Error removing {item.name}: {e}")


def delete_directory(path: Path):
    """
    Helper to cleanly delete a temporary directory.
    Commonly triggered as a background worker task.
    """
    try:
        if path.exists():
            shutil.rmtree(path)
            print(f"[Cleanup] Deleted temporary folder: {path}")
    except Exception as e:
        print(f"[Cleanup] Error deleting directory {path}: {e}")


def get_slice_sorting_key(ds: pydicom.Dataset) -> float:
    """
    Resolves the spatial coordinate of a DICOM dataset to sort images sequentially.
    Order of preference:
    1. SliceLocation tag
    2. ImagePositionPatient (Z coordinate / index 2)
    3. InstanceNumber tag (fallback)
    """
    try:
        # Check standard slice location tag
        if 'SliceLocation' in ds:
            return float(ds.SliceLocation)
        # Check coordinates tag (3rd value represents depth coordinate)
        if 'ImagePositionPatient' in ds and len(ds.ImagePositionPatient) == 3:
            return float(ds.ImagePositionPatient[2])
    except Exception:
        pass
    # Fallback to slice sequence instance counter
    try:
        if 'InstanceNumber' in ds:
            return float(ds.InstanceNumber)
    except Exception:
        pass
    return 0.0


def should_skip_zip_member(name: str) -> bool:
    if name.endswith("/"):
        return True
    basename = Path(name).name
    if not basename or basename.startswith("._"):
        return True
    return basename in SKIP_ZIP_NAMES


def pixels_to_uint8(pixels: np.ndarray, ds: pydicom.Dataset) -> np.ndarray:
    values = pixels.astype(np.float32, copy=False)

    if hasattr(ds, "RescaleSlope") and hasattr(ds, "RescaleIntercept"):
        values = values * float(ds.RescaleSlope) + float(ds.RescaleIntercept)

    if hasattr(ds, "WindowCenter") and hasattr(ds, "WindowWidth"):
        wc = ds.WindowCenter
        ww = ds.WindowWidth
        if isinstance(wc, pydicom.multival.MultiValue):
            wc = wc[0]
        if isinstance(ww, pydicom.multival.MultiValue):
            ww = ww[0]
        val_min = float(wc) - (float(ww) / 2.0)
        val_max = float(wc) + (float(ww) / 2.0)
        values = np.clip(values, val_min, val_max)
        values = ((values - val_min) / (val_max - val_min)) * 255.0
    else:
        p_min, p_max = values.min(), values.max()
        if p_max > p_min:
            values = ((values - p_min) / (p_max - p_min)) * 255.0
        else:
            values = np.zeros_like(values)

    return values.astype(np.uint8)


def build_metadata_rows(ds: pydicom.Dataset, study_uid: str, series_uid: str) -> List[List[str]]:
    return [
        ["Patient Name", clean_dicom_value(ds.get("PatientName", "Anonymous"))],
        ["Patient ID", clean_dicom_value(ds.get("PatientID", "N/A"))],
        ["Study UID", study_uid],
        ["Study Date", clean_dicom_value(ds.get("StudyDate", "N/A"))],
        ["Study Description", clean_dicom_value(ds.get("StudyDescription", "N/A"))],
        ["Modality", clean_dicom_value(ds.get("Modality", "N/A"))],
        ["Series UID", series_uid],
        ["Series Description", clean_dicom_value(ds.get("SeriesDescription", "N/A"))],
        ["Series Number", str(ds.get("SeriesNumber", "1"))],
        ["Instance Number", str(ds.get("InstanceNumber", "1"))],
        ["Slice Location", str(ds.get("SliceLocation", "N/A"))],
        ["Columns / Width", str(ds.get("Columns", "N/A"))],
        ["Rows / Height", str(ds.get("Rows", "N/A"))],
        ["Spacing", str(clean_dicom_value(ds.get("PixelSpacing", "N/A")))],
        ["Window Center", str(clean_dicom_value(ds.get("WindowCenter", "N/A")))],
        ["Window Width", str(clean_dicom_value(ds.get("WindowWidth", "N/A")))],
        ["Photometric", str(ds.get("PhotometricInterpretation", "MONOCHROME2"))],
    ]


def process_zip_member(
    zip_ref: zipfile.ZipFile,
    zip_lock: threading.Lock,
    name: str,
    study_id: str,
    study_dir: Path,
) -> Tuple[Optional[Dict[str, Any]], bool]:
    try:
        with zip_lock:
            raw = zip_ref.read(name)
    except Exception as exc:
        print(f"Error reading ZIP member {name}: {exc}")
        return None, True
    return process_dicom_bytes(raw, study_id, study_dir)


def process_dicom_bytes(
    raw: bytes,
    study_id: str,
    study_dir: Path,
) -> Tuple[Optional[Dict[str, Any]], bool]:
    """
    Parse one DICOM blob and write its PNG slice.
    Returns (result_payload, had_error).
  """
    try:
        ds = pydicom.dcmread(io.BytesIO(raw), force=True)
        if "SOPInstanceUID" not in ds or "StudyInstanceUID" not in ds:
            return None, False

        study_uid = clean_dicom_value(ds.StudyInstanceUID)
        series_uid = clean_dicom_value(ds.SeriesInstanceUID)
        sop_uid = clean_dicom_value(ds.SOPInstanceUID)

        has_image = False
        png_name = f"{sop_uid}.png"
        png_path = study_dir / png_name

        if "PixelData" in ds:
            try:
                pixels = pixels_to_uint8(ds.pixel_array, ds)
                Image.fromarray(pixels).save(png_path, format="PNG", compress_level=1, optimize=False)
                has_image = True
            except Exception as exc:
                print(f"Error converting pixel data for instance {sop_uid}: {exc}")
                return None, True

        instance_data = {
            "sopInstanceUid": sop_uid,
            "instanceNumber": int(ds.get("InstanceNumber", 1)),
            "sliceLocation": get_slice_sorting_key(ds),
            "imageUrl": f"/static/{study_id}/{png_name}" if has_image else None,
            "metadata": build_metadata_rows(ds, study_uid, series_uid),
        }

        study_meta = {
            "studyInstanceUid": study_uid,
            "patientName": clean_dicom_value(ds.get("PatientName", "Anonymous Patient")),
            "patientId": clean_dicom_value(ds.get("PatientID", "N/A")),
            "studyDate": clean_dicom_value(ds.get("StudyDate", "N/A")),
            "studyDescription": clean_dicom_value(ds.get("StudyDescription", "DICOM Study")),
            "modality": clean_dicom_value(ds.get("Modality", "MR")),
        }
        series_meta = {
            "seriesInstanceUid": series_uid,
            "seriesDescription": clean_dicom_value(
                ds.get("SeriesDescription", f"Series {ds.get('SeriesNumber', 1)}")
            ),
            "seriesNumber": int(ds.get("SeriesNumber", 1)),
            "modality": clean_dicom_value(ds.get("Modality", "MR")),
        }

        return {
            "study_uid": study_uid,
            "series_uid": series_uid,
            "study_meta": study_meta,
            "series_meta": series_meta,
            "instance": instance_data,
        }, False
    except InvalidDicomError:
        return None, False
    except Exception as exc:
        print(f"Error processing DICOM blob: {exc}")
        return None, True


def merge_processed_result(studies_data: Dict[str, Any], result: Dict[str, Any]) -> None:
    study_uid = result["study_uid"]
    series_uid = result["series_uid"]

    if study_uid not in studies_data:
        studies_data[study_uid] = {**result["study_meta"], "series": {}}

    study = studies_data[study_uid]
    if series_uid not in study["series"]:
        study["series"][series_uid] = {**result["series_meta"], "instances": []}

    study["series"][series_uid]["instances"].append(result["instance"])


# --- ROUTE HANDLERS ---

@app.get("/")
def read_root():
    """Simple API check connection response."""
    return {"message": "MedView DICOM processing backend is running."}


@app.get("/api/health")
def health_check():
    """Lightweight health endpoint used to warm the Render instance."""
    return {"status": "ok", "service": "medview-backend"}


@app.post("/api/upload")
def upload_dicom_zip(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    POST endpoint to upload a ZIP file containing DICOM slices.
    Extracts ZIP, parses metadata headers, rescales raw pixel matrices into PNGs,
    and returns a structured JSON payload of the study.
    """
    background_tasks.add_task(cleanup_old_studies)

    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files containing DICOM studies are supported.")

    study_id = uuid.uuid4().hex
    study_dir = TEMP_BASE_DIR / study_id
    study_dir.mkdir(exist_ok=True)

    zip_path = study_dir / "uploaded_study.zip"

    try:
        with open(zip_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        shutil.rmtree(study_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {str(e)}")

    studies_data: Dict[str, Any] = {}
    processed_count = 0
    errors_count = 0

    try:
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            members = [name for name in zip_ref.namelist() if not should_skip_zip_member(name)]
            if not members:
                raise HTTPException(status_code=400, detail="No files found in the uploaded ZIP.")

            with ThreadPoolExecutor(max_workers=MAX_UPLOAD_WORKERS) as executor:
                zip_lock = threading.Lock()
                futures = {
                    executor.submit(process_zip_member, zip_ref, zip_lock, name, study_id, study_dir): name
                    for name in members
                }

                for future in as_completed(futures):
                    result, had_error = future.result()
                    if had_error:
                        errors_count += 1
                    if not result:
                        continue
                    merge_processed_result(studies_data, result)
                    processed_count += 1
    except HTTPException:
        shutil.rmtree(study_dir, ignore_errors=True)
        raise
    except zipfile.BadZipFile as e:
        shutil.rmtree(study_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=f"Invalid ZIP file: {str(e)}")
    except Exception as e:
        shutil.rmtree(study_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")
    finally:
        try:
            if zip_path.exists():
                zip_path.unlink()
        except Exception as e:
            print(f"Error cleaning up uploaded ZIP: {e}")

    if not studies_data:
        shutil.rmtree(study_dir, ignore_errors=True)
        raise HTTPException(
            status_code=400,
            detail="No valid DICOM files with pixel data could be parsed from the uploaded archive.",
        )

    final_studies: List[Dict[str, Any]] = []

    for study_uid, study_info in studies_data.items():
        series_list = []
        for series_uid, series_info in study_info["series"].items():
            series_info["instances"].sort(key=lambda x: (x["sliceLocation"], x["instanceNumber"]))
            series_list.append(series_info)

        series_list.sort(key=lambda x: x["seriesNumber"])
        study_info["series"] = series_list
        final_studies.append(study_info)

    try:
        with open(study_dir / "metadata.json", "w") as f:
            json.dump(final_studies[0], f)
    except Exception as e:
        print(f"Error saving metadata.json: {e}")

    return JSONResponse(content={
        "status": "success",
        "processed": processed_count,
        "errors": errors_count,
        "session_id": study_id,
        "study": final_studies[0],
    })


@app.post("/api/convert")
def convert_dicom_study(
    study_id: str,
    target_format: str,
    background_tasks: BackgroundTasks,
    series_uid: str = None
):
    """
    Convert the DICOM study slices to target format (PNG, JPEG, or WMV video) and offer for download.
    """
    study_dir = TEMP_BASE_DIR / study_id
    if not study_dir.exists():
        raise HTTPException(status_code=404, detail="Study not found or session expired.")

    target_format = target_format.lower()
    if target_format not in ["png", "jpeg", "jpg", "wmv"]:
        raise HTTPException(status_code=400, detail="Unsupported target format. Choose 'png', 'jpeg', 'jpg', or 'wmv'.")

    if target_format == "wmv":
        import imageio
        import json
        
        metadata_path = study_dir / "metadata.json"
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Study metadata not found or session expired.")
            
        try:
            with open(metadata_path, "r") as f:
                study_data = json.load(f)
                
            series_list = study_data.get("series", [])
            if not series_list:
                raise HTTPException(status_code=400, detail="No series found in study.")
                
            # Find matching series or default to first
            target_series = None
            if series_uid:
                target_series = next((s for s in series_list if s.get("seriesInstanceUid") == series_uid), None)
            if not target_series:
                target_series = series_list[0]
                
            instances = target_series.get("instances", [])
            if not instances:
                raise HTTPException(status_code=400, detail="No instances found in selected series.")
                
            image_paths = []
            for inst in instances:
                sop_uid = inst.get("sopInstanceUid")
                png_path = study_dir / f"{sop_uid}.png"
                if png_path.exists():
                    image_paths.append(png_path)
                    
            if not image_paths:
                raise HTTPException(status_code=400, detail="No source images found for video rendering.")
                
            movie_filename = f"movie_{target_series.get('seriesInstanceUid', study_id)}.wmv"
            movie_output_path = TEMP_BASE_DIR / movie_filename
            
            # Write WMV video using imageio (uses ffmpeg package we installed)
            writer = imageio.get_writer(
                str(movie_output_path),
                fps=10,
                format='FFMPEG',
                codec='wmv2'
            )
            for img_path in image_paths:
                img_data = imageio.v3.imread(img_path)
                writer.append_data(img_data)
            writer.close()
            
            # Register deletion task to remove video after download completes
            background_tasks.add_task(lambda p: p.unlink() if p.exists() else None, movie_output_path)
            
            return FileResponse(
                path=str(movie_output_path),
                filename=f"medview_movie_{study_id[:8]}.wmv",
                media_type="video/x-ms-wmv"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"WMV video generation failed: {str(e)}")

    format_ext = ".png" if target_format == "png" else ".jpg"
    zip_filename = f"converted_{target_format}_{study_id}.zip"
    zip_output_path = TEMP_BASE_DIR / zip_filename
    
    try:
        # Create output ZIP archive
        with zipfile.ZipFile(zip_output_path, 'w') as zip_ref:
            for item in study_dir.iterdir():
                if item.suffix == '.png':
                    if format_ext == ".jpg":
                        # Load PNG and cast to RGB format (JPEG does not support Alpha channel format)
                        img = Image.open(item)
                        rgb_img = img.convert('RGB')
                        temp_jpg = study_dir / f"{item.stem}.jpg"
                        rgb_img.save(temp_jpg, 'JPEG', quality=92)
                        zip_ref.write(temp_jpg, arcname=temp_jpg.name)
                        # Clean up JPG file immediately
                        temp_jpg.unlink()
                    else:
                        # Pack default PNG
                        zip_ref.write(item, arcname=item.name)
                        
        # Register deletion task to remove ZIP after download completes
        background_tasks.add_task(lambda p: p.unlink() if p.exists() else None, zip_output_path)
        
        return FileResponse(
            path=str(zip_output_path),
            filename=f"medview_export_{target_format}_{study_id[:8]}.zip",
            media_type="application/zip"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

