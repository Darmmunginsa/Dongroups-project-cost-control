# 📋 คู่มือการติดตั้ง Project Cost Control Web App

## ภาพรวมระบบ

```
React App (GitHub Pages) ←→ Google Apps Script (API) ←→ Google Sheets (Database)
                                                     ←→ Google Drive (Files)
```

---

## ขั้นตอนที่ 1: เตรียม Google Sheets

1. เปิด Google Sheets เดิมที่ใช้กับ AppSheet อยู่
2. จดบันทึก **Spreadsheet ID** จาก URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

3. ตรวจสอบว่ามี sheet ต่อไปนี้ครบ (ชื่อต้องตรงกันทุกตัวอักษร):
   - `Projects`
   - `ProjectCost`
   - `ProjectDocument`
   - `รายการเบิก`

4. Sheet `Users` จะถูกสร้างอัตโนมัติเมื่อ deploy Apps Script ครั้งแรก

---

## ขั้นตอนที่ 2: เตรียม Google Drive Folder

1. ไปที่ [Google Drive](https://drive.google.com)
2. สร้าง folder ใหม่ชื่อ `ProjectCostControl_Files`
3. คลิกขวาที่ folder → **Get link**
4. จดบันทึก **Folder ID** จาก URL:
   ```
   https://drive.google.com/drive/folders/[FOLDER_ID]
   ```

---

## ขั้นตอนที่ 3: Deploy Google Apps Script

1. เปิด [script.google.com](https://script.google.com)
2. คลิก **New project**
3. ลบโค้ดเดิมทั้งหมด แล้ว **copy ทั้งหมด** จากไฟล์ `google-apps-script/Code.gs`
4. วางใน Apps Script Editor
5. แก้ไขค่าในบรรทัดแรก:
   ```javascript
   const SPREADSHEET_ID = 'ใส่ ID จากขั้นตอนที่ 1';
   const DRIVE_FOLDER_ID = 'ใส่ ID จากขั้นตอนที่ 2';
   ```
6. กด **Save** (Ctrl+S)
7. คลิก **Deploy** → **New deployment**
8. ตั้งค่า:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
9. คลิก **Deploy**
10. คลิก **Authorize access** แล้ว อนุญาต permissions
11. คัดลอก **Web app URL** ที่ได้ (เก็บไว้สำหรับขั้นตอนที่ 4)

> ⚠️ **สำคัญ**: ทุกครั้งที่แก้ไข Code.gs ต้อง Deploy ใหม่ → New deployment

---

## ขั้นตอนที่ 4: ตั้งค่า Web App

1. เปิดไฟล์ `src/config.js`
2. แทนที่ URL:
   ```javascript
   export const APPS_SCRIPT_URL = 'วาง Web App URL ที่ได้จากขั้นตอนที่ 3';
   ```
3. บันทึกไฟล์

---

## ขั้นตอนที่ 5: Upload ขึ้น GitHub

1. สร้าง repository ใหม่บน GitHub (ชื่ออะไรก็ได้ เช่น `project-cost-control`)
2. เปิด Terminal/Command Prompt ใน folder `web-app`
3. รันคำสั่ง:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/[YOUR_USERNAME]/[REPO_NAME].git
   git push -u origin main
   ```

---

## ขั้นตอนที่ 6: เปิดใช้งาน GitHub Pages

1. ไปที่ GitHub repository → **Settings**
2. คลิก **Pages** ในเมนูซ้าย
3. ตั้งค่า:
   - Source: **GitHub Actions**
4. รอสักครู่ แล้วดู URL ของ Web App (จะแสดงใน Pages settings)

> GitHub Actions จะ build และ deploy อัตโนมัติทุกครั้งที่ push

---

## ขั้นตอนที่ 7: ตั้งค่าผู้ใช้งาน

เมื่อ Web App ขึ้นมาแล้ว:

1. เข้าหน้า Login ด้วย:
   - Username: `admin`
   - Password: `admin1234`

2. ไปที่ **จัดการผู้ใช้** (sidebar ล่าง)
3. เพิ่มผู้ใช้คนอื่น และเปลี่ยน password admin

---

## โครงสร้างไฟล์

```
web-app/
├── src/
│   ├── App.jsx                 # Main App + Routing
│   ├── config.js               # ← แก้ไข URL ที่นี่
│   ├── api/index.js            # API calls ทั้งหมด
│   ├── context/AuthContext.jsx # Authentication
│   ├── components/
│   │   ├── Layout.jsx          # Sidebar layout
│   │   ├── Modal.jsx           # Popup modal
│   │   └── FileUpload.jsx      # File upload component
│   └── pages/
│       ├── Login.jsx           # หน้า Login
│       ├── Dashboard.jsx       # ภาพรวม
│       ├── Projects.jsx        # รายการ Projects
│       ├── ProjectDetail.jsx   # รายละเอียด Project
│       ├── Disbursements.jsx   # รายการเบิกจ่าย
│       └── Users.jsx           # จัดการผู้ใช้ (Admin only)
├── google-apps-script/
│   └── Code.gs                 # Backend API
└── .github/workflows/
    └── deploy.yml              # Auto-deploy to GitHub Pages
```

---

## การพัฒนาต่อในเครื่อง (Local Development)

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build สำหรับ production
npm run build
```

---

## แก้ปัญหาที่พบบ่อย

**ปัญหา: Login ไม่ได้ / API Error**
- ตรวจสอบ URL ใน `src/config.js`
- ตรวจสอบว่า Apps Script ถูก deploy แล้ว
- ตรวจสอบ Spreadsheet ID และ Folder ID

**ปัญหา: อัพโหลดไฟล์ไม่ได้**
- ตรวจสอบ DRIVE_FOLDER_ID
- ตรวจสอบว่า Apps Script มี permission เข้าถึง Drive

**ปัญหา: ข้อมูลไม่แสดง**
- ตรวจสอบชื่อ sheet ให้ตรงกับที่กำหนดใน Code.gs
- ตรวจสอบว่า row แรกของแต่ละ sheet เป็น header ที่ถูกต้อง
