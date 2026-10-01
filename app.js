/**
 * RRB ALP CBT-2 Result Checker - Client-side Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initZoneSelect();
  initZonesGrid();
  initFormHandler();
  initZoneChangeWatcher();
  initZonesToggle();
});

/**
 * Populate RRB Zones Dropdown
 */
function initZoneSelect() {
  const select = document.getElementById("rrbZone");
  if (!select) return;

  // Clear existing options except default
  select.innerHTML = `<option value="">-- Choose RRB Board / Zone --</option>`;

  // Sort: Available zones first, then alphabetical
  const zoneKeys = Object.keys(RRB_ZONES).sort((a, b) => {
    const zoneA = RRB_ZONES[a];
    const zoneB = RRB_ZONES[b];
    if (zoneA.status === "available" && zoneB.status !== "available") return -1;
    if (zoneA.status !== "available" && zoneB.status === "available") return 1;
    return zoneA.name.localeCompare(zoneB.name);
  });

  zoneKeys.forEach((key) => {
    const zone = RRB_ZONES[key];
    const opt = document.createElement("option");
    opt.value = key;
    const statusIcon = zone.status === "available" ? "🟢 [LIVE] " : "⏳ ";
    const countInfo = zone.status === "available" ? ` (${zone.totalShortlisted} Shortlisted)` : " (Soon)";
    opt.textContent = `${statusIcon}${zone.name}${countInfo}`;
    select.appendChild(opt);
  });
}

/**
 * Handle zone selection change
 */
function initZoneChangeWatcher() {
  const select = document.getElementById("rrbZone");
  const infoContainer = document.getElementById("zoneStatusInfo");

  select.addEventListener("change", (e) => {
    const zoneKey = e.target.value;
    if (!zoneKey || !RRB_ZONES[zoneKey]) {
      infoContainer.innerHTML = "";
      return;
    }

    const zone = RRB_ZONES[zoneKey];
    if (zone.status === "available") {
      infoContainer.innerHTML = `
        <span class="zone-status-badge available">
          ✓ Results Live: ${zone.totalShortlisted} candidates shortlisted for CBAT
        </span>
      `;
    } else {
      infoContainer.innerHTML = `
        <span class="zone-status-badge coming_soon">
          ⏳ PDF Results awaiting release from ${zone.name}
        </span>
      `;
    }
  });
}

/**
 * Render Zones Status Grid in bottom section
 */
function initZonesGrid() {
  const grid = document.getElementById("zonesGrid");
  if (!grid) return;

  grid.innerHTML = "";

  Object.keys(RRB_ZONES).forEach((key) => {
    const zone = RRB_ZONES[key];
    const isAvailable = zone.status === "available";

    const chip = document.createElement("div");
    chip.className = `zone-chip ${isAvailable ? "active-zone" : ""}`;
    chip.innerHTML = `
      <div>
        <div class="zone-chip-name">${zone.name}</div>
        <small style="color: #64748b;">${zone.code} • ${zone.region}</small>
      </div>
      <span class="chip-status ${isAvailable ? "ready" : "wait"}">
        ${isAvailable ? `✓ ${zone.totalShortlisted} Listed` : "Pending"}
      </span>
    `;

    chip.addEventListener("click", () => {
      const select = document.getElementById("rrbZone");
      select.value = key;
      select.dispatchEvent(new Event("change"));
      document.getElementById("resultForm").scrollIntoView({ behavior: "smooth" });
    });

    grid.appendChild(chip);
  });
}

/**
 * Form Submit & Result Verification
 */
