// Zone and Station mapping
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


// Populate station dropdown based on zone
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

  localStorage.setItem("selectedStation", station);
  localStorage.setItem("riuNo", riu);
  localStorage.setItem("equipNo", equipNo);

  const data = {
    zone: zone,
    station: station,
    riu_no: riu,
    equip_no: equipNo
  };

  fetch("RIU_details.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      sessionStorage.setItem('zone', zone);
      sessionStorage.setItem('station', station);
      sessionStorage.setItem('riuNo', riu);
      sessionStorage.setItem('equipNo', equipNo);

      alert(`✅ Data Saved Successfully!`);
      document.querySelector('.sidebar').style.pointerEvents = 'auto';
    }
    else if(result.message=== 'Record already exists')
      {
        alert(" Record already exists");
         // Hide save button, show get details button
      document.getElementById('btn-save').style.display = 'none';
      document.getElementById('btn-get_details').style.display = 'block';
      document.querySelector('.sidebar').style.pointerEvents = 'auto';
      }
      else {
      alert("❌ Error saving data: " + result.message);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Something went wrong. Please try again.");
  });
}

window.addEventListener("DOMContentLoaded", function() {
  // Check if user is refreshing the page
  const isRefresh = performance.navigation.type === 1 || 
                    (performance.getEntriesByType("navigation")[0]?.type === "reload");

  // Load stored zone and station first (don't clear these)
  const storedZone = localStorage.getItem("zone");
  const storedStation = localStorage.getItem("selectedStation");
  const storedRiu = localStorage.getItem("riuNo");
  const storedEquipNo = localStorage.getItem("equipNo");

  if (storedZone) {
    document.getElementById("zone").value = storedZone;
    populateStationDropdown(storedZone);
  }

  if (storedStation) {
    document.getElementById("station").value = storedStation;
  }

  if (isRefresh) {
    // Show confirmation dialog only for RIU data, not zone/station
    const shouldClear = confirm("Do you want to clear RIU data and start a new report?\n\nZone and Station will be retained.");
    
    if (shouldClear) {
      // Clear only session and RIU/Equipment data
      sessionStorage.clear();
      
      // Clear ONLY RIU and Equipment fields
      document.getElementById("riu").value = '';
      document.getElementById("equipNo").value = '';
      
      // Remove RIU-specific localStorage items ONLY (keep zone/station)
      localStorage.removeItem("riuNo");
      localStorage.removeItem("equipNo");
      // DON'T remove selectedStation - keep it!
      
      // Show Save button for new report
      document.getElementById('btn-save').style.display = 'block';
      document.getElementById('btn-get_details').style.display = 'none';
      return;
    }
  }

  // If user clicked Cancel or not a refresh, restore data normally
  // Clear RIU and Equipment fields only
  document.getElementById("riu").value = '';
  document.getElementById("equipNo").value = '';

  // Check sessionStorage (user already filled details in this session)
  const sessionZone = sessionStorage.getItem('zone');
  const sessionStation = sessionStorage.getItem('station');
  const sessionRiu = sessionStorage.getItem('riuNo');
  const sessionEquipNo = sessionStorage.getItem('equipNo');

  // If sessionStorage has data, restore RIU/Equipment and show Get Details
  if (sessionZone && sessionStation && sessionRiu && sessionEquipNo) {
    document.getElementById("riu").value = sessionRiu;
    document.getElementById("equipNo").value = sessionEquipNo;

    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
  }
  // If only localStorage has data (zone/station + RIU/Equipment), restore to sessionStorage and show Get Details
  else if (storedZone && storedStation && storedRiu && storedEquipNo) {
    // Restore to sessionStorage for consistency
    sessionStorage.setItem('zone', storedZone);
    sessionStorage.setItem('station', storedStation);
    sessionStorage.setItem('riuNo', storedRiu);
    sessionStorage.setItem('equipNo', storedEquipNo);

    document.getElementById("riu").value = storedRiu;
    document.getElementById("equipNo").value = storedEquipNo;

    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
  }
  // If only zone/station in localStorage, show Save button
  else if (storedZone && storedStation) {
    document.getElementById('btn-save').style.display = 'block';
    document.getElementById('btn-get_details').style.display = 'none';
  }
  // Otherwise show Save button
  else {
    document.getElementById('btn-save').style.display = 'block';
    document.getElementById('btn-get_details').style.display = 'none';
  }

  const editStation = localStorage.getItem('editStation');
  const editRiu = localStorage.getItem('editRiu');
  const editEquip = localStorage.getItem('editEquip');

  if (editStation) {
    document.getElementById("station").value = editStation;
  }
  if (editRiu) {
    document.getElementById("riu").value = editRiu;
    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
    document.querySelector('.sidebar').style.pointerEvents = 'auto';
  }
  if (editEquip) {
    document.getElementById("equipNo").value = editEquip;
  }
});


