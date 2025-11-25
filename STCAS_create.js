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
	console.log("Populating table with ID:", tableBodyId); // DEBUG
	const tableBody = document.getElementById(tableBodyId);

	if (!tableBody) {
		console.error("Table body element not found:", tableBodyId);
		return;
	}

	tableBody.innerHTML = '';

	data.forEach(row => {
		const tr = document.createElement('tr');

		let imageHtml = '<button onclick="openImageOptions(this)">Add Image</button>';
		if (row.image_path && row.image_path.trim() !== '') {
			const src = row.image_path;
			imageHtml = `
				<div class="image-box">
				  <img src="${src}" alt="Uploaded" class="uploaded-image">
				  <button onclick="removeImage(this)" class="remove-btn">✖</button>
				</div>
			`;
		}

		tr.innerHTML = `
		  <td>${row.sl_no}</td>
		  <td>${row.description}</td>
		  <td>${row.action_taken}</td>
		  <td><input type="text" value="${row.observation || ''}" placeholder="Observation" /></td>
		  <td><input type="text" value="${row.remarks || ''}" placeholder="Remarks" /></td>
		  <td>${imageHtml}</td>
		`;
		tableBody.appendChild(tr);

		// store metadata on the td for later upload/update handling
		const appendedRowTds = tr.querySelectorAll('td');
		if (appendedRowTds && appendedRowTds.length >= 6) {
			const imgTd = appendedRowTds[5];
			imgTd.imageFile = null;
			imgTd.imageRemoved = false;
			imgTd.existingImagePath = row.image_path || '';
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
      if (!imgTd.imageFile) {
        imgTd.imageFile = null;
        imgTd.imageRemoved = false;
        imgTd.existingImagePath = '';
      }
    }
  });
}

// === Image Handling ===
// === Image Handling Logic ===
// =========================
// REAL CAMERA IMAGE HANDLING
// =========================

// Keep track of active camera stream per cell
const activeCellCameras = {};

// When Add Image is clicked
function openImageOptions(btn) {
  const td = btn.closest("td");
  td.innerHTML = `
    <div class="image-options">
      <button onclick="openCameraInCell(this, 'user')">Front Camera</button>
      <button onclick="openCameraInCell(this, 'environment')">Back Camera</button>
      <button onclick="uploadInCell(this)">Upload from Device</button>
    </div>
  `;
}

// Open real camera inside the table cell
function openCameraInCell(button, facingMode) {
  const td = button.closest("td");
  const rowId = Date.now(); // unique ID for the camera instance

  td.innerHTML = `
    <div id="camera-container-${rowId}" style="text-align:center;">
      <video id="camera-${rowId}" autoplay style="width:100%;border:1px solid #333;"></video>
      <br>
      <button onclick="captureImageInCell(${rowId})">Capture</button>
      <button onclick="stopCameraInCell(${rowId}, this)">Close</button>
    </div>
    <canvas id="canvas-${rowId}" style="display:none;"></canvas>
  `;

  startCameraInCell(rowId, facingMode);
}

// Start camera stream
async function startCameraInCell(rowId, facingMode) {
  const video = document.getElementById(`camera-${rowId}`);
  if (!video) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode },
      audio: false
    });

    video.srcObject = stream;
    activeCellCameras[rowId] = stream;

  } catch (err) {
    alert("Camera access denied!");
    console.error(err);
  }
}

// Stop camera
function stopCameraInCell(rowId, btn) {
  const stream = activeCellCameras[rowId];
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    delete activeCellCameras[rowId];
  }

  const td = btn.closest("td");
  td.innerHTML = `<button onclick="openImageOptions(this)">Add Image</button>`;
}

