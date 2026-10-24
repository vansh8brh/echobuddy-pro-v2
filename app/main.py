import json
import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.spatial_engine import EchoBuddySpatialEngine, SpatialVector, AudioSonificationParameters
from app.vision_engine import EchoBuddyVisionEngine

app = FastAPI(
    title="EchoBuddy - AI Spatial Perception & Accessibility Platform API",
    description="Production-grade REST & WebSocket API powering voice guidance, real-time visual depth detection, and spatial navigation for visually impaired users.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

spatial_engine = EchoBuddySpatialEngine()
vision_engine = EchoBuddyVisionEngine()

static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

class SonifyRequest(BaseModel):
    dx: float = Field(..., ge=-1.0, le=1.0, description="Horizontal offset (-1.0 left to +1.0 right)")
    dy: float = Field(..., ge=-1.0, le=1.0, description="Vertical offset (-1.0 bottom to +1.0 top)")
    dz: float = Field(..., ge=0.05, le=10.0, description="Distance in meters (0.1m to 5.0m)")
    target_name: Optional[str] = Field("object", description="Target object label")

class SceneDescribeRequest(BaseModel):
    objects: List[Dict[str, Any]] = Field(..., description="List of detected object items with label, distance_m, and position")
    lang: Optional[str] = Field("en", description="Narration language code ('en' or 'hi')")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return HTMLResponse("<h1>EchoBuddy Platform Active</h1><p>Visit <a href='/docs'>/docs</a> for API specifications.</p>")

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "platform": "EchoBuddy Accessibility Platform",
        "version": "2.1.0-v2",
        "vision_engine": "TensorFlow.js & OpenCV active",
        "voice_navigation": "operational (English & Hindi V2)"
    }

@app.get("/api/v1/targets")
async def list_targets():
    return {
        "targets": vision_engine.known_categories,
        "count": len(vision_engine.known_categories)
    }

@app.post("/api/v1/sonify")
async def sonify_coordinates(request: SonifyRequest):
    vector = SpatialVector(dx=request.dx, dy=request.dy, dz=request.dz)
    audio_params = spatial_engine.sonify_spatial_vector(vector, request.target_name)
    return {
        "target_name": request.target_name,
        "vector": vector.model_dump(),
        "audio_parameters": audio_params.model_dump()
    }

@app.post("/api/v1/scene-describe")
async def scene_describe(request: SceneDescribeRequest):
    description = vision_engine.generate_scene_description(request.objects, lang=request.lang or "en")
    return {
        "speech_narration": description,
        "object_count": len(request.objects),
        "language": request.lang or "en"
    }

@app.post("/api/v1/detect")
async def detect_and_sonify(
    target_name: str = Form(...),
    file: UploadFile = File(...)
):
    contents = await file.read()
    detection = vision_engine.process_frame(contents, target_name)

    if not detection.get("found") or not detection.get("bbox"):
        vector = SpatialVector(dx=0.0, dy=0.0, dz=1.0)
    else:
        vector = spatial_engine.calculate_spatial_vector(
            bbox=detection["bbox"],
            frame_width=detection["frame_width"],
            frame_height=detection["frame_height"],
            object_label=target_name
        )

    audio_params = spatial_engine.sonify_spatial_vector(vector, target_name)

    return {
        "detection": detection,
        "vector": vector.model_dump(),
        "audio_parameters": audio_params.model_dump()
    }

@app.websocket("/ws/spatial-stream")
async def websocket_spatial_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data_text = await websocket.receive_text()
            data = json.loads(data_text)
            
            dx = float(data.get("dx", 0.0))
            dy = float(data.get("dy", 0.0))
            dz = float(data.get("dz", 1.0))
            target = str(data.get("target", "object"))

            vector = SpatialVector(dx=dx, dy=dy, dz=dz)
            audio_params = spatial_engine.sonify_spatial_vector(vector, target)

            await websocket.send_json({
                "target": target,
                "vector": vector.model_dump(),
                "audio_parameters": audio_params.model_dump()
            })
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)