// Check if RIU is existing (has data) or new
function checkIfExistingRiu(zone, station, riu, equipNo) {
  const data = {
    zone: zone,
    station: station,
    riu_no: riu,
    equip_no: equipNo
  };

  fetch("RIU_details.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.message === "Record already exists") {
      // Existing RIU - show Get Details
      document.getElementById('btn-save').style.display = 'none';
      document.getElementById('btn-get_details').style.display = 'block';
    } else {
      // New RIU - show Save
      document.getElementById('btn-save').style.display = 'block';
      document.getElementById('btn-get_details').style.display = 'none';
    }
  })
  .catch(error => console.error("Error checking RIU:", error));
}

// Load module data after RIU info is saved
function loadModuleData(moduleId) {
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const riuNo = sessionStorage.getItem('riuNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !riuNo || !equipNo) {
    return;
  }

  const data = {
    zone: zone,
    station: station,
    riu_no: riuNo,
    equip_no: equipNo,
    module: moduleId
  };

  fetch("get_module_data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    console.log("Load module result:", result); // DEBUG
    if (result.success && result.data && result.data.length > 0) {
      populateModuleTable(moduleId, result.data);
    } else {
      console.log("No data found for module:", moduleId); // DEBUG
    }
  })
  .catch(error => {
    console.error("Error loading module data:", error);
  });
}

// Populate module table with existing data
function populateModuleTable(moduleId, data) {
	const tableBodyId = moduleId + 'TableBody';
	const tableBody = document.getElementById(tableBodyId);
	if (!tableBody) return;

	tableBody.innerHTML = '';

	data.forEach(row => {
		const tr = document.createElement('tr');

		tr.innerHTML = `
		  <td>${row.sl_no}</td>
		  <td>${row.description}</td>
		  <td>${row.action_taken}</td>
		  <td><textarea placeholder="Observation">${row.observation || ''}</textarea></td>
		  <td><input type="text" value="${row.remarks || ''}" placeholder="Remarks" /></td>
          <td class="image-cell"></td>
		`;
		tableBody.appendChild(tr);

		// store metadata on the td for later upload/update handling
		const appendedRowTds = tr.querySelectorAll('td');
		if (appendedRowTds && appendedRowTds.length >= 6) {
			const imgTd = appendedRowTds[5];
            const paths = Array.isArray(row.image_paths)
                ? row.image_paths
                : (row.image_path ? [row.image_path] : []);
            hydrateImageCellWithExisting(imgTd, paths);
		}
	});
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

  // Attach metadata to all table rows (static or dynamic)
  attachMetadataToRows(moduleId);

  // DON'T automatically load data - only load when "Get Details" is clicked
}

// Attach metadata to table rows for image handling
function attachMetadataToRows(moduleId) {
  const tableBodyId = moduleId + 'TableBody';
  const tableBody = document.getElementById(tableBodyId);
  
  if (!tableBody) return;
  
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 6) {
      const imgTd = cells[5];
      initializeBlankImageCell(imgTd);
    }
  });
}

