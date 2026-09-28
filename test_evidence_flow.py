import urllib.request
import json
import os

# Create 1x1 valid PNG
png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xdc\xccY\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

print("=== 1. LOGIN AS STUDENT STU001 ===")
login_req = urllib.request.Request(
    "http://localhost:8080/api/auth/login",
    data=json.dumps({"username": "STU001", "password": "Student@123"}).encode(),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(login_req) as r:
    stu_token = json.loads(r.read().decode())["data"]["token"]
print("Student Token obtained.")

print("\n=== 2. LODGE COMPLAINT AS STUDENT ===")
lodge_req = urllib.request.Request(
    "http://localhost:8080/api/student/complaints",
    data=json.dumps({
        "title": "Broken Lab Chair with Nails Exposed",
        "description": "Chair #4 in Physics Lab 201 has exposed sharp nails causing injury hazard.",
        "category": "INFRASTRUCTURE",
        "priority": "HIGH"
    }).encode(),
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {stu_token}"}
)
with urllib.request.urlopen(lodge_req) as r:
    comp_data = json.loads(r.read().decode())["data"]
    comp_id = comp_data["complaintId"]
    numeric_id = comp_data["id"]
print("Complaint created:", comp_id, "ID:", numeric_id)

print("\n=== 3. UPLOAD EVIDENCE IMAGE AS STUDENT ===")
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = bytearray()
body.extend(f"--{boundary}\r\n".encode())
body.extend(f"Content-Disposition: form-data; name=\"file\"; filename=\"broken_chair_photo.png\"\r\n".encode())
body.extend(b"Content-Type: image/png\r\n\r\n")
body.extend(png_bytes)
body.extend(f"\r\n--{boundary}--\r\n".encode())

upload_req = urllib.request.Request(
    f"http://localhost:8080/api/complaints/{comp_id}/attachments",
    data=bytes(body),
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {stu_token}"
    }
)
with urllib.request.urlopen(upload_req) as r:
    att_resp = json.loads(r.read().decode())
    att_id = att_resp["data"]["id"]
    orig_name = att_resp["data"]["originalFilename"]
print("Attachment uploaded! Attachment ID:", att_id, "Original:", orig_name)

print("\n=== 4. VERIFY ATTACHMENT IN STUDENT COMPLAINT DETAIL ===")
detail_req = urllib.request.Request(
    f"http://localhost:8080/api/student/complaints/{comp_id}",
    headers={"Authorization": f"Bearer {stu_token}"}
)
with urllib.request.urlopen(detail_req) as r:
    detail_data = json.loads(r.read().decode())["data"]
    atts = detail_data.get("attachments", [])
    print("Found", len(atts), "attachment(s) in Student Detail:")
    for a in atts:
        print(" - Attachment ID:", a["id"], "Filename:", a["originalFilename"])

print("\n=== 5. VERIFY ATTACHMENT IN ADMIN COMPLAINT DETAIL ===")
admin_login_req = urllib.request.Request(
    "http://localhost:8080/api/auth/login",
    data=json.dumps({"username": "superadmin", "password": "Admin@123"}).encode(),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(admin_login_req) as r:
    admin_token = json.loads(r.read().decode())["data"]["token"]

admin_comp_req = urllib.request.Request(
    f"http://localhost:8080/api/complaints/{comp_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)
with urllib.request.urlopen(admin_comp_req) as r:
    admin_comp_data = json.loads(r.read().decode())["data"]
    admin_atts = admin_comp_data.get("attachments", [])
    print("Found", len(admin_atts), "attachment(s) in Admin Detail:")
    for a in admin_atts:
        print(" - Attachment ID:", a["id"], "Filename:", a["originalFilename"])

print("\n=== 6. ADMIN STREAMS THE EVIDENCE IMAGE ===")
img_req = urllib.request.Request(
    f"http://localhost:8080/api/complaints/{comp_id}/attachments/{att_id}",
    headers={"Authorization": f"Bearer {admin_token}"}
)
with urllib.request.urlopen(img_req) as r:
    content_type = r.headers.get("Content-Type")
    received_bytes = len(r.read())
    print("Admin retrieved image successfully:", received_bytes, "bytes, Content-Type:", content_type)

print("\n=== 7. SECURITY TEST: UNAUTHORIZED STUDENT (STU002) ATTEMPTS ACCESS ===")
stu2_login = urllib.request.Request(
    "http://localhost:8080/api/auth/login",
    data=json.dumps({"username": "STU002", "password": "Student@123"}).encode(),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(stu2_login) as r:
    stu2_token = json.loads(r.read().decode())["data"]["token"]

try:
    unauth_req = urllib.request.Request(
        f"http://localhost:8080/api/complaints/{comp_id}/attachments/{att_id}",
        headers={"Authorization": f"Bearer {stu2_token}"}
    )
    urllib.request.urlopen(unauth_req)
    print("❌ ERROR: Unauthorized student was allowed access!")
except urllib.error.HTTPError as e:
    print(f"✅ Security Enforced: Unauthorized student received HTTP {e.code} ({e.reason})")

print("\n=== 8. SECURITY TEST: UNAUTHENTICATED REQUEST ===")
try:
    no_auth_req = urllib.request.Request(f"http://localhost:8080/api/complaints/{comp_id}/attachments/{att_id}")
    urllib.request.urlopen(no_auth_req)
    print("❌ ERROR: Unauthenticated request was allowed!")
except urllib.error.HTTPError as e:
    print(f"✅ Security Enforced: Unauthenticated user received HTTP {e.code} ({e.reason})")
