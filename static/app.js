/**
 * EchoBuddy Pro V2 — Voice-First AI Spatial Perception & Accessibility Platform
 * Designed for Blind and Visually Impaired Users
 * Features:
 *  - Real-Time Neural Object Detection (TF.js COCO-SSD)
 *  - Confidence-Tiered Perception (High >= 0.70, Moderate 0.45-0.69)
 *  - Non-Maximum Suppression / IoU Deduplication
 *  - Temporal Confirmation (Anti-Flicker Filter)
 *  - Smart Scene Memory (Delta Change Summaries & Short-Lived Scene State)
 *  - Smart Object Finder (Target Guidance & Non-Hallucination Fallback)
 *  - Stereo Audio Sonification & Pinhole Distance Geometry
 *  - Bilingual English & हिन्दी Voice Interface
 */

// ============================================================
// 1. Web Audio Spatial Sonar Synthesizer
// ============================================================
class WebAudioSpatialSynthesizer {
    constructor() {
        this.ctx = null;
        this.osc = null;
        this.panner = null;
        this.gain = null;
        this.isEnabled = true;
        
        this.currentPan = 0.0;
        this.currentFreq = 550.0;
        this.currentPulseInterval = 300;
        this.isLocked = false;
        this.isMuted = false;
    }

    init() {
        if (this.ctx) {
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return;
        }
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sine';
        this.osc.frequency.value = 550;

        if (this.ctx.createStereoPanner) {
            this.panner = this.ctx.createStereoPanner();
            this.panner.pan.value = 0.0;
        } else {
            this.panner = this.ctx.createGain();
        }

        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.0;

        this.osc.connect(this.panner);
        this.panner.connect(this.gain);
        this.gain.connect(this.ctx.destination);

        this.osc.start();
        this.isEnabled = true;
        this.startPulseLoop();
    }

    updateParameters(pan, freqHz, pulseMs, isLocked) {
        if (!this.ctx || !this.isEnabled || this.isMuted) return;
        this.currentPan = pan;
        this.currentFreq = freqHz;
        this.currentPulseInterval = Math.max(50, pulseMs);
        this.isLocked = isLocked;

        const now = this.ctx.currentTime;
        if (this.panner && this.panner.pan) {
            this.panner.pan.setTargetAtTime(pan, now, 0.03);
        }
        if (this.osc) {
            this.osc.frequency.setTargetAtTime(freqHz, now, 0.03);
        }
    }

    startPulseLoop() {
        const triggerBeep = () => {
            if (!this.isEnabled || !this.ctx || this.isMuted) {
                setTimeout(triggerBeep, 200);
                return;
            }
            const now = this.ctx.currentTime;
            
            if (this.isLocked) {
                this.gain.gain.setTargetAtTime(0.35, now, 0.01);
            } else {
                this.gain.gain.setValueAtTime(0.25, now);
                this.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
            }

            setTimeout(triggerBeep, this.isLocked ? 90 : this.currentPulseInterval);
        };
        triggerBeep();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted && this.gain && this.ctx) {
            this.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
        }
        return !this.isMuted;
    }
}

// ============================================================
// 2. Bilingual Dictionaries & Vocabulary (English & Hindi)
// ============================================================
const HINDI_OBJECT_MAP = {
    "बोतल": "bottle",
    "पानी की बोतल": "bottle",
    "फोन": "cell phone",
    "फ़ोन": "cell phone",
    "मोबाइल": "cell phone",
    "मोबाइल फोन": "cell phone",
    "मोबाइल फ़ोन": "cell phone",
    "लैपटॉप": "laptop",
    "कंप्यूटर": "laptop",
    "कुर्सी": "chair",
    "कप": "cup",
    "मग": "cup",
    "किताब": "book",
    "पुस्तक": "book",
    "चश्मा": "glasses",
    "चाबी": "keys",
    "चाबियां": "keys",
    "चाबियाँ": "keys",
    "बैग": "backpack",
    "बस्ता": "backpack",
    "माउस": "mouse",
    "कीबोर्ड": "keyboard",
    "इंसान": "person",
    "आदमी": "person",
    "व्यक्ति": "person",
    "दरवाजा": "door",
    "दरवाज़ा": "door",
    "घड़ी": "clock",
    "घड़ी": "clock",
    "रिमोट": "remote",
    "कैंची": "scissors",
    "मेज़": "table",
    "मेज": "table"
};

const ENGLISH_TO_HINDI_OBJECT = {
    "bottle": "बोतल",
    "cell phone": "मोबाइल फ़ोन",
    "laptop": "लैपटॉप",
    "chair": "कुर्सी",
    "cup": "कप",
    "book": "किताब",
    "glasses": "चश्मा",
    "keys": "चाबी",
    "backpack": "बैग",
    "person": "व्यक्ति",
    "mouse": "माउस",
    "keyboard": "कीबोर्ड",
    "clock": "घड़ी",
    "door": "दरवाज़ा",
    "remote": "रिमोट",
    "scissors": "कैंची",
    "table": "मेज़"
};

const PHYSICAL_OBJECT_HEIGHTS = {
    "bottle": 0.24,
    "water bottle": 0.25,
    "cup": 0.12,
    "cell phone": 0.15,
    "mobile": 0.15,
    "laptop": 0.25,
    "mouse": 0.04,
    "keyboard": 0.15,
    "book": 0.22,
    "chair": 0.90,
    "person": 1.70,
    "backpack": 0.45,
    "scissors": 0.18,
    "remote": 0.18,
    "clock": 0.25,
    "keys": 0.08,
    "wallet": 0.10,
    "glasses": 0.05,
    "door": 2.00,
    "table": 0.75
};

// Confidence Tier Configuration
const CONFIDENCE_TIER = {
    HIGH: 0.70,
    MODERATE: 0.45,
    MIN_THRESHOLD: 0.45
};

// ============================================================
// 3. Application State
// ============================================================
const synth = new WebAudioSpatialSynthesizer();
let speechEnabled = true;
let hapticsEnabled = true;
let handsFreeActive = false; // Accessibility: NO automatic activation without user consent
let cocoModel = null;
let currentTargetName = "bottle";
let currentMode = 'cam'; // 'cam' | 'sim' | 'api'
let currentLang = 'en'; // 'en' | 'hi'

let lastSpokenTime = 0;
let lastSpokenText = "EchoBuddy Pro V2 ready. Press Spacebar or speak a command.";
let lastDetectedObjects = [];
let targetObjSim = { x: 320, y: 240, z: 1.25 };
let isCameraActive = false;
let isStartingCamera = false;
let isMicListening = false;
let highContrastActive = false;
let largeTextActive = false;

// ============================================================
// 4. DOM Elements
// ============================================================
const video = document.getElementById('webcam-video');
const detectCanvas = document.getElementById('detection-canvas');
const detectCtx = detectCanvas ? detectCanvas.getContext('2d') : null;
const sonarCanvas = document.getElementById('sonar-canvas');
const sonarCtx = sonarCanvas ? sonarCanvas.getContext('2d') : null;

// Hero Voice Elements
const btnMicHero = document.getElementById('btn-mic-hero');
const micStatusHeadline = document.getElementById('mic-status-headline');
const micStatusSubtext = document.getElementById('mic-status-subtext');
const micFeedbackBanner = document.getElementById('mic-feedback-banner');
const micFeedbackText = document.getElementById('mic-feedback-text');
const btnBannerDismiss = document.getElementById('btn-banner-dismiss');
const langIndicatorBadge = document.getElementById('lang-indicator-badge');
const speechModeTag = document.getElementById('speech-mode-tag');
const speechLangCode = document.getElementById('speech-lang-code');

// Action Buttons
const btnCmdSee = document.getElementById('btn-cmd-see');
const btnCmdMemory = document.getElementById('btn-cmd-memory');
const btnCmdClearMem = document.getElementById('btn-cmd-clear-mem');
const btnCmdHelp = document.getElementById('btn-cmd-help');
const btnCmdRepeat = document.getElementById('btn-cmd-repeat');
const btnCmdStop = document.getElementById('btn-cmd-stop');