// === Image Handling (multi-image support) ===
const activeCellCameras = {};
const cameraCellMap = {};

function buildImageCellMarkup() {
  return `
    <div class="image-collection">
      <div class="image-list"></div>
      <div class="image-actions">
        <button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>
      </div>
    </div>
  `;
}

function initializeBlankImageCell(td) {
  if (!td || td.dataset.imageCellInitialized === '1') {
    return;
  }
  td.dataset.imageCellInitialized = '1';
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];
  td.removedExistingImages = td.removedExistingImages || [];
  td.innerHTML = buildImageCellMarkup();
  renderImageList(td);
}

function hydrateImageCellWithExisting(td, existingPaths) {
  if (!td) return;
  td.dataset.imageCellInitialized = '0';
  initializeBlankImageCell(td);
  const normalized = Array.isArray(existingPaths)
    ? existingPaths.filter(Boolean)
    : (existingPaths ? [existingPaths] : []);
  td.existingImages = [...normalized];
  td.newImages = [];
  td.removedExistingImages = [];
  renderImageList(td);
}

function renderImageList(td) {
  if (!td) return;
  initializeBlankImageCell(td);
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];
  td.removedExistingImages = td.removedExistingImages || [];

  const list = td.querySelector('.image-list');
  if (!list) return;
  list.innerHTML = '';

  const existing = td.existingImages;
  const newcomers = td.newImages;
  if ((!existing || existing.length === 0) && (!newcomers || newcomers.length === 0)) {
    list.innerHTML = '<div class="image-empty">No images yet</div>';
    return;
  }

  existing.forEach((path, idx) => {
    const div = document.createElement('div');
    div.className = 'image-box';
    div.innerHTML = `
      <img src="${path}" alt="Uploaded" class="uploaded-image">
      <button type="button" class="remove-btn" data-type="existing" data-index="${idx}" onclick="removeImage(this)">✖</button>
    `;
    list.appendChild(div);
    const imgEl = div.querySelector('img');
    if (imgEl) {
      imgEl.addEventListener('click', () => openImagePreview(path));
    }
  });

  newcomers.forEach((imgObj, idx) => {
    const div = document.createElement('div');
    div.className = 'image-box';
    div.innerHTML = `
      <img src="${imgObj.preview}" alt="Uploaded" class="uploaded-image">
      <button type="button" class="remove-btn" data-type="new" data-index="${idx}" onclick="removeImage(this)">✖</button>
    `;
    list.appendChild(div);
    const imgEl = div.querySelector('img');
    if (imgEl) {
      imgEl.addEventListener('click', () => openImagePreview(imgObj.preview));
    }
  });
}

function resetImageActions(td) {
  if (!td) return;
  const actions = td.querySelector('.image-actions');
  if (actions) {
    actions.innerHTML = `<button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>`;
  }
}

function addNewImageToCell(td, file, previewSrc) {
  if (!td) return;
  initializeBlankImageCell(td);
  td.newImages = td.newImages || [];
  td.newImages.push({ file, preview: previewSrc });
  renderImageList(td);
}

function openImageOptions(btn) {
  const td = btn.closest('td');
  if (!td) return;
  initializeBlankImageCell(td);
  const actions = td.querySelector('.image-actions');
  if (!actions) return;
  actions.innerHTML = `
    <div class="image-options">
      <button type="button" onclick="openCameraInCell(this, 'user')">Front Camera</button>
      <button type="button" onclick="openCameraInCell(this, 'environment')">Back Camera</button>
      <button type="button" onclick="uploadInCell(this)">Upload from Device</button>
      <button type="button" class="cancel-btn" onclick="closeImageOptions(this)">Cancel</button>
    </div>
  `;
}

function closeImageOptions(button) {
  const td = button.closest('td');
  resetImageActions(td);
}