function initFormHandler() {
  const form = document.getElementById("resultForm");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnText = document.getElementById("btnText");
  const resultContainer = document.getElementById("resultContainer");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("candidateName").value.trim();
    const mobile = document.getElementById("mobileNumber").value.trim();
    const zoneKey = document.getElementById("rrbZone").value;
    const rollNumber = document.getElementById("rollNumber").value.trim().replace(/\s+/g, "");

    // Validation
    if (!name || name.length < 2) {
      alert("Please enter a valid candidate name.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!zoneKey || !RRB_ZONES[zoneKey]) {
      alert("Please select your RRB Zone.");
      return;
    }

    if (!rollNumber || rollNumber.length < 8) {
      alert("Please enter a valid Roll Number.");
      return;
    }

    // Set Loading state
    btnSubmit.disabled = true;
    btnSpinner.style.display = "inline-block";
    btnText.textContent = "VERIFYING RESULT...";

    // Small artificial delay for pleasant UI experience
    await new Promise((r) => setTimeout(r, 600));

    const zone = RRB_ZONES[zoneKey];
    let resultStatus = "PENDING";
    let isQualified = false;

    if (zone.status === "available") {
      isQualified = zone.rolls.includes(rollNumber);
      resultStatus = isQualified ? "QUALIFIED" : "NOT QUALIFIED";
    } else {
      resultStatus = "ZONE RESULT PENDING";
    }

    // Display Result UI
    renderResult(name, mobile, rollNumber, zone, isQualified, zone.status === "available");

    // Asynchronously send to Google Sheets
    sendDataToGoogleSheet({
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      name: name,
      mobile: mobile,
      rollNumber: rollNumber,
      zone: zone.name,
      status: resultStatus,
      userAgent: navigator.userAgent
    });

    // Reset button
    btnSubmit.disabled = false;
    btnSpinner.style.display = "none";
    btnText.textContent = "CHECK CBT-2 RESULT";

    // Scroll to result
    resultContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/**
 * Render the Result Card
 */
function renderResult(name, mobile, rollNumber, zone, isQualified, isZoneAvailable) {
  const container = document.getElementById("resultContainer");
  container.style.display = "block";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  if (!isZoneAvailable) {
    container.innerHTML = `
      <div class="result-box pending">
        <div class="status-badge-lg">
          <span>⏳</span> Result Awaiting Release
        </div>
        <h3 class="result-heading" style="color: #92400e;">Results for ${zone.name} Are Being Uploaded</h3>
        <p class="result-subtext">
          The official merit list for <strong>${zone.name}</strong> is currently awaiting release or under compilation. Please check back shortly.
        </p>

        <div class="candidate-slip">
          <div class="slip-item">
            <span class="slip-item-label">Candidate Name</span>
            <span class="slip-item-value">${escapeHtml(name)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Roll Number</span>
            <span class="slip-item-value highlight-roll">${escapeHtml(rollNumber)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Applied RRB Zone</span>
            <span class="slip-item-value">${zone.name}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Check Date</span>
            <span class="slip-item-value">${today}</span>
          </div>
        </div>

        <div class="action-buttons">
          <a href="${zone.officialWebsite}" target="_blank" class="btn-action btn-official">
            🌐 Visit Official ${zone.name} Website
          </a>
          <button onclick="document.getElementById('rrbZone').focus()" class="btn-action btn-print">
            🔄 Check Another Zone
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (isQualified) {
    // Launch celebratory confetti
    triggerConfetti();

    container.innerHTML = `
      <div class="result-box qualified">
        <div class="status-badge-lg">
          <span>🎉</span> PROVISIONALLY SHORTLISTED FOR CBAT (STAGE 3)
        </div>
        <h3 class="result-heading">Congratulations, ${escapeHtml(name)}!</h3>
        <p class="result-subtext">
          Your Roll Number <strong>${escapeHtml(rollNumber)}</strong> is shortlisted in the official CBT-2 merit list for <strong>${zone.name}</strong>.
        </p>

        <div class="candidate-slip">
          <div class="slip-item">
            <span class="slip-item-label">Candidate Name</span>
            <span class="slip-item-value">${escapeHtml(name)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Roll Number</span>
            <span class="slip-item-value highlight-roll">${escapeHtml(rollNumber)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Applied Zone</span>
            <span class="slip-item-value">${zone.name} (${zone.code})</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">CBT-2 Result Status</span>
            <span class="slip-item-value" style="color: #15803d; font-weight: 800;">✓ QUALIFIED FOR CBAT</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Next Stage</span>
            <span class="slip-item-value">Computer Based Aptitude Test (CBAT)</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Verification Date</span>
            <span class="slip-item-value">${today}</span>
          </div>
        </div>

        <div class="instructions-card">
          <h4><span>📌</span> Important Instructions for Shortlisted Candidates:</h4>
          <ul>
            <li><strong>CBAT Examination:</strong> The Computer Based Aptitude Test (CBAT) will be conducted shortly. City intimation and E-Call letters will be uploaded on the official RRB website.</li>
            <li><strong>Medical Fitness & Vision:</strong> Candidates must produce the Vision Certificate in the prescribed format (Annexure VI) from an eye specialist at the time of CBAT.</li>
            <li><strong>Minimum Qualifying Score:</strong> Candidates need to secure a minimum of 42 marks in each of the test batteries to qualify in CBAT.</li>
          </ul>
        </div>

        <div class="action-buttons">
          <button onclick="window.print()" class="btn-action btn-print">
            🖨️ Print / Save Result Slip (PDF)
          </button>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🎉 I have QUALIFIED RRB ALP CBT-2 for ${zone.name}! Roll No: ${rollNumber}. Check yours here!`)}" target="_blank" class="btn-action btn-share">
            💬 Share on WhatsApp
          </a>
          <a href="${zone.officialWebsite}" target="_blank" class="btn-action btn-official">
            🌐 Official RRB Portal
          </a>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="result-box not-qualified">
        <div class="status-badge-lg">
          <span>ℹ️</span> NOT IN CURRENT SHORTLIST
        </div>
        <h3 class="result-heading">Roll Number Not Found in ${zone.name} List</h3>
        <p class="result-subtext">
          Roll Number <strong>${escapeHtml(rollNumber)}</strong> was not found in the PDF list of ${zone.totalShortlisted} candidates shortlisted for CBAT from ${zone.name}.
        </p>

        <div class="candidate-slip">
          <div class="slip-item">
            <span class="slip-item-label">Candidate Name</span>
            <span class="slip-item-value">${escapeHtml(name)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Roll Number Checked</span>
            <span class="slip-item-value highlight-roll">${escapeHtml(rollNumber)}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">RRB Zone Checked</span>
            <span class="slip-item-value">${zone.name}</span>
          </div>
          <div class="slip-item">
            <span class="slip-item-label">Check Date</span>
            <span class="slip-item-value">${today}</span>
          </div>
        </div>

        <div class="instructions-card">
          <h4><span>💡</span> What should you do?</h4>
          <ul>
            <li>Please double check your 16-digit Roll Number and ensure you selected the correct applied RRB Zone.</li>
            <li>Individual scorecards and cutoff marks will be available through candidate login on the official RRB website.</li>
          </ul>
        </div>

        <div class="action-buttons">
          <a href="${zone.officialWebsite}" target="_blank" class="btn-action btn-official">
            🌐 Visit Official ${zone.name} Portal
          </a>
          <button onclick="document.getElementById('rollNumber').focus()" class="btn-action btn-print">
            🔄 Check Again
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Asynchronously Send Candidate Data to Google Sheets via Apps Script Web App
 */
async function sendDataToGoogleSheet(payload) {
  const scriptUrl = CONFIG.GOOGLE_SCRIPT_URL;

  // Save in localStorage as a backup log
  try {
    const history = JSON.parse(localStorage.getItem("rrb_alp_searches") || "[]");
    history.push(payload);
    localStorage.setItem("rrb_alp_searches", JSON.stringify(history.slice(-50)));
  } catch (e) {}

  if (!scriptUrl || scriptUrl.trim() === "") {
    console.warn("Google Apps Script URL is not configured yet. Configure it in config.js");
    return;
  }

  try {
    // Mode no-cors avoids browser CORS preflight blocking
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });
    console.log("Candidate data synced to Google Sheet successfully.");
  } catch (error) {
    console.error("Error sending data to Google Sheet:", error);
  }
}

/**
 * Lightweight Pure JavaScript Confetti Effect
 */
function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#ffffff"];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: canvas.width * 0.5,
      y: canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.7) * 18,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      opacity: 1
    });
  }

  let animationFrame;
  const startTime = Date.now();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Air resistance
      p.rotation += p.rotationSpeed;
      if (elapsed > 1800) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (elapsed < 3500) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  animate();
}

/**
 * Toggle Zones Directory View
 */
function initZonesToggle() {
  const header = document.getElementById("zonesHeaderToggle");
  const grid = document.getElementById("zonesGrid");
  const icon = document.getElementById("toggleIcon");

  if (!header || !grid) return;

  header.addEventListener("click", () => {
    const isHidden = grid.style.display === "none";
    grid.style.display = isHidden ? "grid" : "none";
    icon.textContent = isHidden ? "▼" : "▲";
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