// Capture image inside table cell
function captureImageInCell(rowId) {
  const video = document.getElementById(`camera-${rowId}`);
  const canvas = document.getElementById(`canvas-${rowId}`);
  const td = video.closest("td");

  if (!video || !canvas || !td) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (!blob) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      td.imageFile = new File([blob], `capture-${rowId}.png`, { type: "image/png" });

      td.innerHTML = `
        <div class="image-box">
          <img src="${ev.target.result}" class="uploaded-image">
          <button onclick="removeImage(this)" class="remove-btn">✖</button>
        </div>
      `;
    };
    reader.readAsDataURL(blob);

    stopCameraInCell(rowId, video.closest("td").querySelector("button"));
  });
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
      td.imageFile = file;

      td.innerHTML = `
        <div class="image-box">
          <img src="${ev.target.result}" class="uploaded-image">
          <button onclick="removeImage(this)" class="remove-btn">✖</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  };

  input.click();
}

// Remove image
function removeImage(button) {
  const td = button.closest("td");
  td.imageFile = null;
  td.imageRemoved = true;

  td.innerHTML = `<button onclick="openImageOptions(this)">Add Image</button>`;
}

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
    const observation = cells[3].querySelector('input')?.value || '';
    const remarks = cells[4].querySelector('input')?.value || '';

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[5];
    if (td && td.imageFile) {
      formData.append(`observations[${rowIndex}][image]`, td.imageFile);
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
    const observation = cells[3].querySelector('input')?.value || '';
    const remarks = cells[4].querySelector('input')?.value || '';

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[5];
    if (td && td.existingImagePath) {
      formData.append(`observations[${rowIndex}][existing_image_path]`, td.existingImagePath);
    } else {
      formData.append(`observations[${rowIndex}][existing_image_path]`, '');
    }

    if (td && td.imageRemoved) {
      formData.append(`observations[${rowIndex}][remove_image]`, '1');
    } else {
      formData.append(`observations[${rowIndex}][remove_image]`, '0');
    }

    if (td && td.imageFile) {
      formData.append(`observations[${rowIndex}][image]`, td.imageFile);
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
in #file:observations.html  provide a table with total points 29 open points should be calculated as if observation is empty then that point is open point if all closed in report name include completed else show not completed.. and in report u have to mention summary table that which module and points are not closedd.

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Generated Report - STCAS Observations</title>
    <style>
        body {
            font-family: Segoe UI, Roboto, sans-serif;
            background: linear-gradient(180deg, #eef2f7 0%, #ffffff 100%);
            margin: 0;
            padding: 24px
        }

        .container {
            width: 100%;
            max-width: none;
            margin: 0 auto;
            background: transparent;
            padding: 0;
            box-shadow: none;
        }

        h1 {
            font-size: 26px;
            margin: 0 0 16px;
            color: #0b3a66;
            text-align: center;
            font-weight: 700;
        }

        .meta-table {
            width: auto;
            margin: 16px 0 24px;
            border-collapse: collapse;
        }

        .meta-table td {
            padding: 10px 16px;
            border: 1px solid #d0d8e8;
            background: #f8fafc;
            font-size: 14px;
        }

        .meta-table td.label {
            font-weight: 700;
            width: 180px;
            color: #0b3a66;
        }

        .module-section {
            margin-top: 20px;
        }

        /* === CLEAN STYLES (KEEP THESE) === */
.meta-table-4col {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 18px;
}

.meta-table-4col td {
    border: 1px solid black;
    padding: 8px 10px;
}

.meta-table-4col .label {
    font-weight: 600;
    width: 22%;
    background: none !important;
}

/* REMOVE CARDS & SHADOWS */
.report-card, .module-section {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 25px 0 !important;
}

/* MODULE TITLE - BLACK TEXT */
.module-title {
    font-size: 18px;
    font-weight: 700;
    color: black;
    padding: 0;
    margin: 0 0 8px 0;
    text-transform: uppercase;
}

/* REMOVE BLUE BAR */
.module-header {
    background: none !important;
    padding: 0 !important;
    border: none !important;
}

/* CLEAN TABLE */
.obs-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid black;
}

/* HEADER */
.obs-table th {
    border: 2px solid black;
    padding: 8px;
    font-size: 15px;
    background: none !important;
    color: black;
    font-weight: 600;
}

/* BODY */
.obs-table td {
    border: 1.5px solid black;
    padding: 6px;
    font-size: 14px;
    color: black;
}

/* IMAGE */
.img-thumb {
    max-width: 90px;
    max-height: 70px;
    border: 1px solid black;
}


        .controls {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 16px;
        }

        .btn {
            padding: 10px 16px;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            color: #fff;
            background: #007bff;
            font-size: 14px;
            font-weight: 600;
        }

        .btn.print {
            background: #16a34a;
        }

        .note {
            color: #64748b;
            font-size: 14px;
            margin-top: 12px;
            text-align: center;
        }

        .empty {
            padding: 24px;
            text-align: center;
            color: #666;
            font-size: 16px;
        }

        /* Image modal styles */
        #imageModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            align-items: center;
            justify-content: center;
        }

        #imageModal > div {
            position: relative;
            background: white;
            padding: 20px;
            border-radius: 8px;
        }

        #imageModal img {
            max-width: 90vw;
            max-height: 90vh;
        }

        #imageModal span {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 32px;
            cursor: pointer;
            color: #333;
        }

        @media(max-width: 900px) {
            .obs-table th, .obs-table td { font-size: 12px; padding: 10px; }
            .img-thumb { max-width: 80px; max-height: 60px; }
            .module-title { min-width: 150px; font-size: 16px; }
        }
        .meta-table-4col {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 18px;        /* bigger text */
}

.meta-table-4col td {
    border: 1px solid black;
    padding: 8px 10px;
}

.meta-table-4col .label {
    font-weight: 600;
    width: 22%;
    background: none !important;
}

/* REMOVE ALL CARDS, BACKGROUND, SHADOWS */
.report-card, .module-section {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 25px 0 !important;
}

/* SIDE HEADING (MODULE NAME) */
.module-title {
    font-size: 18px;
    font-weight: 700;
    color: black;
    padding: 0;
    margin: 0 0 8px 0;
    text-transform: uppercase;
}

/* BLUE BAR NOT NEEDED: REMOVE IT */
.module-header {
    background: none !important;
    padding: 0 !important;
    border: none !important;
}

/* CLEAN SIMPLE TABLE */
.obs-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid black;   /* outer border */
}

/* TABLE HEADER */
.obs-table th {
    border: 2px solid black;
    padding: 8px;
    font-size: 15px;
    background: none !important; /* NO color */
    color: black;
    font-weight: 600;
}

/* TABLE BODY */
.obs-table td {
    border: 1.5px solid black;
    padding: 6px;
    font-size: 14px;
    color: black;
}

/* FOR SMALL IMAGES IN LAST COLUMN */
.img-thumb {
    max-width: 90px;
    max-height: 70px;
    border: 1px solid black;
}


        .controls {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 16px;
        }

        .btn {
            padding: 10px 16px;
            border: 0;
            border-radius: 6px;
            cursor: pointer;
            color: #fff;
            background: #007bff;
            font-size: 14px;
            font-weight: 600;
        }

        .btn.print {
            background: #16a34a;
        }

        .note {
            color: #64748b;
            font-size: 14px;
            margin-top: 12px;
            text-align: center;
        }

        .empty {
            padding: 24px;
            text-align: center;
            color: #666;
            font-size: 16px;
        }

        /* Image modal styles */
        #imageModal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 2000;
            align-items: center;
            justify-content: center;
        }

        #imageModal > div {
            position: relative;
            background: white;
            padding: 20px;
            border-radius: 8px;
        }

        #imageModal img {
            max-width: 90vw;
            max-height: 90vh;
        }

        #imageModal span {
            position: absolute;
            top: 10px;
            right: 15px;
            font-size: 32px;
            cursor: pointer;
            color: #333;
        }

        @media(max-width: 900px) {
            .obs-table th, .obs-table td { font-size: 12px; padding: 10px; }
            .img-thumb { max-width: 80px; max-height: 60px; }
            .module-title { min-width: 150px; font-size: 16px; }
        }
        .meta-table-4col {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
    font-size: 18px;        /* bigger text */
}

.meta-table-4col td {
    border: 1px solid black;
    padding: 8px 10px;
}

.meta-table-4col .label {
    font-weight: 600;
    width: 22%;
    background: none !important;
}

/* REMOVE ALL CARDS, BACKGROUND, SHADOWS */
.report-card, .module-section {
    background: none !important;
    box-shadow: none !important;
    border: none !important;
    padding: 0 !important;
    margin: 25px 0 !important;
}

/* SIDE HEADING (MODULE NAME) */
.module-title {
    font-size: 18px;
    font-weight: 700;
    color: black;
    padding: 0;
    margin: 0 0 8px 0;
    text-transform: uppercase;
}

/* BLUE BAR NOT NEEDED: REMOVE IT */
.module-header {
    background: none !important;
    padding: 0 !important;
    border: none !important;
}

/* CLEAN SIMPLE TABLE */
.obs-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid black;   /* outer border */
}

/* TABLE HEADER */
.obs-table th {
    border: 2px solid black;
    padding: 8px;
    font-size: 15px;
    background: none !important; /* NO color */
    color: black;
    font-weight: 600;
}

/* TABLE BODY */
.obs-table td {
    border: 1.5px solid black;
    padding: 6px;
    font-size: 14px;
    color: black;
}

/* FOR SMALL IMAGES IN LAST COLUMN */
.img-thumb {
    max-width: 90px;
    max-height: 70px;
    border: 1px solid black;
}


    </style>

    <!-- include jsPDF & autoTable -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
</head>

<body>
    <div class="container" id="app">
        <h1>Monthly Maintenance Report — STCAS (Generated)</h1>

        <div id="metaArea"></div>
        <div id="obsArea"></div>

        <div class="controls">
            <button class="btn" id="backBtn">Back</button>
            <button class="btn print" id="createPdfBtn">Create PDF</button>
            <button id="viewReportsBtn" class="btn" style="display:none;background:#6c5ce7;margin-left:10px;"
                disabled>View Reports</button>
        </div>

        <div class="note">If data is missing, go back to the create page and Save the RIU details first.</div>
    </div>

    <script>
        (function () {
            // Always fetch from DB, do not use localStorage for report data
            const zone = sessionStorage.getItem('zone') || '';
            const station = sessionStorage.getItem('station') || '';
            const riu_no = sessionStorage.getItem('riuNo') || '';
            const equip_no = sessionStorage.getItem('equipNo') || '';

            const metaArea = document.getElementById('metaArea');
            const obsArea = document.getElementById('obsArea');
            const createBtn = document.getElementById('createPdfBtn');
            const viewBtn = document.getElementById('viewReportsBtn');

            function escapeHtml(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

            function renderMeta(info) {
    metaArea.innerHTML = `
    <table class="meta-table-4col">
        <tr>
            <td class="label">Zone</td>
            <td>${escapeHtml(info.zone || '--')}</td>
            <td class="label">Station</td>
            <td>${escapeHtml(info.station || '--')}</td>
        </tr>
        <tr>
            <td class="label">RIU No</td>
            <td>${escapeHtml(info.riu_no || '--')}</td>
            <td class="label">RIU Equip No</td>
            <td>${escapeHtml(info.riu_equip_no || '--')}</td>
        </tr>
    </table>
    `;
}


            function renderObservations(observations) {
                if (!observations || observations.length === 0) {
                    obsArea.innerHTML = '<div class="report-card"><div class="empty">No observations found for this RIU entry.</div></div>';
                    return;
                }

                // Group by location/module (fall back to 'General')
                const groups = {};
                observations.forEach(obs => {
                    const key = (obs.location || obs.module || 'General').trim() || 'General';
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(obs);
                });

                // Build HTML: for each module group show title then table
                let html = '';
                for (const [moduleName, rows] of Object.entries(groups)) {
                    html += `