// Smart Finder UI
const finderStatusBar = document.getElementById('finder-status-bar');
const finderStatusText = document.getElementById('finder-status-text');
const btnCancelFinder = document.getElementById('btn-cancel-finder');

// Smart Scene Memory UI
const memoryItemsList = document.getElementById('memory-items-list');

// Accessibility & Controls
const btnToggleContrast = document.getElementById('btn-toggle-contrast');
const btnToggleLanguage = document.getElementById('btn-toggle-language');
const btnToggleTextSize = document.getElementById('btn-toggle-text-size');
const btnToggleVoiceAgent = document.getElementById('btn-toggle-voice-agent');
const btnAudio = document.getElementById('btn-toggle-audio');
const btnSpeech = document.getElementById('btn-toggle-speech');
const btnHaptics = document.getElementById('btn-toggle-haptics');
const aiStatus = document.getElementById('ai-vision-status');

// Screen Reader & Feedback
const srAnnouncements = document.getElementById('sr-announcements');
const srGuidance = document.getElementById('sr-guidance');
const speechLog = document.getElementById('speech-log');
const detectedObjectsList = document.getElementById('detected-objects-list');
const guidanceBanner = document.getElementById('guidance-banner');
const lockOverlay = document.getElementById('lock-overlay');

// Target Controls
const customTargetInput = document.getElementById('custom-target-input');
const btnSetTarget = document.getElementById('btn-set-target');
const btnVoiceCmd = document.getElementById('btn-voice-command');

// Telemetry
const valPan = document.getElementById('val-pan');
const valDist = document.getElementById('val-dist');
const valProx = document.getElementById('val-prox');
const valDx = document.getElementById('val-dx');
const valDy = document.getElementById('val-dy');
const valDz = document.getElementById('val-dz');
const meterPan = document.getElementById('meter-pan');
const meterDist = document.getElementById('meter-dist');
const meterProx = document.getElementById('meter-prox');

// ============================================================
// 5. Detection Filtering & Deduplication (IoU / Non-Max Suppression)
// ============================================================
function computeIoU(boxA, boxB) {
    const [x1, y1, w1, h1] = boxA;
    const [x2, y2, w2, h2] = boxB;
    const interX = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
    const interY = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));
    const interArea = interX * interY;
    const unionArea = (w1 * h1) + (w2 * h2) - interArea;
    return unionArea > 0 ? interArea / unionArea : 0;
}

function filterAndDeduplicate(predictions) {
    // 1. Remove detections below minimum confidence threshold
    const valid = predictions.filter(p => p.score >= CONFIDENCE_TIER.MIN_THRESHOLD);
    // 2. Sort by confidence descending
    valid.sort((a, b) => b.score - a.score);

    // 3. Remove duplicate overlapping bounding boxes of the same class
    const kept = [];
    for (const pred of valid) {
        let isDuplicate = false;
        for (const existing of kept) {
            if (pred.class.toLowerCase() === existing.class.toLowerCase()) {
                if (computeIoU(pred.bbox, existing.bbox) > 0.40) {
                    isDuplicate = true;
                    break;
                }
            }
        }
        if (!isDuplicate) {
            kept.push(pred);
        }
    }
    return kept;
}

// ============================================================
// 6. Smart Scene Memory Manager (Phase 4)
// ============================================================
class SceneMemoryManager {
    constructor() {
        this.confirmedObjects = new Map(); // key -> { class, position, distance_m, confidenceTier, firstSeen, lastSeen }
        this.candidateTrackers = new Map(); // key -> { sightings: number, unseenCount: number, latest: object }
        this.CONFIRMATION_FRAMES = 3; // Temporal stability: must appear in 3 cycles
        this.EXPIRATION_FRAMES = 6;    // Unseen in 6 cycles (~1.2s) -> departed
        this.lastDeltaAnnouncementTime = 0;
        this.DELTA_COOLDOWN_MS = 6000; // Summarize changes without spamming
    }

    clear() {
        this.confirmedObjects.clear();
        this.candidateTrackers.clear();
        this.updateUI();
        const msg = currentLang === 'hi' 
            ? "सीन मेमोरी साफ़ कर दी गई है।" 
            : "Scene memory has been cleared.";
        announceVoice(msg, true);
    }

    update(rawDetections) {
        const currentKeys = new Set();
        const deltas = [];

        rawDetections.forEach(det => {
            const key = `${det.class}_${det.position}`;
            currentKeys.add(key);

            let tracker = this.candidateTrackers.get(key);
            if (!tracker) {
                tracker = { sightings: 1, unseenCount: 0, latest: det };
                this.candidateTrackers.set(key, tracker);
            } else {
                tracker.sightings++;
                tracker.unseenCount = 0;
                tracker.latest = det;
            }

            // Confirm new object if it persists across threshold frames
            if (tracker.sightings >= this.CONFIRMATION_FRAMES && !this.confirmedObjects.has(key)) {
                const confTier = det.score >= CONFIDENCE_TIER.HIGH ? 'high' : 'moderate';
                const confirmedItem = {
                    class: det.class,
                    position: det.position,
                    distance_m: det.distance_m,
                    confidenceTier: confTier,
                    firstSeen: Date.now(),
                    lastSeen: Date.now()
                };
                this.confirmedObjects.set(key, confirmedItem);
                deltas.push({ type: 'appeared', item: confirmedItem });
            } else if (this.confirmedObjects.has(key)) {
                const existing = this.confirmedObjects.get(key);
                existing.distance_m = det.distance_m;
                existing.lastSeen = Date.now();
                if (det.score >= CONFIDENCE_TIER.HIGH) existing.confidenceTier = 'high';
            }
        });

        // Expire candidates and confirmed objects not seen in recent cycles
        for (const [key, tracker] of this.candidateTrackers.entries()) {
            if (!currentKeys.has(key)) {
                tracker.unseenCount++;
                if (tracker.unseenCount >= this.EXPIRATION_FRAMES) {
                    if (this.confirmedObjects.has(key)) {
                        const expired = this.confirmedObjects.get(key);
                        deltas.push({ type: 'disappeared', item: expired });
                        this.confirmedObjects.delete(key);
                    }
                    this.candidateTrackers.delete(key);
                }
            }
        }

        this.updateUI();

        // Handle delta announcements if appropriate
        if (deltas.length > 0) {
            this.handleDeltas(deltas);
        }

        return Array.from(this.confirmedObjects.values());
    }

    handleDeltas(deltas) {
        const now = Date.now();
        if (now - this.lastDeltaAnnouncementTime < this.DELTA_COOLDOWN_MS) return;
        if (smartObjectFinder && smartObjectFinder.isActive) return; // Do not interrupt active target finder
        if (isMicListening) return;

        const appearances = deltas.filter(d => d.type === 'appeared');
        const departures = deltas.filter(d => d.type === 'disappeared');

        if (appearances.length === 0 && departures.length === 0) return;

        let deltaMsg = "";
        if (currentLang === 'hi') {
            if (appearances.length > 0) {
                const a = appearances[0].item;
                const hiName = ENGLISH_TO_HINDI_OBJECT[a.class.toLowerCase()] || a.class;
                const pos = a.position === 'left' ? 'बाईं ओर' : a.position === 'right' ? 'दाईं ओर' : 'सीधे सामने';
                const qualifier = a.confidenceTier === 'moderate' ? "संभवतः " : "";
                deltaMsg = `आपकी ${pos} एक नई वस्तु, ${qualifier}${hiName}, दिखाई दी है।`;
            } else if (departures.length > 0) {
                const d = departures[0].item;
                const hiName = ENGLISH_TO_HINDI_OBJECT[d.class.toLowerCase()] || d.class;
                const pos = d.position === 'left' ? 'बाईं ओर' : d.position === 'right' ? 'दाईं ओर' : 'सामने';
                deltaMsg = `${pos} की ${hiName} अब दिखाई नहीं दे रही है।`;
            }
        } else {
            if (appearances.length > 0) {
                const a = appearances[0].item;
                const qualifier = a.confidenceTier === 'moderate' ? "possibly a " : "a ";
                deltaMsg = `A new object, ${qualifier}${a.class}, has appeared on your ${a.position}.`;
            } else if (departures.length > 0) {
                const d = departures[0].item;
                deltaMsg = `The ${d.class} on your ${d.position} is no longer visible.`;
            }
        }

        if (deltaMsg) {
            this.lastDeltaAnnouncementTime = now;
            announceVoice(deltaMsg, false);
        }
    }

