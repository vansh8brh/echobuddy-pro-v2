# 🎙️ EchoBuddy Pro V2 — Voice-First AI Spatial Perception & Accessibility Platform

> **Production-Grade Accessibility & Spatial Perception Platform for Blind and Visually Impaired Users**

**EchoBuddy Pro V2** is an advanced, voice-first autonomous AI spatial perception platform designed specifically for blind and visually impaired (BVI) individuals.

Built with **TensorFlow.js Real-Time Neural Vision**, **Pinhole Camera Optical Depth Measurement**, **Web Audio 3D Sonification**, **Bilingual Voice Command Engine (English & हिन्दी)**, **Screen-Reader Accessibility (WCAG 2.1 AAA)**, and **Tactile Haptic Pulses**, EchoBuddy Pro V2 delivers complete digital independence with zero hardware barriers.

---

## 🌟 Core Features in EchoBuddy Pro V2

1. **🎙️ Voice-First Hero Interface:**
   - Giant high-contrast accessible microphone hero button (`[Spacebar]` or `[V]`).
   - Clear verbal and visual feedback on microphone states (*Listening*, *Processing*, *Speaking*, *Errors*).
   - **No automatic microphone activation without permission** (prevents browser lockouts).

2. **🧠 Smart Scene Memory (AI Spatial Awareness):**
   - Maintains a short-lived scene state in memory with 3-frame temporal confirmation to eliminate detection flicker.
   - Summarizes active surroundings on demand (*"Describe my surroundings"*, *"आसपास क्या है?"*, shortcut: `D`).
   - **Meaningful Delta Change Narration**: Informs the user when new objects enter view or confirmed objects disappear without audio spam (e.g., *"A new object, possibly a bag, has appeared on your left"*).
   - Instant memory reset (*"Clear scene memory"*, shortcut: `X`).
   - *Assistive safety disclaimer: Scene Memory provides assistive descriptions only and does not predict hazards or guarantee safe walking.*

3. **🎯 Smart Object Finder (Voice-Guided Search):**
   - Active voice-guided target tracking (*"Find my bottle"*, *"फोन कहाँ है"*, *"Where is my laptop"*).
   - Directional guidance with qualified distances (*"I can see a possible bottle near your center, approximately 0.8 meters away"*).
   - **Truthful Non-Hallucinating Feedback**: Never invents object locations. If target is out of view, provides paced guidance: *"I cannot identify a bottle right now. Try slowly turning the camera."*
   - Immediate cancellation (*"Cancel search"*, *"खोज बंद करो"*, or Cancel button).

4. **🇮🇳 Bilingual Command & Narration Support (English & हिन्दी):**
   - Natural spoken command support in both **English** and **Hindi**:
     - *"What do you see?"* / *"क्या दिख रहा है?"*
     - *"Describe surroundings"* / *"आसपास क्या है?"*
     - *"Help"* / *"मदद"* / *"सहायता"*
     - *"Repeat that"* / *"फिर से बोलो"* / *"दोहराओ"*
     - *"Stop speaking"* / *"बोलना बंद करो"* / *"चुप रहो"*
     - *"Find bottle"* / *"बोतल ढूंढो"* / *"फ़ोन कहाँ है"*

5. **⌨️ Accessible Keyboard Navigation:**
   - Single-key instant shortcuts for blind users:
     - `Space` or `V`: Activate microphone / speak command
     - `S`: Instant room scan (*"What do you see?"*)
     - `D`: Describe surroundings (*Scene Memory*)
     - `X`: Clear scene memory
     - `R`: Repeat last spoken announcement
     - `Esc`: Stop speaking immediately
     - `H`: Speak help and available commands
     - `M`: Mute / unmute spatial sonar audio
     - `L`: Switch language between English and हिन्दी
     - `C`: Toggle High Contrast mode

6. **♿ Blind-Friendly Accessibility (WCAG 2.1 AAA):**
   - ARIA live announcement regions (`role="status"`, `aria-live="assertive"`).
   - High Contrast theme with pure black `#000000`, bright yellow `#ffff00`, and neon green indicators.
   - Text size scaling mode for low-vision users.
   - Skip to main content link for screen-reader navigation.
   - Spoken explanations for permissions, errors, and camera states.

