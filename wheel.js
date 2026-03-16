// JavaScript Code (wheel.js)

let allowedStaffIDs = [];

const enteredStaffIDs = new Set(loadStaffIDsFromStorage()); // Load StaffIDs from localStorage
const message = document.getElementById("message");
const spinButton = document.getElementById("spinButton");

const wheelCanvas = document.getElementById("wheelCanvas");
const ctx = wheelCanvas.getContext("2d");

const sections = ["Card Holder", "Stickers", "Card Holder", "Stickers", "Card Holder", "Stickers", "Card Holder", "Stickers", ]; // Wheel sections
const numSections = sections.length;
const colors = ["#FCAA67", "#B0413E", "#FCAA67", "#B0413E", "#FCAA67", "#B0413E", "#FCAA67", "#B0413E", ]; // Colors for sections

let currentAngle = 0;
let spinning = false;

// Load allowed StaffIDs from external JSON and draw the wheel when the page loads
window.onload = async function () {
  try {
    const response = await fetch('staff-ids.json');
    const data = await response.json();
    allowedStaffIDs = data.allowedStaffIDs.map(id => id.toUpperCase());
    console.log('Allowed StaffIDs loaded:', allowedStaffIDs);
  } catch (err) {
    console.error('Failed to load staff IDs:', err);
    message.innerText = 'Error: could not load staff IDs. Please refresh.';
  }
  drawWheel();
};

// Function to draw the wheel
function drawWheel() {
  const centerX = wheelCanvas.width / 2; // Center of the canvas
  const centerY = wheelCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - 5; // Subtract 5 to ensure it fits within the border

  for (let i = 0; i < numSections; i++) {
    const startAngle = (i * 2 * Math.PI) / numSections;
    const endAngle = ((i + 1) * 2 * Math.PI) / numSections;

    // Draw each section
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    ctx.stroke();

    // Add text to each section
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + (endAngle - startAngle) / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText(sections[i], radius - 10, 10);
    ctx.restore();
  }
}

// Function to add StaffID and spin the wheel in one action
function addStaffIDAndSpin() {
  if (spinning) return; // Prevent further clicks while spinning

  const StaffIDInput = document.getElementById("StaffIDInput").value.trim().toUpperCase(); // Convert input StaffID to uppercase

  // Check if input is valid
  if (!StaffIDInput) {
    message.innerText = "Please enter a valid StaffID.";
    return;
  }

  // Check if the StaffID is in the allowed StaffIDs list (comparison is now case-insensitive)
  if (!allowedStaffIDs.includes(StaffIDInput)) {
    message.innerText = "This StaffID is not allowed. Please enter an allowed StaffID.";
    return;
  }

  // Check if the StaffID is already entered
  if (enteredStaffIDs.has(StaffIDInput)) {
    message.innerText = "StaffID has already been entered. No duplicate spins allowed!";
    return;
  }

  // Add StaffID to the entered StaffIDs set
  enteredStaffIDs.add(StaffIDInput);
  updateStaffIDsInStorage(); // Save the new StaffID to localStorage

  // Clear input and message
  document.getElementById("StaffIDInput").value = "";
  message.innerText = `Good luck, ${StaffIDInput}!`;

  // Start spinning the wheel
  spinWheel();
}

// Function to spin the wheel
function spinWheel() {
  if (spinning) return;

  spinning = true;
  spinButton.disabled = true;

  let randomSpins = Math.floor(Math.random() * 10) + 5; // Spin between 5 and 15 rotations
  let anglePerSection = (2 * Math.PI) / numSections;

  let spinDuration = 5000; // 5 seconds for spinning
  let startTime = null;

  // Extend the final rotation to include the half-section adjustment smoothly
  let totalRotation = randomSpins * 2 * Math.PI + anglePerSection / 2; // Add half a section to the final total rotation

  // Animation function for spinning
  function animateSpin(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;

    const progress = elapsed / spinDuration;
    const easeOutProgress = 1 - Math.pow(1 - progress, 3); // Easing for smooth stop

    currentAngle = easeOutProgress * totalRotation;
    drawRotatedWheel(currentAngle);

    if (elapsed < spinDuration) {
      requestAnimationFrame(animateSpin);
    } else {
      spinning = false;
      calculateResult();
      spinButton.disabled = false; // Enable spin button again for the next round
    }
  }

  requestAnimationFrame(animateSpin);
}

// Function to draw the wheel with rotation
function drawRotatedWheel(angle) {
  const centerX = wheelCanvas.width / 2; // Center the wheel in the middle of the canvas
  const centerY = wheelCanvas.height / 2;

  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.translate(-centerX, -centerY);

  drawWheel();

  ctx.restore();
}

// Function to calculate the result after spinning
function calculateResult() {
  let anglePerSection = (2 * Math.PI) / numSections;
  let winningIndex = Math.floor((currentAngle % (2 * Math.PI)) / anglePerSection);

  // Ensure winningIndex is positive and within bounds
  winningIndex = (numSections - 1 - winningIndex + numSections) % numSections;

  const winningSection = sections[winningIndex];

  message.innerText = `The wheel stopped at ${winningSection}!`;
}

// Functions to handle persistence using localStorage

// Save the StaffIDs to localStorage
function updateStaffIDsInStorage() {
  const StaffIDsArray = Array.from(enteredStaffIDs); // Convert Set to array
  localStorage.setItem('enteredStaffIDs', JSON.stringify(StaffIDsArray)); // Store the array as a JSON string
}

// Load StaffIDs from localStorage
function loadStaffIDsFromStorage() {
  const savedStaffIDs = localStorage.getItem('enteredStaffIDs');
  return savedStaffIDs ? JSON.parse(savedStaffIDs) : []; // Return parsed array, or an empty array if nothing is found
}