    describeSurroundings() {
        const items = Array.from(this.confirmedObjects.values());
        if (items.length === 0) {
            const msg = currentLang === 'hi'
                ? "सीन मेमोरी: आपके सामने अभी कोई पुष्ट वस्तु नहीं है। कैमरा धीमे घुमाएं।"
                : "Scene Memory: No confirmed objects currently in your immediate surroundings.";
            announceVoice(msg, true);
            return;
        }

        if (currentLang === 'hi') {
            const lines = items.map(it => {
                const name = ENGLISH_TO_HINDI_OBJECT[it.class.toLowerCase()] || it.class;
                const pos = it.position === 'left' ? 'बाईं ओर' : it.position === 'right' ? 'दाईं ओर' : 'सीधे सामने';
                const dist = it.distance_m >= 1.0 ? `${it.distance_m.toFixed(1)} मीटर` : `${Math.round(it.distance_m * 100)} सेमी`;
                const qualifier = it.confidenceTier === 'moderate' ? "संभवतः " : "";
                return `${pos} लगभग ${dist} पर ${qualifier}${name}`;
            });
            announceVoice(`सीन मेमोरी सारांश: ${lines.join(', ')} स्थित हैं।`, true);
        } else {
            const lines = items.map(it => {
                const dist = it.distance_m >= 1.0 ? `${it.distance_m.toFixed(1)} meters` : `${Math.round(it.distance_m * 100)} cm`;
                const qualifier = it.confidenceTier === 'moderate' ? "a possible " : "a ";
                return `${qualifier}${it.class} on your ${it.position}, approximately ${dist} away`;
            });
            announceVoice(`Scene Memory summary: I confirm ${lines.join(', and ')}.`, true);
        }
    }

    updateUI() {
        if (!memoryItemsList) return;
        const items = Array.from(this.confirmedObjects.values());
        if (items.length === 0) {
            memoryItemsList.innerHTML = '<li class="memory-empty">Scene memory is active • Point camera to observe surroundings.</li>';
            return;
        }

        memoryItemsList.innerHTML = items.map(it => {
            const displayName = (currentLang === 'hi' && ENGLISH_TO_HINDI_OBJECT[it.class.toLowerCase()])
                ? ENGLISH_TO_HINDI_OBJECT[it.class.toLowerCase()]
                : it.class;
            const badgeClass = it.confidenceTier === 'moderate' ? 'memory-item-badge moderate' : 'memory-item-badge';
            const qualifier = it.confidenceTier === 'moderate' ? '?' : '✓';
            return `<li class="${badgeClass}"><span>${qualifier} ${displayName}</span> <span>${it.distance_m.toFixed(1)}m (${it.position})</span></li>`;
        }).join('');
    }
}

const sceneMemory = new SceneMemoryManager();

// ============================================================
// 7. Smart Object Finder (Phase 5)
// ============================================================
class SmartObjectFinder {
    constructor() {
        this.isActive = false;
        this.target = null;
        this.lastGuidanceTime = 0;
        this.GUIDANCE_INTERVAL_MS = 7500;
        this.lastFoundNoticeTime = 0;
    }

    startSearch(targetName) {
        this.isActive = true;
        this.target = targetName.toLowerCase().trim();
        this.lastGuidanceTime = Date.now();
        this.lastFoundNoticeTime = 0;

        const displayName = (currentLang === 'hi' && ENGLISH_TO_HINDI_OBJECT[this.target])
            ? ENGLISH_TO_HINDI_OBJECT[this.target]
            : this.target;

        const msg = currentLang === 'hi'
            ? `${displayName} खोज रहा हूँ। कृपया कैमरा धीरे-धीरे घुमाएं।`
            : `Looking for a ${displayName}. Move your camera slowly.`;
        announceVoice(msg, true);
        this.updateUI(true, displayName);
    }

    cancelSearch() {
        if (!this.isActive) return;
        this.isActive = false;
        const msg = currentLang === 'hi' ? "खोज रद्द कर दी गई।" : "Object search cancelled.";
        announceVoice(msg, true);
        this.updateUI(false, null);
    }

    processFrame(confirmedObjects, rawDetections) {
        if (!this.isActive || !this.target) return;

        // Check if target matches in raw or confirmed detections
        const match = rawDetections.find(d => 
            d.class.toLowerCase().includes(this.target) || this.target.includes(d.class.toLowerCase())
        );

        const now = Date.now();

        if (match) {
            // Target is visible in current frame!
            if (now - this.lastFoundNoticeTime >= 3500) {
                this.lastFoundNoticeTime = now;
                this.lastGuidanceTime = now;
                const displayName = (currentLang === 'hi' && ENGLISH_TO_HINDI_OBJECT[match.class.toLowerCase()])
                    ? ENGLISH_TO_HINDI_OBJECT[match.class.toLowerCase()]
                    : match.class;
                const posStr = match.position;
                const distStr = match.distance_m >= 1.0 ? `${match.distance_m.toFixed(1)} meters` : `${Math.round(match.distance_m * 100)} cm`;

                if (currentLang === 'hi') {
                    const hiPos = posStr === 'left' ? 'बाईं ओर' : posStr === 'right' ? 'दाईं ओर' : 'सीधे सामने';
                    const qualifier = match.score < CONFIDENCE_TIER.HIGH ? "संभवतः " : "";
                    announceVoice(`मुझे ${hiPos} लगभग ${distStr} पर ${qualifier}${displayName} दिख रहा है।`, true);
                } else {
                    const qualifier = match.score < CONFIDENCE_TIER.HIGH ? "a possible " : "a ";
                    announceVoice(`I can see ${qualifier}${displayName} near your ${posStr}, approximately ${distStr} away.`, true);
                }
            }
        } else {
            // Target not detected in frame
            if (now - this.lastGuidanceTime >= this.GUIDANCE_INTERVAL_MS) {
                this.lastGuidanceTime = now;
                const displayName = (currentLang === 'hi' && ENGLISH_TO_HINDI_OBJECT[this.target])
                    ? ENGLISH_TO_HINDI_OBJECT[this.target]
                    : this.target;

                const guidanceMsg = currentLang === 'hi'
                    ? `अभी ${displayName} नहीं दिख रहा है। कृपया कैमरा धीरे-धीरे दूसरी दिशा में घुमाएं।`
                    : `I cannot identify a ${displayName} right now. Try slowly turning the camera.`;
                announceVoice(guidanceMsg, true);
            }
        }
    }

    updateUI(active, targetName) {
        if (!finderStatusBar) return;
        if (active) {
            finderStatusBar.classList.remove('hidden');
            if (finderStatusText) {
                finderStatusText.textContent = currentLang === 'hi'
                    ? `🔍 खोज सक्रिय: ${targetName}`
                    : `🔍 Actively Searching: ${targetName}`;
            }
        } else {
            finderStatusBar.classList.add('hidden');
        }
    }
}

const smartObjectFinder = new SmartObjectFinder();

// ============================================================
// 8. Speech Synthesis Engine (Bilingual Spoken Feedback)
// ============================================================
function getVoiceForLanguage(langCode) {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (langCode === 'hi') {
        const hindiVoice = voices.find(v => v.lang.toLowerCase().includes('hi'));
        if (hindiVoice) return hindiVoice;
    }
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
}

