/**
 * =========================================================================
 * RRB ALP CBT-2 RESULT CHECKER - GOOGLE APPS SCRIPT
 * Target Spreadsheet: https://docs.google.com/spreadsheets/d/1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g
 * =========================================================================
 * 
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g
 * 2. Click on "Extensions" -> "Apps Script" in the top menu bar.
 * 3. Delete any default code in Code.gs and PASTE THIS ENTIRE FILE.
 * 4. Click "Save" (Floppy disk icon).
 * 5. Click "Deploy" (Blue button at top right) -> "New deployment".
 * 6. Click the Gear icon ⚙️ next to "Select type" -> Select "Web app".
 * 7. Set Configuration:
 *    - Description: "RRB ALP CBT-2 Result Tracker"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"  <-- CRITICAL: Choose "Anyone" so candidates can submit data!
 * 8. Click "Deploy" -> Review Permissions -> Choose your account -> Advanced -> Click "Go to Untitled (unsafe)" -> Click "Allow".
 * 9. Copy the "Web app URL" (looks like https://script.google.com/macros/s/.../exec).
 * 10. Paste that Web App URL in config.js or app.js in your widget repository!
 */

const SPREADSHEET_ID = "1fxWD05wWUKwjVtU2Rc9RoyrPUq-4uxSlhyqA3TjU47g";
const SHEET_NAME = "Sheet1"; // Change if you use a different tab name

/**
 * Handles incoming POST requests from the widget
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  // Wait for up to 30 seconds for other processes to finish
  lock.tryLock(30000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    // Check and create headers if the sheet is newly created or empty
    initializeHeadersIfEmpty(sheet);

    // Parse incoming data (supports both JSON body and FormData / URL parameters)
    let data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    const timestamp = data.timestamp || Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    const name = data.name || data.candidateName || "N/A";
    const mobile = data.mobile || data.mobileNumber || "N/A";
    const rollNumber = data.rollNumber || data.roll || "N/A";
    const zone = data.zone || data.zoneName || "N/A";
    const status = data.status || "CHECKED";
    const userAgent = data.userAgent || "Web Browser";

    // Append the row: Timestamp | Candidate Name | Mobile Number | Roll Number | Zone | Result Status | Device/Browser
    sheet.appendRow([
      timestamp,
      name,
      mobile.toString(),
      rollNumber.toString(),
      zone,
      status,
      userAgent
    ]);

    // Format status cell color (Green for QUALIFIED, Light Red for NOT QUALIFIED)
    const lastRow = sheet.getLastRow();
    const statusCell = sheet.getRange(lastRow, 6);
    if (String(status).toUpperCase().includes("QUALIFIED") && !String(status).toUpperCase().includes("NOT")) {
      statusCell.setBackground("#d4edda").setFontColor("#155724").setFontWeight("bold");
    } else if (String(status).toUpperCase().includes("NOT")) {
      statusCell.setBackground("#f8d7da").setFontColor("#721c24");
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Result log recorded successfully",
      row: lastRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Handles GET request for quick verification and health check
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "RRB ALP CBT-2 Result Tracker API",
    spreadsheetId: SPREADSHEET_ID,
    timestamp: Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss"),
    instructions: "Send a POST request with { name, mobile, rollNumber, zone, status } to record candidate lookups."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup header styling if row 1 is blank
 */
function initializeHeadersIfEmpty(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      "Timestamp (IST)",
      "Candidate Name",
      "Mobile Number",
      "Roll Number",
      "RRB Zone",
      "Result Status",
      "Device / User Agent"
    ];

    sheet.appendRow(headers);

    // Format Header Row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1a365d");
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1);

    // Set Column Widths
    sheet.setColumnWidth(1, 170); // Timestamp
    sheet.setColumnWidth(2, 200); // Name
    sheet.setColumnWidth(3, 140); // Mobile
    sheet.setColumnWidth(4, 180); // Roll
    sheet.setColumnWidth(5, 200); // Zone
    sheet.setColumnWidth(6, 160); // Status
    sheet.setColumnWidth(7, 240); // Device
  }
}
