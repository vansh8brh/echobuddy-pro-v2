import math
from typing import Dict, Any, Tuple, List, Optional
from pydantic import BaseModel, Field

class SpatialVector(BaseModel):
    dx: float = Field(..., description="Normalized horizontal offset (-1.0 left to +1.0 right)")
    dy: float = Field(..., description="Normalized vertical offset (-1.0 bottom to +1.0 top)")
    dz: float = Field(..., description="Distance in meters (0.1m to 5.0m)")

class AudioSonificationParameters(BaseModel):
    pan: float = Field(..., description="Audio stereo panning from -1.0 (left) to +1.0 (right)")
    frequency_hz: float = Field(..., description="Audio pitch frequency in Hz (260Hz to 880Hz)")
    pulse_interval_ms: int = Field(..., description="Sonar beep interval in milliseconds (50ms to 600ms)")
    is_locked: bool = Field(..., description="True if hand/camera is directly pointing at target within tolerance")
    proximity_percentage: float = Field(..., description="Target lock proximity percentage (0% to 100%)")
    guidance_cue: str = Field(..., description="Human-readable assistive directional guidance")

class EchoBuddySpatialEngine:
    """
    Professional Spatial Engine for EchoBuddy.
    Calculates precise 3D spatial vectors, object distances, angular offsets,
    and produces accessible verbal & audio telemetry for visually impaired users.
    """
    def __init__(
        self,
        focal_length_px: float = 600.0,
        lock_distance_threshold: float = 0.35, # 35 cm lock threshold
        lock_angular_threshold: float = 0.18   # Center alignment tolerance
    ):
        self.focal_length_px = focal_length_px
        self.lock_distance_threshold = lock_distance_threshold
        self.lock_angular_threshold = lock_angular_threshold
        
        # Real-world object physical height estimates (in meters) for pinhole distance calculation
        self.real_object_heights = {
            "bottle": 0.24,
            "water_bottle": 0.25,
            "cup": 0.12,
            "coffee_mug": 0.11,
            "cell phone": 0.15,
            "phone": 0.15,
            "mobile": 0.15,
            "laptop": 0.25,
            "mouse": 0.04,
            "keyboard": 0.15,
            "book": 0.22,
            "glasses": 0.05,
            "spectacles": 0.05,
            "keys": 0.08,
            "wallet": 0.10,
            "chair": 0.90,
            "person": 1.70,
            "backpack": 0.45,
            "scissors": 0.18,
            "remote": 0.18,
            "clock": 0.25,
            "door": 2.00,
            "door_handle": 0.15
        }

    def estimate_distance_meters(self, label: str, bbox_height_px: float, frame_height_px: float = 480.0) -> float:
        """
        Calculates exact physical distance in meters using Pinhole Camera Geometry.
        Distance = (Real_Height * Focal_Length) / BBox_Height_px
        """
        clean_label = label.lower().strip()
        real_h = self.real_object_heights.get(clean_label, 0.25)
        if bbox_height_px <= 1.0:
            return 1.0
        dist = (real_h * self.focal_length_px) / bbox_height_px
        return max(0.15, min(5.0, round(dist, 2)))

    def calculate_spatial_vector(
        self, 
        bbox: Tuple[int, int, int, int], 
        frame_width: int = 640, 
        frame_height: int = 480,
        object_label: str = "object"
    ) -> SpatialVector:
        x, y, w, h = bbox
        center_x = x + (w / 2.0)
        center_y = y + (h / 2.0)

        # Normalize x (-1.0 hard left, 0.0 center, +1.0 hard right)
        dx = max(-1.0, min(1.0, (center_x - (frame_width / 2.0)) / (frame_width / 2.0)))

        # Normalize y (-1.0 bottom, 0.0 center, +1.0 top)
        dy = max(-1.0, min(1.0, ((frame_height / 2.0) - center_y) / (frame_height / 2.0)))

        # Estimate distance in meters
        dz = self.estimate_distance_meters(object_label, h, frame_height)

        return SpatialVector(dx=round(dx, 3), dy=round(dy, 3), dz=round(dz, 2))

    def sonify_spatial_vector(self, vector: SpatialVector, label: str = "object") -> AudioSonificationParameters:
        pan = max(-1.0, min(1.0, vector.dx))
        normalized_dy = (vector.dy + 1.0) / 2.0
        frequency_hz = round(261.63 + (normalized_dy * (880.0 - 261.63)), 2)

        norm_dz = max(0.0, min(1.0, (vector.dz - 0.15) / (3.5 - 0.15)))
        pulse_interval_ms = int(50 + (norm_dz * (600 - 50)))

        is_centered = abs(vector.dx) <= self.lock_angular_threshold and abs(vector.dy) <= self.lock_angular_threshold
        is_close = vector.dz <= self.lock_distance_threshold
        is_locked = is_centered and is_close

        distance_score = max(0.0, 1.0 - (vector.dz / 3.0)) * 0.5
        alignment_score = max(0.0, 1.0 - (math.sqrt(vector.dx**2 + vector.dy**2) / 1.414)) * 0.5
        proximity_pct = round((distance_score + alignment_score) * 100.0, 1)

        clean_name = label.replace("_", " ").title()
        if is_locked:
            guidance_cue = f"{clean_name} locked. Touch distance ahead."
        else:
            cue_parts = []
            if vector.dx < -0.2:
                cue_parts.append("to your right")
            elif vector.dx > 0.2:
                cue_parts.append("to your left")
            
            if vector.dy < -0.2:
                cue_parts.append("higher up")
            elif vector.dy > 0.2:
                cue_parts.append("lower down")

            dist_str = f"{vector.dz} meters away" if vector.dz >= 1.0 else f"{int(vector.dz * 100)} centimeters away"
            dir_str = " ".join(cue_parts) if cue_parts else "straight ahead"
            guidance_cue = f"{clean_name} is {dist_str}, {dir_str}."

        return AudioSonificationParameters(
            pan=round(pan, 3),
            frequency_hz=frequency_hz,
            pulse_interval_ms=pulse_interval_ms,
            is_locked=is_locked,
            proximity_percentage=proximity_pct,
            guidance_cue=guidance_cue
        )