function announceVoice(text, force = false, overrideLang = null) {
    const langToUse = overrideLang || currentLang;

    // Update Visual Log
    if (speechLog) speechLog.textContent = `"${text}"`;

    // Screen reader accessible alert
    if (srAnnouncements) {
        srAnnouncements.textContent = text;
    }

    if (!speechEnabled || !('speechSynthesis' in window)) return;

    const now = Date.now();
    if (!force && (now - lastSpokenTime < 3200 || text === lastSpokenText)) {
        return;
    }

    try {
        window.speechSynthesis.cancel();
    } catch (e) {}

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langToUse === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = langToUse === 'hi' ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    const voice = getVoiceForLanguage(langToUse);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
        if (btnMicHero && !isMicListening) {
            btnMicHero.classList.add('speaking');
        }
    };

    utterance.onend = () => {
        if (btnMicHero) btnMicHero.classList.remove('speaking');
    };

    utterance.onerror = (e) => {
        if (btnMicHero) btnMicHero.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
    lastSpokenTime = now;
    lastSpokenText = text;
}

function stopSpeaking() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    if (btnMicHero) btnMicHero.classList.remove('speaking');
    const msg = currentLang === 'hi' ? 'बोलना बंद किया।' : 'Speech stopped.';
    if (speechLog) speechLog.textContent = `"${msg}"`;
    if (srAnnouncements) srAnnouncements.textContent = msg;
}

function triggerHapticPulse(pattern = [100, 50, 100]) {
    if (hapticsEnabled && 'vibrate' in navigator) {
        try { navigator.vibrate(pattern); } catch (e) {}
    }
}

// ============================================================
// 9. Voice Recognition Engine (Hindi & English Support)
// ============================================================
let recognition = null;
let speechRecognitionSupported = false;

function setupSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        speechRecognitionSupported = false;
        showMicFeedback("Speech recognition is not supported in this browser. Please use keyboard shortcuts or buttons.", "error");
        return null;
    }

    speechRecognitionSupported = true;
    const rec = new SpeechRecognition();
    rec.continuous = false; // Turn-by-turn for reliability
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';

    rec.onstart = () => {
        isMicListening = true;
        synth.init(); // Initialize audio context on explicit user gesture
        if (btnMicHero) {
            btnMicHero.classList.add('listening');
            btnMicHero.setAttribute('aria-pressed', 'true');
        }
        if (micStatusHeadline) {
            micStatusHeadline.textContent = currentLang === 'hi' ? "सुन रहा हूँ... बोलिए" : "Listening... Speak now";
        }
        if (micStatusSubtext) {
            micStatusSubtext.textContent = currentLang === 'hi' 
                ? "कमांड बोलें: क्या दिख रहा है?, आसपास क्या है?, मदद, फिर से बोलो"
                : 'Say: "What do you see?", "Describe surroundings", "Help", or "Find [object]"';
        }
        hideMicFeedback();
        triggerHapticPulse([50]);
    };

    rec.onresult = (event) => {
        if (!event.results || !event.results[0]) return;
        const rawTranscript = event.results[0][0].transcript;
        console.log("Voice Command Heard:", rawTranscript);
        processVoiceCommand(rawTranscript);
    };

    rec.onerror = (event) => {
        console.warn("Speech Recognition Error:", event.error);
        isMicListening = false;
        if (btnMicHero) {
            btnMicHero.classList.remove('listening');
            btnMicHero.setAttribute('aria-pressed', 'false');
            btnMicHero.classList.add('error');
            setTimeout(() => btnMicHero.classList.remove('error'), 3000);
        }

        let errorExplanation = "";
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            errorExplanation = currentLang === 'hi'
                ? "माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।"
                : "Microphone permission denied. Please allow microphone access in your browser settings.";
            showMicFeedback(errorExplanation, "error");
            announceVoice(errorExplanation, true);
        } else if (event.error === 'no-speech') {
            errorExplanation = currentLang === 'hi'
                ? "कोई आवाज़ नहीं मिली। फिर से बोलने के लिए स्पेस दबाएं।"
                : "No speech detected. Press Spacebar to try again.";
            showMicFeedback(errorExplanation, "warning");
        } else if (event.error === 'audio-capture') {
            errorExplanation = currentLang === 'hi'
                ? "कोई माइक्रोफ़ोन नहीं मिला।"
                : "No microphone detected on your device.";
            showMicFeedback(errorExplanation, "error");
            announceVoice(errorExplanation, true);
        } else if (event.error === 'network') {
            errorExplanation = currentLang === 'hi'
                ? "वाक् पहचान नेटवर्क त्रुटि। कृपया इंटरनेट कनेक्शन जांचें।"
                : "Network error during speech recognition. Please check your internet connection.";
            showMicFeedback(errorExplanation, "error");
        }
        resetMicHeroText();
    };

    rec.onend = () => {
        isMicListening = false;
        if (btnMicHero) {
            btnMicHero.classList.remove('listening');
            btnMicHero.setAttribute('aria-pressed', 'false');
        }
        resetMicHeroText();

        if (handsFreeActive) {
            setTimeout(() => {
                if (handsFreeActive && !isMicListening) {
                    try { rec.start(); } catch (e) {}
                }
            }, 600);
        }
    };

    return rec;
}

function startListening() {
    if (!speechRecognitionSupported && !recognition) {
        recognition = setupSpeechRecognition();
    }
    if (!recognition) {
        const msg = currentLang === 'hi'
            ? "वाक् पहचान इस ब्राउज़र में उपलब्ध नहीं है। कृपया कीबोर्ड शॉर्टकट का उपयोग करें।"
            : "Speech recognition is not available in this browser. Please use keyboard shortcuts.";
        showMicFeedback(msg, "error");
        announceVoice(msg, true);
        return;
    }

    if (isMicListening) {
        try { recognition.stop(); } catch (e) {}
        return;
    }

    try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        recognition.lang = currentLang === 'hi' ? 'hi-IN' : 'en-US';
        recognition.start();
    } catch (err) {
        console.error("Mic start exception:", err);
    }
}

function resetMicHeroText() {
    if (micStatusHeadline) {
        micStatusHeadline.textContent = currentLang === 'hi' 
            ? "बोलने के लिए [Space] दबाएं या क्लिक करें" 
            : "Press Spacebar or Click to Speak";
    }
    if (micStatusSubtext) {
        micStatusSubtext.textContent = currentLang === 'hi'
            ? 'कमांड: "क्या दिख रहा है?", "आसपास क्या है?", "मदद", "[वस्तु] ढूंढो"'
            : 'Supports "What do you see?", "Describe surroundings", "Help", "Find [object]"';
    }
}

function showMicFeedback(msg, type = "warning") {
    if (!micFeedbackBanner || !micFeedbackText) return;
    micFeedbackText.textContent = msg;
    micFeedbackBanner.className = `mic-feedback-banner ${type}`;
    micFeedbackBanner.classList.remove('hidden');
}

function hideMicFeedback() {
    if (micFeedbackBanner) {
        micFeedbackBanner.classList.add('hidden');
    }
}

if (btnBannerDismiss) {
    btnBannerDismiss.addEventListener('click', hideMicFeedback);
}

