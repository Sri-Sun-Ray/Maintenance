// =======================
// Zone and Station Mapping
// =======================
const zoneStation = {
  "CR": ["Bhusawal", "Kalyan"],
  "ER": ["Asansol", "Barddhaman", "Dankuni", "Howarh D", "Howrah E", "Jamalpur"],
  "NFR": ["Malda"],
  "SER": ["Tatanagar"],
  "ECR": ["DDUD", "DDUE", "Gomoh", "Patratu"],
  "WCR": ["Itarsi", "Tuglakabadh"],
  "NCR": ["Jhansi D", "Jhansi E"],
  "NR": ["Lucknow(Alambagh)", "Ludhiana"]
};

// Get zone from station
function getZoneFromStation(station) {
  for (const [zone, stations] of Object.entries(zoneStation)) {
    if (stations.includes(station)) return zone;
  }
  return null;
}

// Populate station dropdown
function populateStationDropdown(zone) {
  const stationSelect = document.getElementById("station");
  const stations = zoneStation[zone] || [];
  stationSelect.innerHTML = '<option value="">-- Select Station --</option>';
  stations.forEach(station => {
    const option = document.createElement("option");
    option.value = station;
    option.textContent = station;
    stationSelect.appendChild(option);
  });
}

// =======================
// Logout
// =======================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// =======================
// Save FIE Info
// =======================
function saveInfo() {
    const zone = document.getElementById("zone").value.trim();
    const station = document.getElementById("station").value.trim();
    const fie = document.getElementById("fie").value.trim();
    const equipNo = document.getElementById("equipNo").value.trim();

    if (!zone || !station || !fie || !equipNo) {
        alert("❌ Please fill all fields");
        return;
    }

    const data = {
        zone,
        station,
        fie_no: fie,   // must match PHP
        equip_no: equipNo
    };

    fetch("FIE_details.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success || result.message === "Record already exists") {
            alert(result.success ? "✅ Data Saved Successfully!" : "ℹ️ Record Already Exists");

            // Enable sidebar modules
            const sidebar = document.querySelector('.sidebar');
            sidebar.style.pointerEvents = 'auto';
            sidebar.style.opacity = '1';

            // Save in sessionStorage
            sessionStorage.setItem('zone', zone);
            sessionStorage.setItem('station', station);
            sessionStorage.setItem('fieNo', fie);
            sessionStorage.setItem('equipNo', equipNo);

            // Load existing module data
            loadAllModuleData();

            // Update Save/Get Details buttons
            document.getElementById('btn-save').style.display = 'none';
            document.getElementById('btn-get_details').style.display = 'block';
        } else {
            alert("❌ Error: " + result.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("❌ Something went wrong");
    });
}

