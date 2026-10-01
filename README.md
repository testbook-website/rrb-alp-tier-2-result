# 🚆 RRB ALP CBT-2 Result Checker Widget (CEN 01/2024)

An embeddable result checker widget for the **Railway Recruitment Board (RRB) Assistant Loco Pilot (ALP) CBT-2 Examination (CEN 01/2024)**.

Students can enter their **Full Name**, **Mobile Number**, **RRB Zone**, and **Roll Number** to instantly check if they are shortlisted for the **CBAT (Computer Based Aptitude Test / Stage 3)**.

Every lookup is automatically recorded in real-time in your Google Sheet:
👉 **[Google Spreadsheet Database](https://docs.google.com/spreadsheets/d/1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g/edit?gid=0#gid=0)**

---

## 🚀 Key Features

- **⚡ Instant Client-Side Verification**: 45 shortlisted candidates from **RRB Jammu - Srinagar** loaded out-of-the-box, with support for all 21 RRB zones.
- **🎉 Animated Celebration**: Confetti animation, printable scorecard slip, and WhatsApp share for qualified candidates.
- **📊 Real-time Google Sheets Sync**: Candidate Name, Mobile, Roll Number, Zone, and Result Status are logged to Google Sheets via Google Apps Script without blocking the user.
- **📱 Fully Responsive & Embeddable**: Works on mobile, tablet, and desktop, or as an `<iframe>` widget on any blog/portal.
- **🖨️ Printable Verification Slip**: Formatted scorecard ready for print/PDF export.
- **🛠️ Automated PDF Roll Extractor**: Built-in PowerShell script `extract_pdf_rolls.ps1` to extract roll numbers from any new RRB zone PDF in seconds.

---

## 📋 Step 1: Google Apps Script Setup (Google Sheets)

To connect the widget to your Google Sheet:

1. Open your Google Spreadsheet:
   [https://docs.google.com/spreadsheets/d/1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g](https://docs.google.com/spreadsheets/d/1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g)
2. In the top menu, go to **Extensions** → **Apps Script**.
3. Delete any code in the editor and copy-paste the entire contents of [`google-apps-script.js`](./google-apps-script.js).
4. Click **Save** (💾 icon).
5. Click **Deploy** (blue button in top right) → **New deployment**.
6. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
7. Set the fields:
   - **Description**: `RRB ALP CBT 2 Result Tracker`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Important: Must be 'Anyone' so public users can submit entries)*
8. Click **Deploy**, review permissions, and authorize with your Google account.
9. Copy your **Web app URL** (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).
10. Open [`config.js`](./config.js) and paste the URL:
   ```javascript
   const CONFIG = {
     GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
     ...
   };
   ```

---

## ➕ Step 2: Adding More RRB Zone Result PDFs

Whenever a new RRB Zone releases its CBT-2 result PDF:

1. Place the PDF in this project folder (e.g. `RRB Mumbai.pdf`).
2. Run the extractor script in PowerShell:
   ```powershell
   .\extract_pdf_rolls.ps1 -PdfPath "RRB Mumbai.pdf" -ZoneKey "mumbai"
   ```
3. Open `mumbai_rolls.json` and copy the array into `results-data.js` under the corresponding zone key (`"mumbai"`):
   ```javascript
   "mumbai": {
     name: "RRB Mumbai",
     code: "BCT",
     region: "Western Region",
     status: "available", // Change status to available!
     totalShortlisted: 450,
     pdfName: "RRB Mumbai.pdf",
     lastUpdated: "October 1, 2026",
     rolls: [
       "211251...",
       ...
     ]
   }
   ```

---

## 🌐 Step 3: Uploading to GitHub & GitHub Pages

Initialize git and push to your GitHub repository:

```bash
git init
git add .
git commit -m "Initial commit: RRB ALP CBT 2 Result Checker widget"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

To enable free hosting on **GitHub Pages**:
1. Go to your GitHub repository → **Settings** → **Pages**.
2. Under **Build and deployment** → **Branch**, select `main` and `/ (root)`.
3. Click **Save**. Your widget will be live at `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`!

---

## 🧩 Embedding on Other Websites (iFrame)

To embed this widget into any WordPress site, Blogger, or custom portal:

```html
<iframe 
  src="https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/" 
  width="100%" 
  height="750" 
  frameborder="0" 
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
  title="RRB ALP CBT 2 Result Checker"
></iframe>
```

---

## 📁 Repository Structure

```
rrb-alp-cbt-2-result/
├── index.html               # Main widget interface
├── style.css                # Custom styling & print layout
├── app.js                   # Client validation, search & Google Sheet sync
├── config.js                # Google Apps Script Web App URL & exam config
├── results-data.js          # 21 RRB Zones database with Jammu shortlisted rolls
├── google-apps-script.js    # Google Apps Script backend code for Google Sheets
├── extract_pdf_rolls.ps1    # Automated PDF roll number extractor
├── jammu_rolls.json         # Raw extracted roll numbers for RRB Jammu (45 records)
├── RRB Jammu.pdf            # Official RRB Jammu CBT-2 Result PDF
└── README.md                # Documentation & deployment guide
```
