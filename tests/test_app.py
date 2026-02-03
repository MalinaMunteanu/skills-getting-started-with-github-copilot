from fastapi.testclient import TestClient
from src import app as application_module

client = TestClient(application_module.app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Basketball" in data


def test_signup_and_remove():
    email = "pytest-test@example.com"
    # Ensure clean state
    participants = application_module.activities["Basketball"]["participants"]
    if email in participants:
        participants.remove(email)

    # Signup
    resp = client.post(f"/activities/Basketball/signup?email={email}")
    assert resp.status_code == 200
    assert email in application_module.activities["Basketball"]["participants"]

    # Remove
    resp = client.post(f"/activities/Basketball/remove?email={email}")
    assert resp.status_code == 200
    assert email not in application_module.activities["Basketball"]["participants"]