7. **👁️ Truthful Real-Time AI Perception (Zero Hallucination):**
   - Direct integration with TensorFlow.js client-side COCO-SSD object detection.
   - Paced inference at ~8 FPS ($120\text{ms}$) to guarantee smooth rendering without GPU overheating.
   - IoU-based Non-Maximum Suppression to remove duplicate bounding boxes.
   - Genuine distance calculation using pinhole camera optical geometry.

---

## 💻 Quick Start & Running Locally

### 1. Requirements
- Python 3.10+
- Modern Web Browser (Google Chrome or Microsoft Edge recommended for Web Speech and SpeechRecognition APIs)

### 2. Installation
```bash
# Clone the repository
git clone <YOUR_NEW_REPOSITORY_URL>
cd EchoBuddy-Pro

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Launching the Local Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*(Alternatively on Windows, double-click `run.bat`)*

Then open your browser at **`http://127.0.0.1:8000`**. Grant camera and microphone permissions when prompted, or press <kbd>Spacebar</kbd> to begin.

---

## 🧪 Testing & Verification Suites

Run the automated verification suites:

```bash
# 1. Unit & Integration Tests (Spatial & Vision engines, pinhole depth, bilingual narration)
python test_v2.py

# 2. FastAPI Endpoint Verification Suite
python test_api_v2.py

# 3. Vision Perception Benchmarking Suite (Lighting, Occlusion, Clutter, Scale)
python benchmark_vision.py
```

---

## 📡 API Reference

### 1. Platform Health Check
`GET /api/v1/health`

```json
{
  "status": "healthy",
  "platform": "EchoBuddy Accessibility Platform",
  "version": "2.1.0-v2",
  "vision_engine": "TensorFlow.js & OpenCV active",
  "voice_navigation": "operational (English & Hindi V2)"
}
```

### 2. Ambient Scene Reader API (Bilingual)
`POST /api/v1/scene-describe`

```json
{
  "objects": [
    {"label": "bottle", "distance_m": 0.8, "position": "left", "confidence": 0.92},
    {"label": "cell phone", "distance_m": 0.4, "position": "center", "confidence": 0.65}
  ],
  "lang": "en"
}
```

**Response:**
```json
{
  "speech_narration": "In your surroundings, I detect a bottle 0.8 meters away on your left, and a possible cell phone 0.4 meters away on your center.",
  "object_count": 2,
  "language": "en"
}
```

### 3. Spatial Sonification API
`POST /api/v1/sonify`

```json
{
  "dx": -0.35,
  "dy": 0.50,
  "dz": 0.85,
  "target_name": "bottle"
}
```

---

## 📁 Project Structure

```
EchoBuddy-Pro/
├── app/
│   ├── main.py             # FastAPI Server & REST/WebSocket Endpoints
│   ├── spatial_engine.py   # Pinhole Camera Depth & Audio Sonification Engine
│   └── vision_engine.py    # Vision Engine & Bilingual Narration Generator
├── static/
│   ├── index.html          # Accessible Voice-First UI with ARIA live regions
│   ├── style.css           # WCAG 2.1 AAA High-Contrast & Glassmorphic Design
│   ├── app.js              # TF.js Vision, Scene Memory, Finder & Speech Synthesizer
│   └── presentation.html   # Pitch Deck Presentation
├── test_v2.py              # Automated Unit & Integration Tests
├── test_api_v2.py          # FastAPI Endpoint Verification Suite
├── benchmark_vision.py     # Optical Perception Robustness Benchmarking Suite
├── AUDIT_REPORT.md         # Technical Audit of Vision Architecture
├── DATASET_EVALUATION.md   # Dataset Evaluation Matrix (COCO, Open Images, LVIS)
├── requirements.txt        # Python Dependencies
├── run.bat                 # Windows One-Click Launch Script
├── Procfile                # Production Process Definition
├── Dockerfile              # Container Configuration
└── README.md               # Complete Project Documentation
```
