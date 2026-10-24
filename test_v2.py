"""
EchoBuddy Pro V2 - Automated Unit & Integration Test Suite
Verifies all V2 vision, spatial, and bilingual narration capabilities.
"""
import io
import unittest
import numpy as np
from PIL import Image

from app.spatial_engine import EchoBuddySpatialEngine, SpatialVector
from app.vision_engine import EchoBuddyVisionEngine

class TestEchoBuddyV2(unittest.TestCase):
    def setUp(self):
        self.spatial_engine = EchoBuddySpatialEngine()
        self.vision_engine = EchoBuddyVisionEngine()

    def test_spatial_engine_vector_and_pinhole(self):
        """Test pinhole camera distance and spatial vector calculations."""
        # A bottle 120px tall on a 480px frame
        dist = self.spatial_engine.estimate_distance_meters("bottle", 120.0, 480.0)
        self.assertAlmostEqual(dist, (0.24 * 600.0) / 120.0, places=2)

        # Center vector test
        vec = self.spatial_engine.calculate_spatial_vector(
            bbox=(270, 190, 100, 100),
            frame_width=640,
            frame_height=480,
            object_label="bottle"
        )
        self.assertEqual(vec.dx, 0.0)
        self.assertEqual(vec.dy, 0.0)
        self.assertGreater(vec.dz, 0.0)

    def test_spatial_engine_sonification(self):
        """Test audio parameters sonification."""
        vec = SpatialVector(dx=0.0, dy=0.0, dz=0.25)
        params = self.spatial_engine.sonify_spatial_vector(vec, "bottle")
        self.assertTrue(params.is_locked)
        self.assertIn("locked", params.guidance_cue.lower())

        vec_far = SpatialVector(dx=0.5, dy=0.0, dz=2.0)
        params_far = self.spatial_engine.sonify_spatial_vector(vec_far, "cell phone")
        self.assertFalse(params_far.is_locked)
        self.assertIn("left", params_far.guidance_cue.lower())

    def test_vision_engine_scene_description_english(self):
        """Test English scene description (V1 preservation)."""
        objects = [
            {"label": "bottle", "distance_m": 0.8, "position": "left"},
            {"label": "chair", "distance_m": 1.5, "position": "right"}
        ]
        desc = self.vision_engine.generate_scene_description(objects, lang="en")
        self.assertIn("In front of you, I see", desc)
        self.assertIn("bottle 0.8 meters away on your left", desc)
        self.assertIn("chair 1.5 meters away on your right", desc)

        empty_desc = self.vision_engine.generate_scene_description([], lang="en")
        self.assertEqual(empty_desc, "The path ahead appears clear. No specific objects identified.")

    def test_vision_engine_scene_description_hindi(self):
        """Test Hindi scene description (V2 enhancement)."""
        objects = [
            {"label": "bottle", "distance_m": 0.8, "position": "left"},
            {"label": "cell phone", "distance_m": 0.5, "position": "center"}
        ]
        desc = self.vision_engine.generate_scene_description(objects, lang="hi")
        self.assertIn("बोतल", desc)
        self.assertIn("मोबाइल फ़ोन", desc)
        self.assertIn("बाईं ओर", desc)

        empty_desc = self.vision_engine.generate_scene_description([], lang="hi")
        self.assertIn("साफ़", empty_desc)

    def test_vision_engine_confidence_awareness(self):
        """Test confidence-aware qualified narration ('possible' when confidence < 0.70)."""
        objects = [
            {"label": "bottle", "distance_m": 0.8, "position": "left", "confidence": 0.55},
            {"label": "chair", "distance_m": 1.5, "position": "right", "confidence": 0.92}
        ]
        desc = self.vision_engine.generate_scene_description(objects, lang="en")
        self.assertIn("a possible bottle", desc)
        self.assertIn("a chair", desc)

        desc_hi = self.vision_engine.generate_scene_description(objects, lang="hi")
        self.assertIn("संभवतः", desc_hi)

    def test_vision_engine_process_frame(self):
        """Test frame image byte processing."""
        # Create a synthetic 640x480 test image with a bright rectangle
        img = Image.new("RGB", (640, 480), color=(30, 30, 30))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        raw_bytes = buf.getvalue()

        result = self.vision_engine.process_frame(raw_bytes, "bottle")
        self.assertTrue(result["found"])
        self.assertIsNotNone(result["bbox"])
        self.assertEqual(result["frame_width"], 640)
        self.assertEqual(result["frame_height"], 480)

if __name__ == "__main__":
    unittest.main()
