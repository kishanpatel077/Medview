import os
import zipfile
import shutil
import uuid
import tempfile
from pathlib import Path
from typing import Dict, List, Any
import numpy as np
from PIL import Image
import pydicom
from pydicom.errors import InvalidDicomError

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
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

# Establish temporary directory for processing uploaded studies
TEMP_BASE_DIR = Path(tempfile.gettempdir()) / "medview_studies"
TEMP_BASE_DIR.mkdir(parents=True, exist_ok=True)

# Mount directory as static folder to serve generated slice images directly via HTTP
app.mount("/static", StaticFiles(directory=str(TEMP_BASE_DIR)), name="static")


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


# --- ROUTE HANDLERS ---

@app.get("/")
def read_root():
    """Simple API check connection response."""
    return {"message": "MedView DICOM processing backend is running."}


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
    # Trigger garbage collection on old sessions
    cleanup_old_studies()

    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files containing DICOM studies are supported.")

    # Create a unique study session folder
    study_id = uuid.uuid4().hex
    study_dir = TEMP_BASE_DIR / study_id
    study_dir.mkdir(exist_ok=True)

    zip_path = study_dir / "uploaded_study.zip"
    
    # Step 1: Copy uploaded file stream onto local disk
    try:
        with open(zip_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    except Exception as e:
        shutil.rmtree(study_dir)
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {str(e)}")

    # Step 2: Unzip the file
    extract_dir = study_dir / "extracted"
    extract_dir.mkdir(exist_ok=True)
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
    except Exception as e:
        shutil.rmtree(study_dir)
        raise HTTPException(status_code=400, detail=f"Invalid ZIP file: {str(e)}")

    # Step 3: Traverse folders recursively to find DICOM slices
    dicom_files: List[Path] = []
    for root, _, filenames in os.walk(extract_dir):
        for name in filenames:
            file_path = Path(root) / name
            # Ignore hidden files or OS system artifacts
            if name.startswith('._') or name == 'Thumbs.db' or '.DS_Store' in name:
                continue
            dicom_files.append(file_path)

    if not dicom_files:
        shutil.rmtree(study_dir)
        raise HTTPException(status_code=400, detail="No files found in the uploaded ZIP.")

    studies_data: Dict[str, Any] = {}
    processed_count = 0
    errors_count = 0

    # Step 4: Parse DICOM elements and extract pixel data
    for file_path in dicom_files:
        try:
            ds = pydicom.dcmread(file_path, force=True)
            # Ensure it is a valid DICOM file by checking for essential UIDs
            if 'SOPInstanceUID' not in ds or 'StudyInstanceUID' not in ds:
                continue
            
            study_uid = clean_dicom_value(ds.StudyInstanceUID)
            series_uid = clean_dicom_value(ds.SeriesInstanceUID)
            sop_uid = clean_dicom_value(ds.SOPInstanceUID)
            
            # Setup study record structure if parsing first slice
            if study_uid not in studies_data:
                studies_data[study_uid] = {
                    "studyInstanceUid": study_uid,
                    "patientName": clean_dicom_value(ds.get('PatientName', 'Anonymous Patient')),
                    "patientId": clean_dicom_value(ds.get('PatientID', 'N/A')),
                    "studyDate": clean_dicom_value(ds.get('StudyDate', 'N/A')),
                    "studyDescription": clean_dicom_value(ds.get('StudyDescription', 'DICOM Study')),
                    "modality": clean_dicom_value(ds.get('Modality', 'MR')),
                    "series": {}
                }
            
            study = studies_data[study_uid]
            
            # Setup series structure under study grouping
            if series_uid not in study["series"]:
                study["series"][series_uid] = {
                    "seriesInstanceUid": series_uid,
                    "seriesDescription": clean_dicom_value(ds.get('SeriesDescription', f"Series {ds.get('SeriesNumber', 1)}")),
                    "seriesNumber": int(ds.get('SeriesNumber', 1)),
                    "modality": clean_dicom_value(ds.get('Modality', 'MR')),
                    "instances": []
                }
                
            series = study["series"][series_uid]
            
            # Convert raw pixel arrays to web-ready formats
            png_name = f"{sop_uid}.png"
            png_path = study_dir / png_name
            
            has_image = False
            metadata_rows = []
            
            if 'PixelData' in ds:
                try:
                    # Convert to raw float array
                    pixels = ds.pixel_array.astype(float)
                    
                    # Apply Rescale Slope / Intercept adjustments (modality dependent)
                    if hasattr(ds, 'RescaleSlope') and hasattr(ds, 'RescaleIntercept'):
                        pixels = pixels * float(ds.RescaleSlope) + float(ds.RescaleIntercept)
                        
                    # Apply Window Center (WL) and Window Width (WW) contrast scaling
                    if hasattr(ds, 'WindowCenter') and hasattr(ds, 'WindowWidth'):
                        wc = ds.WindowCenter
                        ww = ds.WindowWidth
                        # Handle array values for multiple presets (select default index 0)
                        if isinstance(wc, pydicom.multival.MultiValue):
                            wc = wc[0]
                        if isinstance(ww, pydicom.multival.MultiValue):
                            ww = ww[0]
                        
                        val_min = float(wc) - (float(ww) / 2.0)
                        val_max = float(wc) + (float(ww) / 2.0)
                        
                        # Clip elements outside window limits and rescale to 8-bit scale
                        pixels = np.clip(pixels, val_min, val_max)
                        pixels = ((pixels - val_min) / (val_max - val_min)) * 255.0
                    else:
                        # Fallback simple min-max normalization
                        p_min, p_max = pixels.min(), pixels.max()
                        if p_max > p_min:
                            pixels = ((pixels - p_min) / (p_max - p_min)) * 255.0
                        else:
                            pixels = np.zeros_like(pixels)
                            
                    # Cast into 8-bit unsigned integer array
                    pixels = pixels.astype(np.uint8)
                    
                    # Build and save PNG image slice
                    img = Image.fromarray(pixels)
                    img.save(png_path, 'PNG')
                    has_image = True
                except Exception as e:
                    print(f"Error converting pixel data for instance {sop_uid}: {e}")
                    errors_count += 1
            
            # Map key-value arrays for the frontend MetadataPanel structure
            metadata_rows = [
                ["Patient Name", clean_dicom_value(ds.get('PatientName', 'Anonymous'))],
                ["Patient ID", clean_dicom_value(ds.get('PatientID', 'N/A'))],
                ["Study UID", study_uid],
                ["Study Date", clean_dicom_value(ds.get('StudyDate', 'N/A'))],
                ["Study Description", clean_dicom_value(ds.get('StudyDescription', 'N/A'))],
                ["Modality", clean_dicom_value(ds.get('Modality', 'N/A'))],
                ["Series UID", series_uid],
                ["Series Description", clean_dicom_value(ds.get('SeriesDescription', 'N/A'))],
                ["Series Number", str(ds.get('SeriesNumber', '1'))],
                ["Instance Number", str(ds.get('InstanceNumber', '1'))],
                ["Slice Location", str(ds.get('SliceLocation', 'N/A'))],
                ["Columns / Width", str(ds.get('Columns', 'N/A'))],
                ["Rows / Height", str(ds.get('Rows', 'N/A'))],
                ["Spacing", str(clean_dicom_value(ds.get('PixelSpacing', 'N/A')))],
                ["Window Center", str(clean_dicom_value(ds.get('WindowCenter', 'N/A')))],
                ["Window Width", str(clean_dicom_value(ds.get('WindowWidth', 'N/A')))],
                ["Photometric", str(ds.get('PhotometricInterpretation', 'MONOCHROME2'))]
            ]
            
            # Pack instance elements
            instance_data = {
                "sopInstanceUid": sop_uid,
                "instanceNumber": int(ds.get('InstanceNumber', 1)),
                "sliceLocation": get_slice_sorting_key(ds),
                "imageUrl": f"/static/{study_id}/{png_name}" if has_image else None,
                "metadata": metadata_rows
            }
            
            series["instances"].append(instance_data)
            processed_count += 1
            
        except InvalidDicomError:
            # Not a valid DICOM file, skip it
            continue
        except Exception as e:
            print(f"Error processing file {file_path.name}: {e}")
            errors_count += 1

    # Clean up the large extracted folder and zip file from disk
    # We only keep the generated PNG slices to minimize storage overhead
    try:
        shutil.rmtree(extract_dir)
        if zip_path.exists():
            zip_path.unlink()
    except Exception as e:
        print(f"Error cleaning up extracted files: {e}")

    # Verify if study loading succeeded
    if not studies_data:
        shutil.rmtree(study_dir)
        raise HTTPException(
            status_code=400, 
            detail="No valid DICOM files with pixel data could be parsed from the uploaded archive."
        )

    # Post-process, sort slices, and convert dictionary structures to list structures
    final_studies: List[Dict[str, Any]] = []
    
    for study_uid, study_info in studies_data.items():
        series_list = []
        for series_uid, series_info in study_info["series"].items():
            # Sort instances (slices) spatially (coordinates depth) first, then sequentially (instance number)
            series_info["instances"].sort(key=lambda x: (x["sliceLocation"], x["instanceNumber"]))
            series_list.append(series_info)
            
        # Sort series list by series numbers
        series_list.sort(key=lambda x: x["seriesNumber"])
        
        study_info["series"] = series_list
        final_studies.append(study_info)

    # Save metadata.json for reference in conversion endpoint (e.g. video creation)
    try:
        import json
        with open(study_dir / "metadata.json", "w") as f:
            json.dump(final_studies[0], f)
    except Exception as e:
        print(f"Error saving metadata.json: {e}")

    # Return the first study found in the payload
    # IMPORTANT: We also return the internal session_id (UUID-based folder name)
    # so the frontend can pass it to /api/convert instead of the DICOM studyInstanceUid.
    return JSONResponse(content={
        "status": "success",
        "processed": processed_count,
        "errors": errors_count,
        "session_id": study_id,
        "study": final_studies[0]
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

