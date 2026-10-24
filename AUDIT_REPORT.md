# EchoBuddy Pro — Vision System Technical Audit (Phase 1)

## 1. Model & Architecture Identification

### Client-Side Neural Vision
- **Model Framework:** TensorFlow.js (`@tensorflow/tfjs@4.17.0`)
- **Detection Architecture:** Single Shot Multibox Detector (SSD) with MobileNet (`@tensorflow-models/coco-ssd@2.2.3`)
- **Execution Backend:** WebGL GPU accelerated pipeline inside the browser.
- **Inference Mode:** Client-side, privacy-preserving (no video frames transmitted to external cloud).

### Supported Object Classes
- **Dataset:** Microsoft COCO (80 distinct common categories).
- **Categories:**
  - *Persons & Animals:* person, bird, cat, dog, horse, sheep, cow, elephant, bear, zebra, giraffe
  - *Vehicles & Mobility:* bicycle, car, motorcycle, airplane, bus, train, truck, boat, traffic light, fire hydrant, stop sign, parking meter, bench
  - *Personal & Household Items:* backpack, umbrella, handbag, tie, suitcase, bottle, wine glass, cup, fork, knife, spoon, bowl, chair, couch, potted plant, bed, dining table, toilet, tv, laptop, mouse, remote, keyboard, cell phone, microwave, oven, toaster, sink, refrigerator, book, clock, vase, scissors, teddy bear, hair drier, toothbrush
  - *Food:* banana, apple, sandwich, orange, broccoli, carrot, hot dog, pizza, donut, cake
  - *Sports:* frisbee, skis, snowboard, sports ball, kite, baseball bat, baseball glove, skateboard, surfboard, tennis racket

### Backend Vision & Spatial Architecture
- **Vision Engine (`app/vision_engine.py`):** Server-side saliency/edge-gradient contour detector using PIL and NumPy. Generates verbal scene descriptions (`generate_scene_description()`) in English and Hindi.
- **Spatial Engine (`app/spatial_engine.py`):** Pinhole camera depth model calculating estimated real distance:
  $$\text{Distance} = \frac{\text{Physical Height (m)} \times \text{Focal Length (px)}}{\text{Bounding Box Height (px)}}$$
  and stereo panning parameter $dx \in [-1.0, 1.0]$.

---

## 2. Technical Inspection of Parameters & Pipelines

| Parameter | Current Setting | Observed Limitation |
| :--- | :--- | :--- |
| **Input Resolution** | 640 $\times$ 480 px (environment facing) | Standard definition; small objects (< 30px) lack sufficient pixel density for high confidence. |
| **Inference Frequency** | `requestAnimationFrame` (unthrottled) | Causes unnecessary CPU/GPU battery drain and frame pacing issues on mobile devices. |
| **Confidence Threshold** | Default TF.js coco-ssd (`minScore = 0.50`) | Binary pass/fail with no distinction between strong detections ($\ge 0.70$) and uncertain detections ($0.45 - 0.69$). |
| **Temporal Filtering** | None (instantaneous per-frame) | Detection flicker across consecutive frames causes rapid UI jitter and unreliable audio triggers. |
| **Scene State Memory** | None (stateless) | Cannot inform user of scene changes (e.g. "a new object appeared on your left"). |
| **Distance Estimation** | Pinhole optical approximation | Assumes standard upright object orientation; tilted or occluded objects have distorted distance estimates. |

---

## 3. Root Cause Analysis of Detection Failures

1. **Detection Flickering:** Due to frame-by-frame independent prediction without temporal smoothing, an object on the edge of the detection threshold fluctuates between present and absent on alternate frames.
2. **Small & Distant Objects:** COCO-SSD feature pyramid downsamples small regions; objects occupying $< 5\%$ of the frame area often drop below 50% confidence.
3. **Occlusion & Lighting Extremes:** Objects partially obstructed by hands or placed in dark environments suffer severe confidence drops because edges and key feature anchors are lost.
4. **Vocabulary Gaps:** Common items such as *keys*, *wallet*, *spectacles/glasses*, and *door handles* are not among the 80 COCO classes.
5. **Lack of Uncertainty Communication:** Speech previously either claimed certainty or remained silent, rather than communicating "Possible object" when confidence is moderate.