function openCameraInCell(button, facingMode) {
  const td = button.closest('td');
  if (!td) return;
  initializeBlankImageCell(td);
  const actions = td.querySelector('.image-actions');
  if (!actions) return;

  const rowId = Date.now();
  actions.innerHTML = `
    <div class="camera-container" data-camera-id="${rowId}">
      <video id="camera-${rowId}" autoplay playsinline style="width:100%;border:1px solid #333;border-radius:6px;"></video>
      <div class="camera-controls">
        <button type="button" onclick="captureImageInCell(${rowId})">Capture</button>
        <button type="button" onclick="stopCameraInCell(${rowId})">Close</button>
      </div>
    </div>
  `;

  startCameraInCell(rowId, facingMode, td);
}

async function startCameraInCell(rowId, facingMode, td) {
  const video = document.getElementById(`camera-${rowId}`);
  if (!video) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false
    });
    video.srcObject = stream;
    activeCellCameras[rowId] = stream;
    cameraCellMap[rowId] = td;
  } catch (err) {
    alert("Camera access denied!");
    console.error(err);
    resetImageActions(td);
  }
}

function stopCameraInCell(rowId) {
  const stream = activeCellCameras[rowId];
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    delete activeCellCameras[rowId];
  }
  const td = cameraCellMap[rowId];
  if (td) {
    resetImageActions(td);
  }
  delete cameraCellMap[rowId];
}

function captureImageInCell(rowId) {
  const video = document.getElementById(`camera-${rowId}`);
  if (!video) return;
  const td = cameraCellMap[rowId];
  if (!td) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    if (!blob) return;
    const file = new File([blob], `capture-${rowId}.png`, { type: 'image/png' });
    const reader = new FileReader();
    reader.onload = ev => {
      addNewImageToCell(td, file, ev.target.result);
      stopCameraInCell(rowId);
    };
    reader.readAsDataURL(file);
  }, 'image/png');
}

function uploadInCell(button) {
  const td = button.closest('td');
  if (!td) return;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true;

  input.onchange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        addNewImageToCell(td, file, ev.target.result);
      };
      reader.readAsDataURL(file);
    });
    closeImageOptions(button);
  };

  input.click();
}

function removeImage(button) {
  const td = button.closest('td');
  if (!td) return;
  const type = button.dataset.type;
  const index = Number(button.dataset.index);

  if (type === 'existing') {
    if (td.existingImages && td.existingImages[index] !== undefined) {
      const [removed] = td.existingImages.splice(index, 1);
      if (removed) {
        td.removedExistingImages = td.removedExistingImages || [];
        td.removedExistingImages.push(removed);
      }
    }
  } else if (type === 'new') {
    if (td.newImages) {
      td.newImages.splice(index, 1);
    }
  }

  renderImageList(td);
}