// ============================================================
// 10. Voice Command Interpreter (Bilingual & Feature Rich)
// ============================================================
function processVoiceCommand(text) {
    if (!text) return;
    const clean = text.toLowerCase().trim().replace(/[.,!?;:]/g, "");
    console.log("Interpreting Command:", clean);

    // 1. Cancel Object Finder
    if (clean.includes("cancel search") || clean.includes("stop search") || clean.includes("stop finding") || clean.includes("खोज बंद") || clean.includes("रद्द करो") || clean.includes("कैंसिल")) {
        smartObjectFinder.cancelSearch();
        return;
    }

    // 2. Clear Scene Memory
    if (clean.includes("clear memory") || clean.includes("clear scene memory") || clean.includes("reset memory") || clean.includes("मेमोरी साफ़") || clean.includes("क्लियर मेमोरी")) {
        sceneMemory.clear();
        return;
    }

    // 3. Smart Scene Memory: "Describe my surroundings" / "आसपास क्या है?"
    const memoryTriggers = ["describe surroundings", "describe my surroundings", "whats around me", "what is around me", "scene memory", "tell me surroundings", "आसपास क्या है", "आस पास क्या है", "सीन मेमोरी", "चारों तरफ क्या है", "कमरा बताओ"];
    if (memoryTriggers.some(t => clean.includes(t))) {
        sceneMemory.describeSurroundings();
        return;
    }

    // 4. "What do you see?" / "क्या दिख रहा है?"
    const seeEnglish = ["what do you see", "what is in front of me", "whats in front of me", "what is in front", "what do you find", "scan room", "scan surroundings", "describe scene", "look around", "see"];
    const seeHindi = ["क्या दिख रहा है", "क्या दिख रहा", "आगे क्या है", "सामने क्या है", "कमरा स्कैन", "सीन बताओ", "दिखाओ", "क्या है सामने", "क्या देख रहे हो"];
    if (seeEnglish.some(phrase => clean.includes(phrase)) || seeHindi.some(phrase => clean.includes(phrase))) {
        triggerSceneReader();
        return;
    }

    // 5. "Help" / "मदद"
    const helpEnglish = ["help", "commands", "what can i say", "instructions", "how to use", "how does this work"];
    const helpHindi = ["मदद", "सहायता", "कमांड", "हेल्प", "निर्देश", "कैसे इस्तेमाल", "कैसे काम करता"];
    if (helpEnglish.some(phrase => clean === phrase || clean.startsWith(phrase)) || helpHindi.some(phrase => clean.includes(phrase))) {
        triggerHelpSpeech();
        return;
    }

    // 6. "Repeat that" / "फिर से बोलो"
    const repeatEnglish = ["repeat that", "repeat", "say again", "say that again", "what did you say", "pardon"];
    const repeatHindi = ["फिर से बोलो", "दोहराओ", "दोबारा बोलो", "फिर से बताओ", "क्या बोला", "फिर बोलो"];
    if (repeatEnglish.some(phrase => clean.includes(phrase)) || repeatHindi.some(phrase => clean.includes(phrase))) {
        triggerRepeatSpeech();
        return;
    }

    // 7. "Stop speaking" / "बोलना बंद करो"
    const stopEnglish = ["stop speaking", "stop talking", "be quiet", "shut up", "silence", "stop voice", "mute voice", "stop"];
    const stopHindi = ["चुप रहो", "बोलना बंद करो", "शांत रहो", "रुको", "स्टॉप", "बंद करो", "आवाज बंद"];
    if (stopEnglish.some(phrase => clean === phrase || clean.startsWith("stop speaking")) || stopHindi.some(phrase => clean.includes(phrase))) {
        stopSpeaking();
        return;
    }

    // 8. Language Switch
    if (clean.includes("hindi") || clean.includes("हिंदी") || clean.includes("हिन्दी")) {
        setLanguage('hi');
        announceVoice("भाषा बदलकर हिन्दी कर दी गई है।", true, 'hi');
        return;
    }
    if (clean.includes("english") || clean.includes("अंग्रेजी") || clean.includes("अंग्रेज़ी")) {
        setLanguage('en');
        announceVoice("Language switched to English.", true, 'en');
        return;
    }

    // 9. Smart Object Finder (Hindi Object Triggers)
    for (const [hiName, enName] of Object.entries(HINDI_OBJECT_MAP)) {
        if (clean.includes(hiName)) {
            smartObjectFinder.startSearch(enName);
            setTarget(enName, hiName);
            return;
        }
    }

    // 10. Smart Object Finder (English Object Triggers)
    if (clean.startsWith("find") || clean.startsWith("search") || clean.startsWith("where is") || clean.startsWith("locate") || clean.startsWith("track")) {
        let target = clean
            .replace("find my", "")
            .replace("find a", "")
            .replace("find the", "")
            .replace("find", "")
            .replace("search for", "")
            .replace("where is my", "")
            .replace("where is a", "")
            .replace("where is", "")
            .replace("locate", "")
            .replace("track", "")
            .trim();
        if (target) {
            smartObjectFinder.startSearch(target);
            setTarget(target);
            return;
        }
    }

    // 11. Direct target word fallback
    if (PHYSICAL_OBJECT_HEIGHTS[clean]) {
        smartObjectFinder.startSearch(clean);
        setTarget(clean);
        return;
    }

    // Unrecognized command
    const unrecognizedMsg = currentLang === 'hi'
        ? `मुझे समझ नहीं आया: "${text}"। मदद के लिए बोलें: "मदद", "क्या दिख रहा है?", या "आसपास क्या है?"।`
        : `Command not recognized: "${text}". Say "Help" for instructions, or "Describe surroundings".`;
    announceVoice(unrecognizedMsg, true);
}

function triggerHelpSpeech() {
    const helpMsg = currentLang === 'hi'
        ? "इकोबडी वी2 में आपका स्वागत है। उपलब्ध वॉयस कमांड: 'क्या दिख रहा है?' तत्काल सीन के लिए, 'आसपास क्या है?' सीन मेमोरी के लिए, 'मेमोरी साफ़ करो' रीसेट करने के लिए, 'बोतल ढूंढो' ऑब्जेक्ट फाइंडर के लिए, और 'खोज बंद करो'। कीबोर्ड शॉर्टकट: बोलने के लिए स्पेस, सीन स्कैन के लिए एस, सीन मेमोरी के लिए डी, मेमोरी क्लियर के लिए एक्स, दोहराने के लिए आर, और शांत करने के लिए एस्केप दबाएं। कृपया ध्यान दें: यह प्रणाली केवल सहायता के लिए है और सुरक्षित चलने की गारंटी नहीं देती।"
        : "Welcome to EchoBuddy V2. Available voice commands: 'What do you see?' for instant scene reading, 'Describe surroundings' for Scene Memory, 'Clear memory' to reset, 'Find [object]' to start object finder, and 'Cancel search'. Keyboard shortcuts: Spacebar to speak, S for instant scan, D for Scene Memory, X to clear memory, R to repeat, and Escape to stop speaking. Note: EchoBuddy provides assistive cues only and does not predict hazards.";
    announceVoice(helpMsg, true);
    triggerHapticPulse([100, 100]);
}

function triggerRepeatSpeech() {
    if (!lastSpokenText) {
        const msg = currentLang === 'hi' ? "दोहराने के लिए कोई पिछला संदेश नहीं है।" : "No previous announcement to repeat.";
        announceVoice(msg, true);
        return;
    }
    announceVoice(lastSpokenText, true);
}

// ============================================================
// 11. Instant "What Do You See?" Scene Reader
// ============================================================
function triggerSceneReader() {
    if (!lastDetectedObjects || lastDetectedObjects.length === 0) {
        const emptyMsg = currentLang === 'hi'
            ? "कैमरा स्कैन कर रहा है। अभी सामने कोई वस्तु नहीं दिख रही है।"
            : "I am scanning the room. No objects are currently detected in front of the camera.";
        announceVoice(emptyMsg, true);
        return;
    }

    if (currentLang === 'hi') {
        const summaries = lastDetectedObjects.slice(0, 4).map(obj => {
            const hiName = ENGLISH_TO_HINDI_OBJECT[obj.class.toLowerCase()] || obj.class;
            const distStr = obj.distance_m >= 1.0 
                ? `${obj.distance_m.toFixed(1)} मीटर` 
                : `${Math.round(obj.distance_m * 100)} सेंटीमीटर`;
            const posStr = obj.position === 'left' ? 'बाईं ओर' : obj.position === 'right' ? 'दाईं ओर' : 'सीधे सामने';
            const qualifier = obj.score < CONFIDENCE_TIER.HIGH ? "संभवतः " : "";
            return `${posStr} लगभग ${distStr} पर ${qualifier}${hiName}`;
        });

        let fullNarration = "";
        if (summaries.length === 1) {
            fullNarration = `आपके सामने ${summaries[0]} है।`;
        } else if (summaries.length === 2) {
            fullNarration = `आपके सामने ${summaries[0]} और ${summaries[1]} है।`;
        } else {
            fullNarration = `आपके आसपास: ${summaries.join(', ')} स्थित हैं।`;
        }
        announceVoice(fullNarration, true);
    } else {
        const summaries = lastDetectedObjects.slice(0, 4).map(obj => {
            const distStr = obj.distance_m >= 1.0 
                ? `${obj.distance_m.toFixed(1)} meters` 
                : `${Math.round(obj.distance_m * 100)} centimeters`;
            const qualifier = obj.score < CONFIDENCE_TIER.HIGH ? "a possible " : "a ";
            return `${qualifier}${obj.class} ${distStr} away on your ${obj.position}`;
        });

        const fullNarration = `In your surroundings, I detect: ${summaries.join(', ')}.`;
        announceVoice(fullNarration, true);
    }

    triggerHapticPulse([150, 80, 150]);
}