<div class="module-section">
  <div class="module-title">${escapeHtml(moduleName)}</div>
  <div style="overflow-x: auto;">
    <table class="obs-table">
      <thead>
        <tr>
          <th style="width:6%">Sl No</th>
          <th style="width:40%">Description</th>
          <th style="width:20%">Action Taken / Range</th>
          <th style="width:12%">Observation</th>
          <th style="width:12%">Remarks</th>
          <th style="width:10%">Image</th>
        </tr>
      </thead>
      <tbody>`;

                    rows.forEach(obs => {
                        const imgHtml = obs.image_path ? `<img src="${escapeHtml(obs.image_path)}" class="img-thumb" alt="img" onclick="openImageModal('${escapeHtml(obs.image_path)}')">` : 'N/A';
                        html += `<tr>
                          <td>${escapeHtml(obs.sl_no || '')}</td>
                          <td>${escapeHtml(obs.description || '')}</td>
                          <td>${escapeHtml(obs.action_taken || '')}</td>
                          <td>${escapeHtml(obs.observation || '')}</td>
                          <td>${escapeHtml(obs.remarks || '')}</td>
                          <td style="text-align:center">${imgHtml}</td>
                        </tr>`;
                    });

                    html += `</tbody></table></div></div>`;
                }

                obsArea.innerHTML = html + `
                  <div id="imageModal">
                    <div style="position:relative; background:white; padding:14px; border-radius:8px;">
                      <span onclick="closeImageModal()" style="position:absolute; top:8px; right:12px; cursor:pointer;">&times;</span>
                      <img id="modalImage" src="" alt="Full Image" style="display:block;">
                    </div>
                  </div>`;
            }

            function openImageModal(imagePath) {
                document.getElementById('modalImage').src = imagePath;
                document.getElementById('imageModal').style.display = 'flex';
            }

            function closeImageModal() {
                document.getElementById('imageModal').style.display = 'none';
            }

            function showError(msg) {
                metaArea.innerHTML = `<div class="empty">${escapeHtml(msg)}</div>`;
                obsArea.innerHTML = '';
            }

            // No localStorage fallback, always use DB fetch
            if (!zone || !station || !riu_no || !equip_no) {
                showError('RIU metadata is missing from session. Please go back to the create page and Save the RIU details first.');
                createBtn.disabled = true;
            } else {
                fetch('get_observations.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ zone: zone, station: station, riu_no: riu_no, equip_no: equip_no })
                })
                    .then(r => r.json())
                    .then(json => {
                        if (json.riu_info) renderMeta(json.riu_info);
                        else renderMeta({ zone, station, riu_no, riu_equip_no: equip_no });

                        renderObservations(json.observations || []);
                    })
                    .catch(err => {
                        console.error(err);
                        showError('Failed to load data. Check network and server.');
                        createBtn.disabled = true;
                    });
            }

            document.getElementById('backBtn').addEventListener('click', function () { history.back(); });
            createBtn.addEventListener('click', createPDF);
            viewBtn.addEventListener('click', function () { window.location.href = 'viewReports.php'; });

           async function createPDF() {
    if (!zone || !station || !riu_no) {
        alert('RIU metadata missing. Please go back and save RIU details.');
        return;
    }

    createBtn.disabled = true;
    createBtn.innerText = 'Creating...';

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const contentWidth = 520;
    const startX = 40;

    // Collect observations first to calculate total pages
    const obsRows = document.querySelectorAll('.obs-table tbody tr');
    const observations = [];

    obsRows.forEach(row => {
        const cells = row.children;
        const imgElement = cells[5]?.querySelector('img');
        observations.push({
            sl_no: cells[0]?.innerText || '',
            description: cells[1]?.innerText || '',
            action_taken_range: cells[2]?.innerText || '',
            observation: cells[3]?.innerText || '',
            remarks: cells[4]?.innerText || '',
            image_path: imgElement ? imgElement.src : ''
        });
    });

    // Create temp doc to estimate total pages
    const tempDoc = new jsPDF({ unit: 'pt', format: 'a4' });
    tempDoc.addPage();
    const head = [['Sl No', 'Description', 'Action Taken / Range', 'Observation', 'Remarks', 'Image']];
    const body = observations.map(o => [
        o.sl_no, o.description, o.action_taken_range, o.observation, o.remarks,
        o.image_path ? '✓ Image' : 'N/A'
    ]);
    tempDoc.autoTable({
        startY: 100,
        head, body,
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [11, 105, 208], textColor: 255 },
        theme: 'grid',
        margin: { left: startX, right: startX },
        tableWidth: contentWidth
    });
    const totalPages = tempDoc.internal.getNumberOfPages();

    /* ===== PAGE 1 ===== */

    function drawPage1Header(doc, pageNum, total) {
        const headerY = 50;
        const boxH = 30;
        const widths = [90, 100, 210, 60, 60];

        const headers = [
            `Page ${pageNum} of ${total}`,
            'Effective from\n21.01.2021',
            'Document Title:\nMonthly Maintenance Schedule For HBL STCAS - RIU (Remote Interface Unit)',
            'SIF-0552',
            'Version 1.0'
        ];

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        let x = startX;
        headers.forEach((text, idx) => {
            doc.rect(x, headerY, widths[idx], boxH);
            const splitText = doc.splitTextToSize(text, widths[idx] - 6);
            const lineHeight = 10;
            const totalTextHeight = splitText.length * lineHeight;
            const textY = headerY + (boxH - totalTextHeight) / 2 + 7;

            if (idx === 2) {
                doc.text(splitText, x + widths[idx] / 2, textY, { align: 'center' });
            } else {
                doc.text(splitText, x + 3, textY);
            }
            x += widths[idx];
        });
    }

    drawPage1Header(doc, 1, totalPages);

    let currentY = 140;

    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('SIGNAL DIRECTORATE', doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 28;
    doc.text('RESEARCH DESIGNS AND STANDARDS ORGANISATION', doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
    currentY += 28;
    doc.text('MANAK NAGAR, LUCKNOW - 226011', doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });

    currentY += 55;

    doc.setFontSize(12);
    doc.text(
        'Title: Monthly Maintenance Schedule For HBL STCAS - RIU (Remote Interface Unit)',
        doc.internal.pageSize.getWidth() / 2,
        currentY,
        { align: 'center' }
    );

    currentY += 50;

    /* ===== ISSUE TABLE ===== */
    doc.autoTable({
    startY: currentY,
    head: [['SN', 'Issue', 'Version', 'Reason of Amendment']],
    body: [
        ['1', 'First', '1.0', 'First Issue']
    ],
    styles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 10,
        lineWidth: 0.5,         // Border thickness
        lineColor: [0, 0, 0],   // Border color (black)
        fillColor: false,       // No background
        textColor: [0, 0, 0]    // Body text color = black
    },
    headStyles: {
        fillColor: false,       // Remove header background
        textColor: [0, 0, 0],
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
    },
    alternateRowStyles: {
        fillColor: false        // Ensure no alt row background
    },
    tableWidth: contentWidth,
    margin: { left: startX },
});


    // Increase gap between Issue Table and Prepared/Approved Table
const preparedApprovedY = doc.autoTable.previous.finalY + 70;

// Prepared by text with spacing
const preparedText =
`G. Pavan Kumar  ED/Tele-II