// =======================
// Page Load Handling
// =======================
window.addEventListener("DOMContentLoaded", () => {
  // Load zone/station from session or localStorage
  const sessionStation = sessionStorage.getItem('station');
  const storedZone = localStorage.getItem("zone");
  const storedStation = localStorage.getItem("selectedStation");
  const storedFie = localStorage.getItem("fieNo");
  const storedEquipNo = localStorage.getItem("equipNo");

  if (sessionStation) {
    const zone = getZoneFromStation(sessionStation);
    if (zone) {
      document.getElementById("zone").value = zone;
      populateStationDropdown(zone);
      document.getElementById("station").value = sessionStation;
      localStorage.setItem("zone", zone);
      localStorage.setItem("selectedStation", sessionStation);
    }
  } else if (storedZone && storedStation) {
    document.getElementById("zone").value = storedZone;
    populateStationDropdown(storedZone);
    document.getElementById("station").value = storedStation;
  }

  // Handle zone change
  document.getElementById("zone")?.addEventListener("change", function() {
    populateStationDropdown(this.value);
    document.getElementById("station").value = "";
  });

  // Restore FIE/Equip fields
  const sessionFie = sessionStorage.getItem('fieNo');
  const sessionEquip = sessionStorage.getItem('equipNo');
  if (sessionFie && sessionEquip) {
    document.getElementById("fie").value = sessionFie;
    document.getElementById("equipNo").value = sessionEquip;
    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
  } else if (storedFie && storedEquipNo) {
    document.getElementById("fie").value = storedFie;
    document.getElementById("equipNo").value = storedEquipNo;
    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
    sessionStorage.setItem('fieNo', storedFie);
    sessionStorage.setItem('equipNo', storedEquipNo);
  } else {
    document.getElementById('btn-save').style.display = 'block';
    document.getElementById('btn-get_details').style.display = 'none';
  }

  // Initialize image cells
  modules.forEach(moduleId => {
    const tableBody = document.getElementById(moduleId + 'TableBody');
    if (!tableBody) return;
    tableBody.querySelectorAll('.image-cell').forEach(td => initializeBlankImageCell(td));
  });
});
// Function to display the selected module and hide the others
function showModule(moduleId) {
  // Hide all module content first
  const modules = ['verification', 'monthly', 'components'];
  modules.forEach(id => {
    const module = document.getElementById(id);
    if (module) {
      module.style.display = 'none';
    }
  });

  // Show the selected module
  const selectedModule = document.getElementById(moduleId);
  if (selectedModule) {
    selectedModule.style.display = 'block';
  }
}

// =======================
// Get FIE Details
// =======================
function get() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const fie = document.getElementById("fie").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  if (!zone || !station || !fie || !equipNo) return alert("Please fill all FIE details first.");

  const data = { zone, station, fie_no: fie, equip_no: equipNo };

  fetch("FIE_details.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    if (result.success || result.message === "Record already exists") {
      sessionStorage.setItem('zone', zone);
      sessionStorage.setItem('station', station);
      sessionStorage.setItem('fieNo', fie);
      sessionStorage.setItem('equipNo', equipNo);

      // Enable sidebar modules
      const sidebar = document.querySelector('.sidebar');
      sidebar.style.pointerEvents = 'auto';
      sidebar.style.opacity = '1';

      loadAllModuleData();

      alert(result.success ? "✔️ New FIE Saved!" : "ℹ️ FIE already exists!");
    } else {
      alert("❌ Error: " + result.message);
    }
  })
  .catch(err => console.error(err) || alert("❌ Something went wrong"));
}

// =======================
// Modules Handling
// =======================
const modules = ['verification', 'monthly', 'components'];

// Load all module data
function loadAllModuleData() {
  modules.forEach(loadModuleData);
}

// Load module data
function loadModuleData(moduleId) {
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const fieNo = sessionStorage.getItem('fieNo');
  const equipNo = sessionStorage.getItem('equipNo');
  if (!zone || !station || !fieNo || !equipNo) return;

  const data = { zone, station, fie_no: fieNo, equip_no: equipNo, module: moduleId };

  fetch("get_module_data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {
    if (result.success && result.data?.length) populateModuleTable(moduleId, result.data);
  })
  .catch(err => console.error("Error loading module:", moduleId, err));
}