function openImagePreview(imageSrc) {
  if (!imageSrc) return;
  const modal = document.getElementById('imagePreviewModal');
  const img = document.getElementById('imagePreviewElement');
  if (!modal || !img) return;
  img.src = imageSrc;
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

// === On Load ===
window.onload = () => {
  document.querySelectorAll(".module-table").forEach((m) => (m.style.display = "none"));
};

// helper to parse server response safely
function parseServerResponseText(response) {
	return response.text().then((text) => {
		try {
			return JSON.parse(text);
		} catch (err) {
			console.error("Server returned non-JSON response:", text);
			throw new Error("Server error: see console for response text");
		}
	});
}

function saveModuleData(moduleId) {
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const riuNo = sessionStorage.getItem('riuNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !riuNo || !equipNo) {
    alert("Please save RIU details first.");
    return;
  }

  const moduleTable = document.getElementById(moduleId);
  const rows = moduleTable.querySelectorAll('table tbody tr');

  // Validation: require at least one observation filled
  let anyObservationFilled = false;
  rows.forEach(row => {
    const obsEl = row.querySelector('td:nth-child(4) textarea, td:nth-child(4) input');
    if (obsEl && String(obsEl.value || '').trim() !== '') {
      anyObservationFilled = true;
    }
  });
  if (!anyObservationFilled) {
    alert("Please fill at least one Observation before saving.");
    return;
  }

  const formData = new FormData();

  formData.append('zone', zone);
  formData.append('station', station);
  formData.append('riu_no', riuNo);
  formData.append('equip_no', equipNo);
  formData.append('module', moduleId);

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    const slNo = cells[0].textContent.trim();
    const description = cells[1].textContent.trim();
    const actionTaken = cells[2].textContent.trim();

    const obsEl = cells[3].querySelector('textarea, input');
    const observation = obsEl ? obsEl.value.trim() : '';

    const remarksEl = cells[4].querySelector('input, textarea');
    const remarks = remarksEl ? remarksEl.value.trim() : '';

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[5];
    if (td) {
      if (Array.isArray(td.existingImages) && td.existingImages.length) {
        td.existingImages.forEach(path => {
          formData.append(`observations[${rowIndex}][existing_images][]`, path);
        });
      }
      if (Array.isArray(td.newImages) && td.newImages.length) {
        td.newImages.forEach(imageObj => {
          formData.append(`observations[${rowIndex}][images][]`, imageObj.file);
        });
      }
    }
  });

  fetch("save_module_data.php", {
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert(`✅ ${moduleId.toUpperCase()} data saved successfully!`);
      document.getElementById(`btn-save-${moduleId}`).style.display = 'none';
      document.getElementById(`btn-update-${moduleId}`).style.display = 'block';

      // highlight corresponding sidebar tab (supports special module->tab mapping)
      const moduleTabMap = { 'riu_equip': 'riu-tab' };
      const tabId = moduleTabMap[moduleId] || `${moduleId}-tab`;
      const tab = document.getElementById(tabId);
      if (tab) tab.classList.add('filled');
    } else {
      alert("❌ Error: " + (result.message || JSON.stringify(result)));
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Something went wrong. Check console for details.");
  });
}

// === Update Module Data ===
function updateModuleData(moduleId) {
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const riuNo = sessionStorage.getItem('riuNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !riuNo || !equipNo) {
    alert("Please save RIU details first.");
    return;
  }

  const moduleTable = document.getElementById(moduleId);
  const rows = moduleTable.querySelectorAll('table tbody tr');

  // Validation: require at least one observation filled
  let anyObservationFilled = false;
  rows.forEach(row => {
    const obsEl = row.querySelector('td:nth-child(4) textarea, td:nth-child(4) input');
    if (obsEl && String(obsEl.value || '').trim() !== '') {
      anyObservationFilled = true;
    }
  });
  if (!anyObservationFilled) {
    alert("Please fill at least one Observation before updating.");
    return;
  }

  const formData = new FormData();

  formData.append('zone', zone);
  formData.append('station', station);
  formData.append('riu_no', riuNo);
  formData.append('equip_no', equipNo);
  formData.append('module', moduleId);

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    const slNo = cells[0].textContent.trim();
    const description = cells[1].textContent.trim();
    const actionTaken = cells[2].textContent.trim();

    const obsEl = cells[3].querySelector('textarea, input');
    const observation = obsEl ? obsEl.value.trim() : '';

    const remarksEl = cells[4].querySelector('input, textarea');
    const remarks = remarksEl ? remarksEl.value.trim() : '';

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[5];
    if (td) {
      if (Array.isArray(td.existingImages) && td.existingImages.length) {
        td.existingImages.forEach(path => {
          formData.append(`observations[${rowIndex}][existing_images][]`, path);
        });
      }

      if (Array.isArray(td.removedExistingImages) && td.removedExistingImages.length) {
        td.removedExistingImages.forEach(path => {
          formData.append(`observations[${rowIndex}][removed_images][]`, path);
        });
      }

      if (Array.isArray(td.newImages) && td.newImages.length) {
        td.newImages.forEach(imageObj => {
          formData.append(`observations[${rowIndex}][images][]`, imageObj.file);
        });
      }
    }
  });

  fetch("update_module_data.php", {
    method: "POST",
    body: formData
  })
  .then(response => parseServerResponseText(response))
  .then(result => {
    if (result.success) {
      alert(`✅ ${moduleId.toUpperCase()} data updated successfully!`);
      // ensure sidebar tab is highlighted after update
      const moduleTabMap = { 'riu_equip': 'riu-tab' };
      const tabId = moduleTabMap[moduleId] || `${moduleId}-tab`;
      const tab = document.getElementById(tabId);
      if (tab) tab.classList.add('filled');
      // Keep Update button visible
    } else {
      alert("❌ Error: " + (result.message || JSON.stringify(result)));
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Something went wrong. Check console for details.");
  });
}

