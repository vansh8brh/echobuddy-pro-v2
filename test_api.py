import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    print("--- 1. Testing GET /api/v1/health ---")
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/v1/health")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print("Response:", json.dumps(data, indent=2))
    except Exception as e:
        print("Health test failed:", e)

def test_scene_describe():
    print("\n--- 2. Testing POST /api/v1/scene-describe ---")
    payload = {
        "objects": [
            {"label": "bottle", "distance_m": 0.8, "position": "left"},
            {"label": "cell phone", "distance_m": 0.4, "position": "center"},
            {"label": "chair", "distance_m": 1.8, "position": "right"}
        ]
    }
    try:
        data_bytes = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f"{BASE_URL}/api/v1/scene-describe", 
            data=data_bytes, 
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode())
            print("Scene Narration:", json.dumps(res_data, indent=2))
    except Exception as e:
        print("Scene describe test failed:", e)

if __name__ == "__main__":
    print("EchoBuddy Pro - Platform API Verification Script\n")
    test_health()
    test_scene_describe()