// ============================================================
// 12. Target Setting & Accessibility Handlers
// ============================================================
function setTarget(name, displayNameHindi = null) {
    const clean = name.toLowerCase().trim();
    currentTargetName = clean;
    if (customTargetInput) customTargetInput.value = clean;

    const spokenName = (currentLang === 'hi' && (displayNameHindi || ENGLISH_TO_HINDI_OBJECT[clean]))
        ? (displayNameHindi || ENGLISH_TO_HINDI_OBJECT[clean])
        : clean;

    const confirmationMsg = currentLang === 'hi'
        ? `लक्ष्य ${spokenName} निर्धारित किया गया। खोजने के लिए कैमरा सामने रखें।`
        : `Target set to ${spokenName}. Point camera to search.`;

    announceVoice(confirmationMsg, true);
    triggerHapticPulse([80]);
}

function setLanguage(lang) {
    currentLang = lang === 'hi' ? 'hi' : 'en';
    if (btnToggleLanguage) {
        btnToggleLanguage.textContent = currentLang === 'hi' ? '🌐 Language: हिन्दी' : '🌐 Language: EN';
    }
    if (speechLangCode) {
        speechLangCode.textContent = currentLang === 'hi' ? 'LANG: हिन्दी' : 'LANG: EN';
    }
    if (langIndicatorBadge) {
        langIndicatorBadge.textContent = currentLang === 'hi' ? 'हिन्दी सक्रिय' : 'English Active';
    }
    resetMicHeroText();
    sceneMemory.updateUI();
}

function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'hi' : 'en');
    const msg = currentLang === 'hi' ? "भाषा बदलकर हिन्दी कर दी गई है।" : "Language set to English.";
    announceVoice(msg, true);
}

function toggleHighContrast() {
    highContrastActive = !highContrastActive;
    document.body.classList.toggle('high-contrast', highContrastActive);
    if (btnToggleContrast) {
        btnToggleContrast.textContent = highContrastActive ? '🎨 Contrast: HIGH' : '🎨 Contrast: Normal';
    }
    const msg = highContrastActive ? "High contrast mode enabled." : "High contrast mode disabled.";
    announceVoice(msg, true);
}

function toggleTextSize() {
    largeTextActive = !largeTextActive;
    document.body.classList.toggle('large-text', largeTextActive);
    if (btnToggleTextSize) {
        btnToggleTextSize.textContent = largeTextActive ? '🔍 Text Size: LARGE' : '🔍 Text Size: Normal';
    }
    const msg = largeTextActive ? "Large text mode enabled." : "Normal text mode enabled.";
    announceVoice(msg, true);
}

// ============================================================
// 13. Event Listeners & Keyboard Navigation
// ============================================================
if (btnMicHero) {
    btnMicHero.addEventListener('click', () => {
        startListening();
    });
}

// Quick Action Buttons
if (btnCmdSee) btnCmdSee.addEventListener('click', triggerSceneReader);
if (btnCmdMemory) btnCmdMemory.addEventListener('click', () => sceneMemory.describeSurroundings());
if (btnCmdClearMem) btnCmdClearMem.addEventListener('click', () => sceneMemory.clear());
if (btnCmdHelp) btnCmdHelp.addEventListener('click', triggerHelpSpeech);
if (btnCmdRepeat) btnCmdRepeat.addEventListener('click', triggerRepeatSpeech);
if (btnCmdStop) btnCmdStop.addEventListener('click', stopSpeaking);
if (btnCancelFinder) btnCancelFinder.addEventListener('click', () => smartObjectFinder.cancelSearch());

// Accessibility toggles
if (btnToggleContrast) btnToggleContrast.addEventListener('click', toggleHighContrast);
if (btnToggleLanguage) btnToggleLanguage.addEventListener('click', toggleLanguage);
if (btnToggleTextSize) btnToggleTextSize.addEventListener('click', toggleTextSize);

// Target Controls
if (btnSetTarget) {
    btnSetTarget.addEventListener('click', () => {
        if (customTargetInput && customTargetInput.value.trim()) {
            const val = customTargetInput.value.trim();
            smartObjectFinder.startSearch(val);
            setTarget(val);
        }
    });
}

if (btnVoiceCmd) {
    btnVoiceCmd.addEventListener('click', () => {
        startListening();
    });
}

// Audio & Mode Controls
if (btnAudio) {
    btnAudio.addEventListener('click', () => {
        synth.init();
        const active = synth.toggleMute();
        btnAudio.textContent = active ? '🔊 Spatial Sonar Audio: ON' : '🔇 Spatial Sonar: MUTED';
        btnAudio.style.backgroundColor = active ? '#10b981' : 'rgba(255,255,255,0.1)';
        announceVoice(active ? "Spatial sonar audio unmuted." : "Spatial sonar audio muted.", true);
    });
}

if (btnSpeech) {
    btnSpeech.addEventListener('click', () => {
        speechEnabled = !speechEnabled;
        btnSpeech.textContent = speechEnabled ? '🗣️ Voice Speech Guidance: ON' : '🔇 Voice Speech: OFF';
        if (!speechEnabled) stopSpeaking();
    });
}

if (btnHaptics) {
    btnHaptics.addEventListener('click', () => {
        hapticsEnabled = !hapticsEnabled;
        btnHaptics.textContent = hapticsEnabled ? '📳 Haptic Pulses: ON' : '📳 Haptics: OFF';
    });
}

if (btnToggleVoiceAgent) {
    btnToggleVoiceAgent.addEventListener('click', () => {
        handsFreeActive = !handsFreeActive;
        btnToggleVoiceAgent.textContent = handsFreeActive ? '🎙️ Voice Agent: CONTINUOUS' : '🎙️ Voice Agent: ON-DEMAND';
        btnToggleVoiceAgent.style.backgroundColor = handsFreeActive ? '#8b5cf6' : 'rgba(255,255,255,0.1)';
        if (handsFreeActive && !isMicListening) {
            startListening();
        }
    });
}

// Mode Selection
const btnModeCam = document.getElementById('btn-mode-cam');
const btnModeSim = document.getElementById('btn-mode-sim');
const btnModeApi = document.getElementById('btn-mode-api');

if (btnModeCam) btnModeCam.addEventListener('click', (e) => switchMode('cam', e.currentTarget));
if (btnModeSim) btnModeSim.addEventListener('click', (e) => switchMode('sim', e.currentTarget));
if (btnModeApi) btnModeApi.addEventListener('click', (e) => switchMode('api', e.currentTarget));

function switchMode(mode, btn) {
    currentMode = mode;
    document.querySelectorAll('.btn-mode').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
    });
    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    }

    const apiSection = document.getElementById('api-playground-section');
    if (apiSection) {
        if (mode === 'api') {
            apiSection.classList.remove('hidden');
        } else {
            apiSection.classList.add('hidden');
        }
    }

    if (mode === 'cam') {
        if (detectCanvas) detectCanvas.classList.remove('hidden');
        if (sonarCanvas) sonarCanvas.classList.add('hidden');
        if (video) video.classList.remove('hidden');
        startCameraVision();
    } else if (mode === 'sim') {
        if (detectCanvas) detectCanvas.classList.add('hidden');
        if (sonarCanvas) sonarCanvas.classList.remove('hidden');
        if (video) video.classList.add('hidden');
        initSimulatorMode();
    } else {
        if (detectCanvas) detectCanvas.classList.add('hidden');
        if (sonarCanvas) sonarCanvas.classList.add('hidden');
        if (video) video.classList.add('hidden');
    }
}