// Populate module table
function populateModuleTable(moduleId, data) {
  const tableBody = document.getElementById(moduleId + 'TableBody');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    if (moduleId === 'verification') {
      tr.innerHTML = `
        <td>${row.details_of_equipment || row.description}</td>
        <td><input type="text" value="${row.name_number || ''}"></td>
        <td><input type="date" value="${row.date_of_commissioning || ''}"></td>
        <td>${row.required_value || row.action_taken}</td>
        <td><input type="text" value="${row.observed_value || row.observation || ''}"></td>
        <td><input type="text" value="${row.remarks || ''}"></td>
        <td class="image-cell"></td>
      `;
    } else if (moduleId === 'monthly') {
      tr.innerHTML = `
        <td>${row.item_no || row.sl_no}</td>
        <td>${row.location}</td>
        <td>${row.maintenance_task || row.description}</td>
        <td>${row.action_taken_range || row.action_taken}</td>
        <td>${row.frequency}</td>
        <td><textarea>${row.equipment_condition || row.observation || ''}</textarea></td>
        <td><input type="text" value="${row.remarks || ''}"></td>
        <td class="image-cell"></td>
      `;
    } else if (moduleId === 'components') {
      tr.innerHTML = `
        <td><input type="text" value="${row.component_name || ''}"></td>
        <td><input type="text" value="${row.qty || ''}"></td>
        <td><input type="text" value="${row.reason_for_replacement || ''}"></td>
        <td><input type="text" value="${row.remarks || ''}"></td>
        <td class="image-cell"></td>
      `;
    }

    tableBody.appendChild(tr);
    const imgTd = tr.querySelector('.image-cell');
    hydrateImageCellWithExisting(imgTd, row.image_paths || (row.image_path ? [row.image_path] : []));
  });
}

// =======================
// Image Handling
// =======================
function buildImageCellMarkup() {
  return `
    <div class="image-collection">
      <div class="image-list"></div>
      <div class="image-actions">
        <button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>
      </div>
    </div>`;
}

// Initialize blank image cell
function initializeBlankImageCell(td) {
  if (!td || td.dataset.imageCellInitialized === '1') return;
  td.dataset.imageCellInitialized = '1';
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];
  td.removedExistingImages = td.removedExistingImages || [];
  td.innerHTML = buildImageCellMarkup();
  renderImageList(td);
}

// Render image list
function renderImageList(td) {
  if (!td) return;
  const imgList = td.querySelector('.image-list');
  if (!imgList) return;

  imgList.innerHTML = '';
  const allImages = [...(td.existingImages || []), ...(td.newImages || [])];

  if (!allImages.length) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'image-box image-empty';
    emptyDiv.textContent = 'No images';
    imgList.appendChild(emptyDiv);
    return;
  }

  allImages.forEach((img, idx) => {
    const isExisting = idx < (td.existingImages || []).length;
    const src = isExisting ? img : (img.dataUrl || URL.createObjectURL(img.file));
    const box = document.createElement('div');
    box.className = 'image-box';

    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.className = 'uploaded-image';
    imgEl.onclick = () => openImagePreview(src);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '×';
    removeBtn.onclick = e => { e.stopPropagation(); removeImageFromCell(td, idx, isExisting ? 'existing' : 'new', isExisting ? img : null); };

    box.appendChild(imgEl);
    box.appendChild(removeBtn);
    imgList.appendChild(box);
  });
}

function removeImageFromCell(td, index, type, removed) {
  if (!td) return;
  if (type === 'existing') {
    td.existingImages.splice(index, 1);
    if (removed) td.removedExistingImages.push(removed);
  } else if (type === 'new') {
    td.newImages.splice(index, 1);
  }
  renderImageList(td);
}

function openImagePreview(src) {
  if (!src) return;
  const modal = document.getElementById('imagePreviewModal');
  const img = document.getElementById('imagePreviewElement');
  if (!modal || !img) return;
  img.src = src;
  modal.style.display = 'flex';
}

function closeImagePreview() {
  const modal = document.getElementById('imagePreviewModal');
  const img = document.getElementById('imagePreviewElement');
  if (modal) modal.style.display = 'none';
  if (img) img.src = '';
}
window.openImagePreview = openImagePreview;
window.closeImagePreview = closeImagePreview;

// =======================
// Add Component Row
// =======================
function addComponentRow() {
  const tableBody = document.getElementById('componentsTableBody');
  if (!tableBody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td class="image-cell"><button onclick="openImageOptions(this)">Add Image</button></td>`;
  tableBody.appendChild(tr);

  const imgTd = tr.querySelector('.image-cell');
  initializeBlankImageCell(imgTd);
}
