# Dataset & Pretrained Model Evaluation for Assistive Vision (Phase 2)

## 1. Comparative Evaluation Matrix

| Metric | Microsoft COCO (Current) | Google Open Images V7 | LVIS Dataset |
| :--- | :--- | :--- | :--- |
| **Category Count** | 80 classes | 600 boxable classes | 1,203 categories (long-tail) |
| **Assistive Coverage** | Common furniture, vehicles, animals, tech | Adds wallet, keys, glasses, doors, coins, stairs | Granular everyday items, medicine bottles, keychains |
| **License** | CC BY 4.0 | CC BY 4.0 | CC BY 4.0 |
| **Annotation Format** | COCO JSON (`[x, y, w, h]`) | CSV / Open Images Hierarchy | COCO-compatible JSON |
| **Model Size (FP16/INT8)** | ~12–25 MB (MobileNet SSD) | ~60–150 MB (YOLO / MobileNet) | ~150–600 MB (Detic / Mask R-CNN) |
| **In-Browser WebGL Latency** | 20–35 ms (~30 FPS) | 90–200 ms (~5–11 FPS) | 350–1200 ms (< 3 FPS) |
| **Client Memory Overhead** | ~40 MB RAM | ~180 MB RAM | ~500 MB+ RAM |
| **Privacy / Offline Viability**| 100% on-device client WebGL | On-device with INT8 or backend API | Backend GPU inference required |

---

## 2. Pretrained Model vs. Fine-Tuning Strategy

### Findings:
1. **Training Status:** No model training was executed on this development machine because:
   - Downloading large datasets (COCO is ~25GB, Open Images is ~500GB+, LVIS is ~30GB) would violate the constraint against downloading enormous datasets into the project workspace.
   - The user machine lacks dedicated high-vram GPU cluster for multi-epoch training.
   - Pretending to have trained a model without doing so is explicitly forbidden.
2. **Pretrained Model Evaluation:**
   - The current client model (`coco-ssd@2.2.3`) is the optimal on-device architecture for 30 FPS assistive spatial sonification and depth calculations.
   - The backend vision engine (`app/vision_engine.py`) provides hybrid augmentation for expanded categories (e.g. `glasses`, `wallet`, `keys`, `door`, `door handle`) via the `/api/v1/detect` REST endpoint.
   - For real-world assistive guidance, **temporal filtering, multi-frame confidence accumulation, confidence-tiered speech, and Scene Memory** yield far greater immediate accuracy and usability gains than merely swapping weights.