// === Get Details Button (from top RIU section) ===
function get() {
    const zone = document.getElementById("zone").value.trim();
    const station = document.getElementById("station").value.trim();
    const riu = document.getElementById("riu").value.trim();
    const equipNo = document.getElementById("equipNo").value.trim();

    if (!zone || !station || !riu || !equipNo) {
        alert("Please fill all RIU details first.");
        return;
    }

    const data = {
        zone: zone,
        station: station,
        riu_no: riu,
        equip_no: equipNo
    };

    fetch("RIU_details.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success || result.message === "Record already exists") {
            // Store in sessionStorage
            sessionStorage.setItem('zone', zone);
            sessionStorage.setItem('station', station);
            sessionStorage.setItem('riuNo', riu);
            sessionStorage.setItem('equipNo', equipNo);

            // Check modules with data and highlight sidebar
            checkModulesWithData(zone, station, riu, equipNo);
            
            // Load data for all modules
            loadAllModuleData();
            
            // Enable sidebar
            document.querySelector('.sidebar').style.pointerEvents = 'auto';
            
            if (result.success) {
                alert("✔️ New RIU Saved!");
            } else {
                alert("ℹ️ RIU already exists!");
            }
        }
        else {
            alert("❌ Error: " + result.message);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("❌ Something went wrong");
    });
}

// Check which modules have existing data and update button states
function checkModulesWithData(zone, station, riu, equipNo) {
    const modules = ['nms', 'power', 'riu_equip', 'comm', 'earthing'];
    const moduleTabMap = { 'riu_equip': 'riu-tab' }; // mapping for sidebar ids

    modules.forEach(moduleId => {
        const data = {
            zone: zone,
            station: station,
            riu_no: riu,
            equip_no: equipNo,
            module: moduleId
        };

        fetch("get_module_data.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            const tabId = moduleTabMap[moduleId] || `${moduleId}-tab`;
            const tab = document.getElementById(tabId);
            const btnSave = document.getElementById(`btn-save-${moduleId}`);
            const btnUpdate = document.getElementById(`btn-update-${moduleId}`);

            if (result.success && result.data && result.data.length > 0) {
                // Module has data - highlight tab and show Update button
                if (tab) tab.classList.add('filled');
                if (btnSave) btnSave.style.display = 'none';
                if (btnUpdate) btnUpdate.style.display = 'block';
            } else {
                // Module empty - no highlight, show Save button
                if (tab) tab.classList.remove('filled');
                if (btnSave) btnSave.style.display = 'block';
                if (btnUpdate) btnUpdate.style.display = 'none';
            }
        })
        .catch(error => console.error("Error checking module:", moduleId, error));
    });
}

// === Load all module data ===
function loadAllModuleData(){
  const allModules = ['nms','power','riu_equip','comm','earthing'];
  allModules.forEach((module) => {
    loadModuleData(module);
  });
}