R N Singh  ADE/Signal-5

Ashutosh Chaubey  SSE/Signal`;

// Approved by (single name)
const approvedText = `Shaminder Singh  PED/QA/S&T/RDSO`;

doc.autoTable({
    startY: preparedApprovedY,

    head: [['Prepared by:', 'Approved by:']],

    body: [
        [preparedText, approvedText]
    ],

    styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        fillColor: false,      // No background in body
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        cellPadding: 10,
        halign: 'left'
    },

    headStyles: {
        fontStyle: 'bold',
        fillColor: false,      // No background in header
        textColor: [0, 0, 0],
        halign: 'center'
    },

    alternateRowStyles: {
        fillColor: false       // No alternate shading
    },

    columnStyles: {
        0: {
            cellWidth: contentWidth / 2,
            valign: 'top',      // Prepared stays top-aligned
            halign: 'left'
        },
        1: {
            cellWidth: contentWidth / 2,
            valign: 'middle',   // APPROVED BY vertically centered
            halign: 'center'    // horizontally centered
        }
    },

    tableWidth: contentWidth,
    margin: { left: startX },
});

    // 5. INCREASE GAP between second table and third table (Prepared/Approved to Signatures)
const signatureY = doc.autoTable.previous.finalY + 70;  // moved further down

// Signature box (empty space for signatures)
const numLinesFixed = 4;   // increased size slightly
const signatureBody = [['\n'.repeat(numLinesFixed), '\n'.repeat(numLinesFixed)]];

doc.autoTable({
    startY: signatureY,

    head: [
        ["Firm's Representative with", "Railway Representative with"],
        ["Name Designation and Date", "Name Designation and Date"]
    ],

    body: signatureBody,

    styles: {
        fontSize: 10,            // increased font size
        textColor: [0, 0, 0],
        fillColor: false,        // NO BACKGROUND at all
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        cellPadding: 6,
        valign: 'middle',
        halign: 'left'
    },

    headStyles: {
        fontSize: 10,            // header font size
        fontStyle: 'bold',
        fillColor: false,        // NO header background
        textColor: [0, 0, 0],
        halign: 'center',
        cellPadding: 4
    },

    alternateRowStyles: {
        fillColor: false         // No alternate shading
    },

    columnStyles: {
        0: { cellWidth: contentWidth / 2 },
        1: { cellWidth: contentWidth / 2 }
    },

    tableWidth: contentWidth,
    margin: { left: startX },

    didDrawCell: (data) => {
        // Merge header rows visually (remove bottom line of first header row)
        if (data.section === 'head' && data.row.index === 0) {
            doc.setDrawColor(255, 255, 255); // erase bottom border
            doc.setLineWidth(0.5);
            doc.line(
                data.cell.x,
                data.cell.y + data.cell.height,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
            );
            doc.setDrawColor(0, 0, 0); // restore right border
            doc.line(
                data.cell.x + data.cell.width,
                data.cell.y,
                data.cell.x + data.cell.width,
                data.cell.y + data.cell.height
            );
        }
    }
});


/* ===== PAGE 2 – CLEAN: ONLY REAL IMAGES, NO TEXT/LINKS ===== */
doc.addPage('a4', 'portrait');

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const marginX = startX;

// Title
doc.setFont('helvetica', 'bold');
doc.setFontSize(18);
doc.text('Monthly Maintenance Report — STCAS', pageWidth / 2, 30, { align: 'center' });

// === RIU INFO TABLE (4-column) ===
doc.autoTable({
    startY: 50,
    head: [['Zone', 'Station', 'RIU No', 'RIU Equip No']],
    body: [[zone || '--', station || '--', riu_no || '--', equip_no || '--']],
    theme: 'grid',
    styles: { fontSize: 13, cellPadding: 10, lineColor: [0,0,0], lineWidth: 1.2 },
    headStyles: { fillColor: [30,60,120], textColor: 255, fontStyle: 'bold', fontSize: 13, lineWidth: 1.5 },
    columnStyles: {
        0: { cellWidth: contentWidth * 0.25, halign: 'center' },
        1: { cellWidth: contentWidth * 0.25, halign: 'center' },
        2: { cellWidth: contentWidth * 0.25, halign: 'center' },
        3: { cellWidth: contentWidth * 0.25, halign: 'center' }
    },
    margin: { left: marginX, right: marginX }
});

currentY = doc.lastAutoTable.finalY + 25;   // Only one declaration

// === GROUP DATA FROM HTML (with real image URLs) ===
const moduleGroups = {};

document.querySelectorAll('.obs-table').forEach(table => {
    const moduleName = table.closest('.module-section')
        ?.querySelector('.module-title')?.innerText.trim() || 'General';

    if (!moduleGroups[moduleName]) moduleGroups[moduleName] = [];

    table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.cells;
        const img = cells[5]?.querySelector('img');
        moduleGroups[moduleName].push({
            sl_no: cells[0]?.innerText.trim(),
            description: cells[1]?.innerText.trim(),
            action_taken: cells[2]?.innerText.trim(),    // ← FIXED
            observation: cells[3]?.innerText.trim(),
            remarks: cells[4]?.innerText.trim(),
            image_url: img ? img.src : null
        });
    });
});

// === RENDER EACH MODULE ===
for (const [moduleName, rows] of Object.entries(moduleGroups)) {
    // Module Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(moduleName.toUpperCase(), marginX, currentY);
    currentY += 15;

    // Table body — we pass image URL as raw data
    const tableBody = rows.map(row => [
    row.sl_no,
    row.description,
    row.action_taken,      // ← FIXED
    row.observation,
    row.remarks,
    row.image_url ? { image: row.image_url } : ''
]);

    doc.autoTable({
        startY: currentY,
        head: [['Sl No', 'Description', 'Action Taken / Range', 'Observation', 'Remarks', 'Image']],
        body: tableBody,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 6, lineColor: [0,0,0], lineWidth: 0.8 },
        headStyles: {
            fillColor: [30,60,120],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11,
            lineWidth: 1.2,
            halign: 'center',
            valign: 'middle'   // Fixed syntax
        },
        columnStyles: {
            0: { cellWidth: 35, halign: 'center' },
            1: { cellWidth: 170 },
            2: { cellWidth: 95 },
            3: { cellWidth: 80 },
            4: { cellWidth: 80 },
            5: { cellWidth: 80, halign: 'center' }
        },
        margin: { left: marginX, right: marginX },
        tableWidth: contentWidth,

        // ONLY DRAW IMAGE — NO TEXT AT ALL
        didDrawCell: function(data) {
    if (data.section === 'body' && data.column.index === 5 && data.cell.raw && typeof data.cell.raw === 'object' && data.cell.raw.image) {
        const imgUrl = data.cell.raw.image;
        const imgWidth = 70;
        const imgHeight = 50;
        const x = data.cell.x + (data.cell.width - imgWidth) / 2;
        const y = data.cell.y + (data.cell.height - imgHeight) / 2;

        try {
            doc.addImage(imgUrl, 'JPEG', x, y, imgWidth, imgHeight);
        } catch (err) {
            // image failed → cell stays blank
        }
    }

        }
    });

    currentY = doc.lastAutoTable.finalY + 30;

    if (currentY > pageHeight - 50) {
        doc.addPage();
        currentY = 50;
    }
}

// Footer
doc.setFontSize(10);
doc.setTextColor(100);
doc.text(
    'Generated on: ' + new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' at ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    pageWidth / 2, pageHeight - 20, { align: 'center' }
);

/* ===== UPLOAD PDF ===== */
const dataUri = doc.output('datauristring');
const base64 = dataUri.split(',')[1];
const payload = { zone, station, riu_no, equip_no, pdf_base64: base64 };

try {
    const resp = await fetch('generate_pdf.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const json = await resp.json();

    if (json.success) {
        viewBtn.style.display = 'inline-block';
        viewBtn.disabled = false;
        viewBtn.innerText = 'View Reports (v' + (json.version || '') + ')';
        createBtn.innerText = 'Created';
        createBtn.disabled = true;
        alert('PDF Created Successfully.');
    } else {
        throw new Error('Server error');
    }
} catch (err) {
    console.error(err);
    alert('Failed to save PDF.');
    createBtn.disabled = false;
    createBtn.innerText = 'Create PDF';
}}
        })();
    </script>
</body>

</html>