// Accessible Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') {
            document.activeElement.blur();
        }
        return;
    }

    // Spacebar or V: Speak / Toggle Microphone
    if (e.code === 'Space' || e.code === 'KeyV') {
        e.preventDefault();
        startListening();
        return;
    }

    // S: What do you see?
    if (e.code === 'KeyS') {
        e.preventDefault();
        triggerSceneReader();
        return;
    }

    // D: Describe Surroundings (Scene Memory)
    if (e.code === 'KeyD') {
        e.preventDefault();
        sceneMemory.describeSurroundings();
        return;
    }

    // X: Clear Scene Memory
    if (e.code === 'KeyX') {
        e.preventDefault();
        sceneMemory.clear();
        return;
    }

    // R: Repeat that
    if (e.code === 'KeyR') {
        e.preventDefault();
        triggerRepeatSpeech();
        return;
    }

    // Escape: Stop speaking
    if (e.code === 'Escape') {
        e.preventDefault();
        stopSpeaking();
        if (smartObjectFinder.isActive) {
            smartObjectFinder.cancelSearch();
        }
        return;
    }

    // H: Help & commands
    if (e.code === 'KeyH') {
        e.preventDefault();
        triggerHelpSpeech();
        return;
    }

    // M: Toggle audio sonification
    if (e.code === 'KeyM') {
        e.preventDefault();
        if (btnAudio) btnAudio.click();
        return;
    }

    // L: Toggle language
    if (e.code === 'KeyL') {
        e.preventDefault();
        toggleLanguage();
        return;
    }

    // C: Toggle high contrast
    if (e.code === 'KeyC') {
        e.preventDefault();
        toggleHighContrast();
        return;
    }
});

// ============================================================
// 14. TensorFlow.js COCO-SSD Camera Object Detection Loop
//     (With Inference Throttling & Temporal Confirmation)
// ============================================================
async function loadTensorFlowVisionModel() {
    try {
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-dot pulsing"></span> AI Vision: Loading Model...';
        }
        if (typeof cocoSsd === 'undefined') {
            console.warn("cocoSsd is undefined, waiting for CDN script...");
        }
        cocoModel = await cocoSsd.load();
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-dot"></span> AI Vision: Active (WebGL Accelerated)';
            aiStatus.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        }
        announceVoice("EchoBuddy AI Vision model loaded successfully. Press Spacebar or the microphone to speak commands.", true);
        startCameraVision();
    } catch (err) {
        console.error("TF.js COCO-SSD Load Error:", err);
        if (aiStatus) {
            aiStatus.innerHTML = '<span class="status-dot"></span> AI Vision: Fallback Mode Active';
        }
    }
}

function startCameraVision() {
    if (isCameraActive || isStartingCamera) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showMicFeedback("Camera access is not supported by this browser.", "warning");
        return;
    }

    isStartingCamera = true;
    navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'environment' } 
    })
    .then(stream => {
        isStartingCamera = false;
        isCameraActive = true;
        if (video) {
            video.srcObject = stream;
        }
        synth.init();
        requestAnimationFrame(detectFrameLoop);
    })
    .catch(err => {
        isStartingCamera = false;
        console.warn("Camera access denied or unavailable:", err);
        if (guidanceBanner) {
            guidanceBanner.textContent = "Camera access denied or unavailable. Interactive 3D Simulator is available.";
        }
    });
}

let lastInferenceTimestamp = 0;
const INFERENCE_PACE_MS = 120; // Throttle to ~8 FPS for battery, latency stability & zero jitter
let isDetectingFrame = false;

async function detectFrameLoop() {
    if (currentMode === 'cam' && video && video.readyState === 4) {
        const now = performance.now();
        if (now - lastInferenceTimestamp >= INFERENCE_PACE_MS && !isDetectingFrame) {
            lastInferenceTimestamp = now;
            isDetectingFrame = true;
            await runInferenceCycle();
            isDetectingFrame = false;
        }
    }
    requestAnimationFrame(detectFrameLoop);
}

async function runInferenceCycle() {
    if (detectCanvas && detectCtx) {
        detectCtx.clearRect(0, 0, detectCanvas.width, detectCanvas.height);
    }

    let rawPredictions = [];
    if (cocoModel) {
        try {
            rawPredictions = await cocoModel.detect(video);
        } catch (err) {
            console.error("Frame detection error:", err);
        }
    }

    // Filter noise below 0.45 and apply Non-Maximum Suppression (IoU deduplication)
    const filteredPredictions = filterAndDeduplicate(rawPredictions);

    lastDetectedObjects = [];
    let targetFound = false;
    const detectedListHTML = [];

    const parsedDetections = filteredPredictions.map(pred => {
        const [x, y, w, h] = pred.bbox;
        const objClass = pred.class.toLowerCase();

        // Pinhole camera optical depth calculation
        const realH = PHYSICAL_OBJECT_HEIGHTS[objClass] || 0.25;
        const distMeters = Math.max(0.15, Math.min(5.0, (realH * 600.0) / Math.max(1, h)));

        const centerX = x + (w / 2.0);
        const dx = (centerX - (detectCanvas.width / 2.0)) / (detectCanvas.width / 2.0);
        const position = dx < -0.2 ? "left" : dx > 0.2 ? "right" : "center";

        return {
            class: pred.class,
            score: pred.score,
            distance_m: roundNum(distMeters, 2),
            position: position,
            bbox: pred.bbox
        };
    });

    // Update temporal Scene Memory with active detections
    const confirmedSceneObjects = sceneMemory.update(parsedDetections);

    // Update Smart Object Finder
    smartObjectFinder.processFrame(confirmedSceneObjects, parsedDetections);

    parsedDetections.forEach(pred => {
        lastDetectedObjects.push(pred);

        const isHighConfidence = pred.score >= CONFIDENCE_TIER.HIGH;
        const confidenceLabel = isHighConfidence ? "" : " (possible)";
        detectedListHTML.push(`<li><span>${pred.class}${confidenceLabel}</span> <span>${pred.distance_m.toFixed(1)}m (${pred.position})</span></li>`);

        const isTargetMatch = pred.class.toLowerCase().includes(currentTargetName) || currentTargetName.includes(pred.class.toLowerCase());

        if (detectCtx) {
            // Draw Bounding Box Overlay
            detectCtx.strokeStyle = isTargetMatch ? '#10b981' : isHighConfidence ? 'rgba(56, 189, 248, 0.85)' : 'rgba(245, 158, 11, 0.65)';
            detectCtx.lineWidth = isTargetMatch ? 4 : isHighConfidence ? 2 : 1.5;
            if (!isHighConfidence) detectCtx.setLineDash([4, 4]);
            else detectCtx.setLineDash([]);
            
            const [x, y, w, h] = pred.bbox;
            detectCtx.strokeRect(x, y, w, h);
            detectCtx.setLineDash([]);

            // Bounding Box Label
            detectCtx.fillStyle = isTargetMatch ? '#10b981' : 'rgba(16, 23, 38, 0.88)';
            const labelText = `${pred.class.toUpperCase()} ${Math.round(pred.score * 100)}% (${pred.distance_m.toFixed(1)}m)`;
            detectCtx.fillRect(x, Math.max(0, y - 24), Math.max(120, labelText.length * 8 + 20), 24);
            detectCtx.fillStyle = isHighConfidence ? '#ffffff' : '#fde68a';
            detectCtx.font = '700 12px "Plus Jakarta Sans", sans-serif';
            detectCtx.fillText(labelText, x + 6, Math.max(15, y - 7));
        }

        if (isTargetMatch && !targetFound) {
            targetFound = true;

            const [x, y, w, h] = pred.bbox;
            const centerY = y + (h / 2.0);
            const dy = ((detectCanvas.height / 2.0) - centerY) / (detectCanvas.height / 2.0);
            const dx = ((x + (w / 2.0)) - (detectCanvas.width / 2.0)) / (detectCanvas.width / 2.0);

            const normDy = (dy + 1.0) / 2.0;
            const freqHz = Math.round(261.63 + (normDy * (880.0 - 261.63)));
            const normDz = (pred.distance_m - 0.15) / (3.5 - 0.15);
            const pulseMs = Math.round(50 + (normDz * (600 - 50)));

            const isCentered = Math.abs(dx) <= 0.18 && Math.abs(dy) <= 0.18;
            const isClose = pred.distance_m <= 0.35;
            const isLocked = isCentered && isClose;

            synth.updateParameters(dx, freqHz, pulseMs, isLocked);
            updateTelemetryUI(dx, dy, pred.distance_m, dx, freqHz, pulseMs, isLocked, pred.class, pred.score);

            if (isLocked) {
                triggerHapticPulse([150, 50, 150]);
            }
        }
    });

    if (detectedObjectsList) {
        detectedObjectsList.innerHTML = detectedListHTML.length 
            ? detectedListHTML.join('') 
            : '<li class="empty-item">Scanning camera feed...</li>';
    }

    if (!targetFound && parsedDetections.length > 0 && guidanceBanner) {
        guidanceBanner.textContent = `👁️ ${parsedDetections.length} objects visible. Target "${currentTargetName}" not locked yet.`;
        guidanceBanner.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
        guidanceBanner.style.color = '#38bdf8';
    }
}

