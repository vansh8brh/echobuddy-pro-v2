from app.main import health_check, list_targets, sonify_coordinates, scene_describe, SonifyRequest, SceneDescribeRequest

def run_coro(coro):
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value

def main():
    print("Testing health_check()...")
    h = run_coro(health_check())
    print("Health:", h)
    assert h["status"] == "healthy"
    assert h["version"] == "2.1.0-v2"

    print("\nTesting list_targets()...")
    t = run_coro(list_targets())
    print(f"Known targets count: {t['count']}")
    assert t["count"] > 10

    print("\nTesting sonify_coordinates()...")
    req_sonify = SonifyRequest(dx=0.0, dy=0.0, dz=0.25, target_name="bottle")
    s = run_coro(sonify_coordinates(req_sonify))
    print("Sonify output guidance cue:", s["audio_parameters"]["guidance_cue"])
    print("Sonify is_locked:", s["audio_parameters"]["is_locked"])
    assert s["audio_parameters"]["is_locked"] is True

    print("\nTesting scene_describe() in English...")
    sc_en = run_coro(scene_describe(SceneDescribeRequest(
        objects=[{"label": "bottle", "distance_m": 0.8, "position": "left"}],
        lang="en"
    )))
    print("Scene Narration (EN):", sc_en["speech_narration"])
    assert "bottle" in sc_en["speech_narration"]

    print("\nTesting scene_describe() in Hindi...")
    sc_hi = run_coro(scene_describe(SceneDescribeRequest(
        objects=[{"label": "bottle", "distance_m": 0.8, "position": "left"}],
        lang="hi"
    )))
    print("Scene Narration (HI):", sc_hi["speech_narration"])
    assert "बोतल" in sc_hi["speech_narration"]

    print("\nTesting scene_describe() with empty objects...")
    empty_en = run_coro(scene_describe(SceneDescribeRequest(objects=[], lang="en")))
    print("Empty (EN):", empty_en["speech_narration"])
    empty_hi = run_coro(scene_describe(SceneDescribeRequest(objects=[], lang="hi")))
    print("Empty (HI):", empty_hi["speech_narration"])

    print("\nALL FASTAPI ENDPOINT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
