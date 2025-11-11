// Load zone from localStorage on page load
window.addEventListener("DOMContentLoaded", function() {
  const storedZone = localStorage.getItem("zone");
  if (storedZone) {
    document.getElementById("zone").value = storedZone;
  }
});

// === Logout ===
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// === Save Info ===
function saveInfo() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riu = document.getElementById("riu").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  if (!zone || !station || !riu || !equipNo) {
    alert("Please fill all fields before saving.");
    return;
  }

  alert(`✅ Data Saved Successfully!\n\nZone: ${zone}\nStation: ${station}\nRIU: ${riu}\nEquipment No: ${equipNo}`);
}

// === Module Switching ===
function showModule(moduleId) {
  const allModules = document.querySelectorAll(".module-table");
  const contentArea = document.getElementById("contentArea");

  // Hide all modules
  allModules.forEach((m) => (m.style.display = "none"));

  // Hide intro text
  const introText = contentArea.querySelector("p");
  if (introText) introText.style.display = "none";

  // Show selected module
  const selected = document.getElementById(moduleId);
  if (selected) selected.style.display = "block";
}

// === Image Handling ===
// === Image Handling Logic ===

// When Add Image is clicked
function openImageOptions(btn) {
  const td = btn.parentElement;

  // Check if there are any images already uploaded
  const currentImages = td.querySelectorAll('.uploaded-image').length;

  // Show options only if no image is already added, or allow adding more
  td.innerHTML = `
    <div class="image-options">
      <button onclick="openCameraInCell(this, 'user')">Front Camera</button>
      <button onclick="openCameraInCell(this, 'environment')">Back Camera</button>
      <button onclick="uploadInCell(this)">Upload from Device</button>
    </div>
  `;
}

// Simulate opening camera
function openCameraInCell(button, facingMode) {
  const td = button.closest("td");
  td.innerHTML = `
    <div class="image-box">
      <p>${facingMode === "user" ? "Front" : "Back"} camera simulated.</p>
      <button onclick="resetImageBox(this)" class="remove-btn">✖</button>
    </div>
  `;
}

// Upload image from device
function uploadInCell(button) {
  const td = button.closest("td");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      // Add the uploaded image to the image box
      td.innerHTML += `
        <div class="image-box">
          <img src="${ev.target.result}" alt="Uploaded" class="uploaded-image">
          <button onclick="removeImage(this)" class="remove-btn">✖</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  };

  input.click();
}

// Reset image box (remove all images) - invoked when "✖" is clicked
function resetImageBox(button) {
  const td = button.closest("td");
  td.innerHTML = `<button onclick="openImageOptions(this)">Add Image</button>`;
}

// Remove individual image
function removeImage(button) {
  const imageBox = button.closest(".image-box");
  imageBox.remove();
}

// === On Load ===
window.onload = () => {
  document.querySelectorAll(".module-table").forEach((m) => (m.style.display = "none"));
};