// ============================================================
// 15. Telemetry & Sonification Guidance Updates
// ============================================================
function updateTelemetryUI(dx, dy, dz, pan, freqHz, pulseMs, isLocked, labelName, score = 0.9) {
    if (valPan) valPan.textContent = pan.toFixed(2);
    if (valDist) valDist.textContent = `${dz.toFixed(2)}m (${(dz * 3.28).toFixed(1)} ft)`;
    if (valDx) valDx.textContent = dx.toFixed(2);
    if (valDy) valDy.textContent = dy.toFixed(2);
    if (valDz) valDz.textContent = `${dz.toFixed(2)}m`;

    if (meterPan) meterPan.style.width = `${((pan + 1.0) / 2.0) * 100}%`;
    if (meterDist) meterDist.style.width = `${Math.max(0, Math.min(100, (1.0 - (dz / 3.0)) * 100))}%`;

    const proxPct = Math.round((1.0 - Math.min(1.0, dz / 3.0)) * 50 + (1.0 - Math.min(1.0, Math.sqrt(dx*dx + dy*dy))) * 50);
    if (valProx) valProx.textContent = `${proxPct}%`;
    if (meterProx) meterProx.style.width = `${proxPct}%`;

    const displayName = (currentLang === 'hi' && ENGLISH_TO_HINDI_OBJECT[labelName.toLowerCase()]) 
        ? ENGLISH_TO_HINDI_OBJECT[labelName.toLowerCase()] 
        : labelName;

    const isHighConf = score >= CONFIDENCE_TIER.HIGH;
    let guidanceText = "";

    if (isLocked) {
        if (lockOverlay) lockOverlay.classList.remove('hidden');
        if (currentLang === 'hi') {
            guidanceText = `${displayName} लॉक हो गया! सीधे आगे हाथ बढ़ाएं।`;
        } else {
            guidanceText = `${displayName} locked! Reach straight ahead.`;
        }
        if (guidanceBanner) {
            guidanceBanner.textContent = `🔒 ${guidanceText}`;
            guidanceBanner.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
            guidanceBanner.style.color = '#10b981';
        }
        announceVoice(guidanceText, true);
    } else {
        if (lockOverlay) lockOverlay.classList.add('hidden');
        if (currentLang === 'hi') {
            let cue = [];
            if (dx < -0.2) cue.push("दाईं ओर");
            if (dx > 0.2) cue.push("बाईं ओर");
            if (dy < -0.2) cue.push("ऊपर");
            if (dy > 0.2) cue.push("नीचे");
            const distStr = dz >= 1.0 ? `${dz.toFixed(1)} मीटर` : `${Math.round(dz * 100)} सेंटीमीटर`;
            const dirStr = cue.length ? cue.join(' और ') : 'सीधे आगे';
            const qualifier = isHighConf ? "" : "संभवतः ";
            guidanceText = `${qualifier}${displayName} ${distStr} दूरी पर, ${dirStr} है।`;
        } else {
            let cue = [];
            if (dx < -0.2) cue.push("to your right");
            if (dx > 0.2) cue.push("to your left");
            if (dy < -0.2) cue.push("higher up");
            if (dy > 0.2) cue.push("lower down");
            const distStr = dz >= 1.0 ? `${dz.toFixed(1)} meters` : `${Math.round(dz * 100)} centimeters`;
            const dirStr = cue.length ? cue.join(' and ') : 'straight ahead';
            const qualifier = isHighConf ? "" : "possible ";
            guidanceText = `${qualifier}${displayName} is ${distStr} away, ${dirStr}.`;
        }
        if (guidanceBanner) {
            guidanceBanner.textContent = `🔊 ${guidanceText}`;
            guidanceBanner.style.backgroundColor = 'rgba(56, 189, 248, 0.1)';
            guidanceBanner.style.color = '#38bdf8';
        }
        announceVoice(guidanceText);
    }
}

// ============================================================
// 16. Interactive 3D Simulation Mode
// ============================================================
let simInitialized = false;

function initSimulatorMode() {
    if (simInitialized || !sonarCanvas || !sonarCtx) return;
    simInitialized = true;

    function renderSimulator() {
        if (currentMode !== 'sim') return;

        sonarCtx.fillStyle = '#080c14';
        sonarCtx.fillRect(0, 0, sonarCanvas.width, sonarCanvas.height);

        // Draw Radar grid rings
        const cx = sonarCanvas.width / 2;
        const cy = sonarCanvas.height / 2;
        sonarCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        sonarCtx.lineWidth = 1;
        for (let r = 50; r <= 220; r += 50) {
            sonarCtx.beginPath();
            sonarCtx.arc(cx, cy, r, 0, Math.PI * 2);
            sonarCtx.stroke();
        }

        // Draw crosshairs
        sonarCtx.beginPath();
        sonarCtx.moveTo(cx, 0); sonarCtx.lineTo(cx, sonarCanvas.height);
        sonarCtx.moveTo(0, cy); sonarCtx.lineTo(sonarCanvas.width, cy);
        sonarCtx.stroke();

        // Draw virtual target object
        const tx = targetObjSim.x;
        const ty = targetObjSim.y;
        sonarCtx.fillStyle = '#10b981';
        sonarCtx.beginPath();
        sonarCtx.arc(tx, ty, 14, 0, Math.PI * 2);
        sonarCtx.fill();

        sonarCtx.fillStyle = '#ffffff';
        sonarCtx.font = '700 13px "Plus Jakarta Sans", sans-serif';
        sonarCtx.fillText(`🎯 ${currentTargetName.toUpperCase()}`, tx + 18, ty + 5);

        // Calculate spatial metrics for simulator
        const dx = (tx - cx) / cx;
        const dy = (cy - ty) / cy;
        const dz = targetObjSim.z;

        const normDy = (dy + 1.0) / 2.0;
        const freqHz = Math.round(261.63 + (normDy * (880.0 - 261.63)));
        const normDz = (dz - 0.15) / (3.5 - 0.15);
        const pulseMs = Math.round(50 + (normDz * (600 - 50)));
        const isLocked = Math.abs(dx) <= 0.18 && Math.abs(dy) <= 0.18 && dz <= 0.35;

        synth.updateParameters(dx, freqHz, pulseMs, isLocked);
        updateTelemetryUI(dx, dy, dz, dx, freqHz, pulseMs, isLocked, currentTargetName, 0.95);

        requestAnimationFrame(renderSimulator);
    }

    sonarCanvas.addEventListener('pointermove', (e) => {
        const rect = sonarCanvas.getBoundingClientRect();
        targetObjSim.x = e.clientX - rect.left;
        targetObjSim.y = e.clientY - rect.top;
        const distFromCenter = Math.sqrt(Math.pow(targetObjSim.x - 320, 2) + Math.pow(targetObjSim.y - 240, 2));
        targetObjSim.z = Math.max(0.2, Math.min(3.5, distFromCenter / 100));
    });

    renderSimulator();
}

function roundNum(num, dec) {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

// ============================================================
// 17. Initialization on Page Load
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.getVoices();
        };
    }

    loadTensorFlowVisionModel();
});
