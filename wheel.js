const SPIN_DURATION_MS = 5000;
const MIN_ROTATIONS = 5;
const MAX_EXTRA_ROTATIONS = 10;
const CANVAS_PADDING = 5;
const TEXT_OFFSET = 10;
const FONT_STYLE = "16px Arial";

const config = {
  sections: [],
  colors: [],
  allowedStaffIds: []
};

const state = {
  currentAngle: 0,
  spinning: false,
  enteredStaffIds: new Set(loadStaffIdsFromStorage())
};

const message = document.getElementById("message");
const spinButton = document.getElementById("spinButton");
const wheelCanvas = document.getElementById("wheelCanvas");
const ctx = wheelCanvas.getContext("2d");

// Load config files and draw the wheel when the page loads
window.onload = async function () {
  try {
    const [staffRes, wheelRes] = await Promise.all([
      fetch('staff-ids.json'),
      fetch('wheel-config.json')
    ]);
    if (!staffRes.ok) throw new Error(`Could not load staff-ids.json (HTTP ${staffRes.status})`);
    if (!wheelRes.ok) throw new Error(`Could not load wheel-config.json (HTTP ${wheelRes.status})`);
    const staffData = await staffRes.json();
    const wheelData = await wheelRes.json();

    config.allowedStaffIds = staffData.allowedStaffIDs.map(id => id.toUpperCase());
    config.sections = wheelData.sections;
    config.colors = config.sections.map((_, i) => wheelData.colors[i % wheelData.colors.length]);

    drawWheel();
  } catch (err) {
    console.error('Failed to load config:', err);
    message.innerText = 'Error: could not load configuration. Please refresh.';
  }
};

// Validate a staff ID and return an error message, or null if valid
function validateStaffId(staffId) {
  if (!staffId) return "Please enter a valid Staff ID.";
  if (!config.allowedStaffIds.includes(staffId)) return "This Staff ID is not allowed. Please enter an allowed Staff ID.";
  if (state.enteredStaffIds.has(staffId)) return "Staff ID has already been entered. No duplicate spins allowed!";
  return null;
}

// Record a spin for the given staff ID in memory and localStorage
function recordSpin(staffId) {
  state.enteredStaffIds.add(staffId);
  updateStaffIdsInStorage();
}

// Handle the spin button click
function handleSpin() {
  if (state.spinning) return;

  const staffId = document.getElementById("StaffIDInput").value.trim().toUpperCase();
  const error = validateStaffId(staffId);
  if (error) {
    message.innerText = error;
    return;
  }

  recordSpin(staffId);
  document.getElementById("StaffIDInput").value = "";
  message.innerText = `Good luck, ${staffId}!`;
  spinWheel();
}

// Draw the wheel at its current angle
function drawWheel() {
  const centerX = wheelCanvas.width / 2;
  const centerY = wheelCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - CANVAS_PADDING;
  const numSections = config.sections.length;

  for (let i = 0; i < numSections; i++) {
    const startAngle = (i * 2 * Math.PI) / numSections;
    const endAngle = ((i + 1) * 2 * Math.PI) / numSections;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = config.colors[i];
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + (endAngle - startAngle) / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = FONT_STYLE;
    ctx.fillText(config.sections[i], radius - TEXT_OFFSET, 10);
    ctx.restore();
  }
}

// Draw the wheel rotated by the given angle
function drawRotatedWheel(angle) {
  const centerX = wheelCanvas.width / 2;
  const centerY = wheelCanvas.height / 2;

  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.translate(-centerX, -centerY);
  drawWheel();
  ctx.restore();
}

// Spin the wheel and display the result when it stops
function spinWheel() {
  if (state.spinning) return;

  state.spinning = true;
  spinButton.disabled = true;

  const numSections = config.sections.length;
  const anglePerSection = (2 * Math.PI) / numSections;
  const randomSpins = Math.floor(Math.random() * MAX_EXTRA_ROTATIONS) + MIN_ROTATIONS;
  const totalRotation = randomSpins * 2 * Math.PI + anglePerSection / 2;
  let startTime = null;

  function animateSpin(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const easeOutProgress = 1 - Math.pow(1 - elapsed / SPIN_DURATION_MS, 3);

    state.currentAngle = easeOutProgress * totalRotation;
    drawRotatedWheel(state.currentAngle);

    if (elapsed < SPIN_DURATION_MS) {
      requestAnimationFrame(animateSpin);
    } else {
      state.spinning = false;
      spinButton.disabled = false;
      displayResult();
    }
  }

  requestAnimationFrame(animateSpin);
}

// Calculate and display the winning section
function displayResult() {
  const numSections = config.sections.length;
  const anglePerSection = (2 * Math.PI) / numSections;
  let winningIndex = Math.floor((state.currentAngle % (2 * Math.PI)) / anglePerSection);
  winningIndex = (numSections - 1 - winningIndex + numSections) % numSections;
  message.innerText = `The wheel stopped at ${config.sections[winningIndex]}!`;
}

// Save the entered staff IDs to localStorage
function updateStaffIdsInStorage() {
  localStorage.setItem('enteredStaffIDs', JSON.stringify(Array.from(state.enteredStaffIds)));
}

// Load entered staff IDs from localStorage
function loadStaffIdsFromStorage() {
  const saved = localStorage.getItem('enteredStaffIDs');
  return saved ? JSON.parse(saved) : [];
}
