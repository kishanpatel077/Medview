# MedView - DICOM Study Visualizer & Converter

This document details the complete features, architecture, and file structure of the **MedView** application (Frontend & Backend).

---

## 🏗️ Architecture Overview
MedView is built using a **decoupled Client-Server architecture** designed with **patient privacy** as the top priority. It operates **without a database**, executing all file extractions, DICOM parsing, and image conversions inside memory or temporary, self-cleaning storage directories.

* **Frontend**: React + Vite (Tailwind CSS, Framer Motion, React Icons) running on port `5173`.
* **Backend**: Python + FastAPI (Pydicom, Pillow, NumPy, Uvicorn) running on port `8000`.

---

## 🌟 Features List

### 🖥️ Frontend (React Client)
1. **Interactive DICOM Viewer (`src/components/DicomViewer.jsx`)**
   * *New*: Dynamically loads processed slice image streams served from the local Python backend.
   * *Old*: Supports multi-panel layouts (Single View, 2-View, 4-View layout grid) using Framer Motion micro-animations.
   * *New*: Implements multi-slice viewport tiling (e.g. displaying adjacent slices automatically in 2/4 layouts).

2. **Local Study Explorer (`src/components/StudyExplorer.jsx`)**
   * *New*: Parses and displays the active study name, patient name, and ID returned by the API.
   * *New*: Lists all series dynamically and handles changing the active series instantly.

3. **Multi-Series Navigation (`src/components/SeriesPanel.jsx`)**
   * *New*: Lists all active series dynamically with progress bars showing relative slice count volumes.
   * *New*: Allows changing the active viewing series directly by clicking on any series item.

4. **Dynamic Slice Navigation (`src/pages/Viewer.jsx`)**
   * *New*: Synchronizes the slider navigation ranges to match the active series slice length.
   * *New*: Handles real-time scrolling and frame navigation of slices.

5. **DICOM Tag Metadata Panel (`src/components/MetadataPanel.jsx`)**
   * *New*: Renders real-time DICOM header tags (Patient name, ID, Study details, dimensions, window width/center, pixel spacing, etc.) for the currently visible slice.

6. **DICOM Upload zone (`src/components/UploadZone.jsx`)**
   * *New*: Integrates a HTML file upload interface to accept local ZIP studies and POST them to the API.

7. **Export & Convert Panel (`src/components/ExportPanel.jsx`)** *(NEW)*
   * Allows exporting/converting DICOM slices into browser-ready image files.
   * Supports **PNG** format (lossless pixel-perfect quality).
   * Supports **JPEG** format (RGB conversion and compression to minimize file sizes).
   * Bundles all slices into a single downloadable `.zip` file.
   * Shows real-time progress indicators.

8. **Theme Toggler & Premium Footer**
   * Supports smooth Light / Dark mode themes.
   * *New*: Fades into deep tech gradients in dark mode and includes copyright bars + links.

---

### ⚙️ Backend (Python FastAPI Server)
All backend components are stateless, database-free, and transient.

1. **Transient Upload Endpoint (`/api/upload`)** *(NEW)*
   * Receives DICOM studies uploaded as ZIP archives.
   * Extracts files into UUID-based temporary folders.
   * Recursively parses files to filter valid DICOM elements using `pydicom`.
   * Automatically strips path names to protect metadata.

2. **DICOM Metadata Tag Extraction** *(NEW)*
   * Reads patient tags and study metadata.
   * Safely formats multi-value tags, person names, and raw binary values into clean, JSON-serializable structures.
   * Determines slice location order (sorting by `SliceLocation`, `ImagePositionPatient[2]`, or `InstanceNumber`).

3. **On-The-Fly Slice Image Rendering** *(NEW)*
   * Reads 12-bit/16-bit high-dynamic-range raw DICOM pixel arrays.
   * Applies Rescale Slopes, Rescale Intercepts, Window Centers, and Window Widths.
   * Normalizes values into 8-bit grayscale numpy arrays.
   * Generates and saves optimized `.png` slices to serve via HTTP.

4. **Study Conversion & Bundle Endpoint (`/api/convert`)** *(NEW)*
   * Converts existing PNG slices to a target format on-demand.
   * Converts PNG files to RGB JPEG images at 92% compression quality for smaller archive sizes.
   * Bundles converted slices into a single `.zip` file for user download.

5. **Self-Cleaning Storage Lifecycle** *(NEW)*
   * A garbage collector function that runs on every new upload.
   * Automatically deletes temporary study directories older than 30 minutes to safeguard disk space.
   * Uses FastAPI `BackgroundTask` to immediately delete generated ZIP exports after download completion.
