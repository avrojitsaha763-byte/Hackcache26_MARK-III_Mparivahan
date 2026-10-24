from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_system():
    print("--- 1. Testing Root Health Check ---")
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    print("Health Status:", data["status"], "| Endpoints count:", len(data["active_endpoints"]))

    print("\n--- 2. Testing Phase 2: Check Eligibility (CMVR Rule 32) ---")
    res = client.post("/api/check-eligibility", json={"age": 19, "vehicle_class": "combo-bike-car"})
    assert res.status_code == 200
    d = res.json()
    print("Eligibility:", d["eligible"], "| Fee:", d["fee_details"]["total"], "| Citation:", d["fee_details"]["rule_citation"])
    assert d["fee_details"]["total"] == 350

    print("\n--- 3. Testing Phase 2: Form 2 Application Submission ---")
    res = client.post("/api/applications", json={
        "applicant_name": "Test Citizen Sharma",
        "dob": "2003-05-15",
        "rto_code": "DL-01",
        "vehicle_classes": ["MCWG", "LMV"],
        "mobile": "+91 99999 88888",
        "fee_amount": "₹350 (CMVR Rule 32)"
    })
    assert res.status_code == 200
    new_app = res.json()["data"]
    app_no = new_app["application_number"]
    print("Created Application:", app_no, "| Status:", new_app["status"])

    print("\n--- 4. Testing Phase 3: Track Application with Rule 11(3) Window ---")
    res = client.get(f"/api/track?app_no={app_no}")
    assert res.status_code == 200
    track_d = res.json()
    assert track_d["success"] is True
    print("Track Success:", track_d["success"], "| Rule 11 Days Remaining:", track_d["data"]["rule11_days_remaining"])

    print("\n--- 5. Testing Phase 4: Questions Bank ---")
    res = client.get("/api/questions?limit=5")
    assert res.status_code == 200
    qs = res.json()
    print("Questions retrieved:", qs["count"])

    print("\n--- 6. Testing Phase 4: Submit Quiz (STALL Exam Evaluator) ---")
    res = client.post("/api/quiz/submit", json={"answers": {"1": 1, "2": 2, "3": 1}})
    assert res.status_code == 200
    quiz_res = res.json()
    print("Quiz Score:", quiz_res["score"], "/", quiz_res["total"], "| Passed:", quiz_res["passed"])

    print("\n--- 7. Testing Phase 4: Traffic Signs Catalog ---")
    res = client.get("/api/signs")
    assert res.status_code == 200
    signs_res = res.json()
    print("Signs retrieved:", signs_res["count"])

    print("\n--- 8. Testing Phase 5: RTO Admin Applications List ---")
    res = client.get("/api/admin/applications")
    assert res.status_code == 200
    apps_list = res.json()
    print("Admin Applications count:", apps_list["count"])

    print("\n--- 9. Testing Phase 5: RTO Approval & Form 3 Minting ---")
    res = client.put(f"/api/applications/{app_no}/status", json={
        "status": "Approved & LL Issued (Form 3)",
        "remarks": "Documents verified per CMVR Rule 14",
        "officer_name": "Rajeshwar Sharma"
    })
    assert res.status_code == 200
    approved_d = res.json()["data"]
    print("Status Updated:", approved_d["status"], "| LL Number:", approved_d.get("llNumber"))

    print("\n--- 10. Testing Phase 5: ADTT Slot Booking ---")
    res = client.post("/api/slots/book", json={
        "app_no": app_no,
        "applicant_name": "Test Citizen Sharma",
        "track_type": "car",
        "ground": "IDTR-DELHI",
        "test_date": "2026-11-28",
        "slot_time": "10:00 AM - 11:30 AM"
    })
    assert res.status_code == 200
    slot_d = res.json()["data"]
    print("Booked Slot ID:", slot_d["slot_id"], "| Status:", slot_d["status"])

    print("\n--- 11. Testing Phase 5: Saathi AI Chat ---")
    res = client.post("/api/chat", json={"query": "What is the fee for bike and car?", "lang": "en"})
    assert res.status_code == 200
    reply_text = res.json()["reply"][:80].encode('ascii', 'ignore').decode('ascii')
    print("Saathi AI Response:", reply_text, "...")

    print("\n--- 12. Testing Phase 6: Officer Authentication ---")
    res = client.post("/api/admin/login", json={
        "identifier": "RTO-OFFICER-DL01",
        "password": "AdminPassword2026!"
    })
    assert res.status_code == 200
    officer_d = res.json()["data"]
    print("Officer Authenticated:", officer_d["name"], "| Clearance:", officer_d["clearanceLevel"])

    print("\n--- 13. Testing DigiLocker Auth (OTP Request, Verify & Password) ---")
    # Flow A: Request OTP
    res = client.post("/api/auth", json={"loginType": "request_otp", "phone": "9876543210"})
    assert res.status_code == 200
    assert res.json()["success"] is True
    print("OTP Request:", res.json()["message"], "| Txn:", res.json()["txnId"])

    # Flow B: Verify OTP
    res = client.post("/api/auth", json={"loginType": "verify_otp", "otp": "123456"})
    assert res.status_code == 200
    token = res.json()["token"]
    assert token == "mock_oauth_token_8892"
    print("OTP Verified Token:", token)

    # Flow C: Password
    res = client.post("/api/auth", json={"loginType": "password", "username": "demo_user", "password": "123456"})
    assert res.status_code == 200
    assert res.json()["token"] == "mock_oauth_token_8892"
    print("Password Login Verified")

    print("\n--- 14. Testing API Setu Documents Fetch & Age Engine ---")
    # Unauthorized test
    res = client.post("/api/documents", json={"vehicleClass": "motorcycle-gear"})
    assert res.status_code == 401
    print("Unauthorized check passed (401)")

    # Authorized test with standard vehicle
    res = client.post("/api/documents", json={"vehicleClass": "motorcycle-gear"}, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    doc_data = res.json()
    assert doc_data["success"] is True
    assert doc_data["data"]["applicant_name"] == "Ramesh Kumar"
    assert doc_data["verification"]["is_rto_eligible"] is True
    print("Documents Retrieved for:", doc_data["data"]["applicant_name"], "| Calculated Age:", doc_data["verification"]["calculated_age"], "| Remarks:", doc_data["verification"]["remarks"])

    print("\n[SUCCESS] ALL 14 ENDPOINTS & DIGILOCKER ROUTE HANDLERS PASSED FLAWLESSLY!")

if __name__ == "__main__":
    test_system()
