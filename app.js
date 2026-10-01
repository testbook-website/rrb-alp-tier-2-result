/**
 * RRB ALP CBT-2 Result Checker - Compact Widget Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  initZoneSelect();
  initFormHandler();
});

/**
 * Populate RRB Zones Dropdown
 */
function initZoneSelect() {
  const select = document.getElementById("rrbZone");
  if (!select) return;

  select.innerHTML = `<option value="">Select Zone</option>`;

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
    const prefix = zone.status === "available" ? "🟢 " : "⏳ ";
    const suffix = zone.status === "available" ? " (Live)" : "";
    opt.textContent = `${prefix}${zone.name}${suffix}`;
    select.appendChild(opt);
  });
}

/**
 * Handle Result Verification Form Submit
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

    if (!name || name.length < 2) {
      alert("Please enter candidate full name.");
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

    if (!rollNumber || rollNumber.length < 6) {
      alert("Please enter your Roll Number.");
      return;
    }

    // Loading State
    btnSubmit.disabled = true;
    btnSpinner.style.display = "inline-block";
    btnText.textContent = "Checking...";

    await new Promise((r) => setTimeout(r, 450));

    const zone = RRB_ZONES[zoneKey];
    let resultStatus = "ZONE PENDING";
    let isQualified = false;

    if (zone.status === "available") {
      isQualified = zone.rolls.includes(rollNumber);
      resultStatus = isQualified ? "QUALIFIED" : "NOT QUALIFIED";
    }

    // Render Compact Result Card
    renderCompactResult(name, mobile, rollNumber, zone, isQualified, zone.status === "available");

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

    // Reset Button
    btnSubmit.disabled = false;
    btnSpinner.style.display = "none";
    btnText.textContent = "Check Result";
  });
}

/**
 * Render Compact Result UI
 */
function renderCompactResult(name, mobile, rollNumber, zone, isQualified, isZoneAvailable) {
  const container = document.getElementById("resultContainer");
  container.style.display = "block";

  if (!isZoneAvailable) {
    container.className = "compact-result-box pending";
    container.innerHTML = `
      <div class="result-badge">⏳ Awaiting Release</div>
      <div class="res-name">${escapeHtml(zone.name)}</div>
      <div class="res-desc">Results for this zone are being uploaded. Please check back shortly.</div>
      <div class="res-actions">
        <a href="${zone.officialWebsite}" target="_blank" class="btn-mini btn-reset">Official Website</a>
      </div>
    `;
    return;
  }

  if (isQualified) {
    triggerConfetti();
    container.className = "compact-result-box qualified";
    container.innerHTML = `
      <div class="result-badge">🎉 Qualified for CBAT (Stage 3)</div>
      <div class="res-name">Congratulations, ${escapeHtml(name)}!</div>
      <div class="res-desc">Your roll number is shortlisted in ${zone.name}.</div>
      
      <div class="res-grid">
        <div class="res-cell">
          <small>Roll Number</small>
          <span style="font-family: monospace;">${escapeHtml(rollNumber)}</span>
        </div>
        <div class="res-cell">
          <small>Applied Zone</small>
          <span>${zone.name}</span>
        </div>
      </div>

      <div class="res-actions">
        <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`🎉 I QUALIFIED RRB ALP CBT-2 (${zone.name})! Roll No: ${rollNumber}`)}" target="_blank" class="btn-mini btn-whatsapp">
          💬 Share on WhatsApp
        </a>
        <button onclick="document.getElementById('rollNumber').focus()" class="btn-mini btn-reset">
          🔄 Check Another
        </button>
      </div>
    `;
  } else {
    container.className = "compact-result-box not-qualified";
    container.innerHTML = `
      <div class="result-badge">ℹ️ Not In Shortlist</div>
      <div class="res-name">Roll No: ${escapeHtml(rollNumber)}</div>
      <div class="res-desc">Not found in current shortlisted candidates for ${zone.name}.</div>
      
      <div class="res-grid">
        <div class="res-cell">
          <small>Candidate</small>
          <span>${escapeHtml(name)}</span>
        </div>
        <div class="res-cell">
          <small>Zone</small>
          <span>${zone.name}</span>
        </div>
      </div>

      <div class="res-actions">
        <a href="${zone.officialWebsite}" target="_blank" class="btn-mini btn-reset">
          🌐 Official Portal
        </a>
        <button onclick="document.getElementById('rollNumber').focus()" class="btn-mini btn-reset">
          🔄 Retry
        </button>
      </div>
    `;
  }
}

/**
 * Async send to Google Apps Script
 */
async function sendDataToGoogleSheet(payload) {
  const scriptUrl = CONFIG.GOOGLE_SCRIPT_URL;

  try {
    const history = JSON.parse(localStorage.getItem("rrb_alp_searches") || "[]");
    history.push(payload);
    localStorage.setItem("rrb_alp_searches", JSON.stringify(history.slice(-30)));
  } catch (e) {}

  if (!scriptUrl || scriptUrl.trim() === "") return;

  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.error("Sync error:", err);
  }
}

/**
 * Lightweight Confetti Effect
 */
function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

  for (let i = 0; i < 70; i++) {
    particles.push({
      x: canvas.width * 0.5,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 14,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
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
      p.vy += 0.3;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      if (elapsed > 1200) {
        p.opacity = Math.max(0, p.opacity - 0.03);
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (elapsed < 2400) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  animate();
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
