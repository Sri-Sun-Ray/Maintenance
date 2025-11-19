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

// Load NMS module data when page loads
window.addEventListener("DOMContentLoaded", function() {
  const storedZone = localStorage.getItem("zone");
  const storedStation = localStorage.getItem("selectedStation");
  
  if (storedZone) {
    document.getElementById("zone").value = storedZone;
    populateStationDropdown(storedZone);
  }
  
  if (storedStation) {
    document.getElementById("station").value = storedStation;
  }

   const editStation=localStorage.getItem('editStation');
   const editRiu=localStorage.getItem('editRiu');
   const editEquip=localStorage.getItem('editEquip');
  
  if(editStation)
  {
    document.getElementById("station").value = editStation;
  }
  if(editRiu)
  {

    document.getElementById("riu").value = editRiu;
      document.getElementById('btn-save').style.display = 'none';
      document.getElementById('btn-get_details').style.display = 'block';
      document.querySelector('.sidebar').style.pointerEvents = 'auto';
  }

  if(editEquip)
  {
    document.getElementById("equipNo").value = editEquip;
  }
  

});

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

  // Load module data if RIU info is saved
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const riuNo = sessionStorage.getItem('riuNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (zone && station && riuNo && equipNo) {
    loadModuleData(moduleId);
  }
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

// Upload image from device - UPDATED
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
      // Store the file object on the td element so we can append it to FormData later
      td.imageFile = file;
      
      // render thumbnail
      td.innerHTML = `
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

// When user removes image (existing or newly uploaded)
function removeImage(button) {
  // If button inside .image-box
  const imageBox = button.closest(".image-box");
  if (!imageBox) return;

  const td = imageBox.closest("td");
  // mark removed flag if it was an existing server image
  if (td) {
    td.imageRemoved = true;
    // clear any staged file
    td.imageFile = null;
    td.existingImagePath = td.existingImagePath || '';
    // replace content with Add Image options button
    td.innerHTML = `<button onclick="openImageOptions(this)">Add Image</button>`;
  } else {
    imageBox.remove();
  }
}

// === On Load ===
window.onload = () => {
  document.querySelectorAll(".module-table").forEach((m) => (m.style.display = "none"));
};

// helper to parse server response safely
function parseServerResponseText(response) {
	// return Promise resolving to parsed JSON or throw with server text
	return response.text().then((text) => {
		try {
			return JSON.parse(text);
		} catch (err) {
			console.error("Server returned non-JSON response:", text);
			// rethrow a descriptive error to be handled by caller
			throw new Error("Server error: see console for response text");
		}
	});
}

// === Save Module Data ===
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

    // Append file if user uploaded one (we store it on the td.imageFile)
    const td = cells[5];
    if (td && td.imageFile) {
      // name the file field as observations[rowIndex][image]
      formData.append(`observations[${rowIndex}][image]`, td.imageFile);
    }
  });

  fetch("save_module_data.php", {
    method: "POST",
    body: formData
  })
  .then(response => parseServerResponseText(response))
  .then(result => {
    if (result.success) {
      alert(`✅ ${moduleId.toUpperCase()} data saved successfully!`);
    } else {
      alert("❌ Error: " + (result.message || JSON.stringify(result)));
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Something went wrong. Check console for details.");
  });

  document.getElementById(`btn-save-${moduleId}`).style.display='none';
  document.getElementById(`btn-getDetails-${moduleId}`).style.display='block'; 
  document.getElementById(`btn-update-${moduleId}`).style.display='block';
  

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
    // send existing image path so server knows what to delete if requested
    if (td && td.existingImagePath) {
      formData.append(`observations[${rowIndex}][existing_image_path]`, td.existingImagePath);
    } else {
      formData.append(`observations[${rowIndex}][existing_image_path]`, '');
    }

    // flag removal
    if (td && td.imageRemoved) {
      formData.append(`observations[${rowIndex}][remove_image]`, '1');
    } else {
      formData.append(`observations[${rowIndex}][remove_image]`, '0');
    }

    // Append new file if user uploaded a replacement
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
    } else {
      alert("❌ Error: " + (result.message || JSON.stringify(result)));
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Something went wrong. Check console for details.");
  });
}

// === Get Details for Update ===
function getDetails(moduleId) {
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

  fetch("get_riu_details.php", {
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
      
      // Load requested module data (images come from server via get_module_data.php)
      loadModuleData(moduleId);
      showModule(moduleId);
    } else {
      alert("⚠️ " + result.message);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Failed to load details.");
  });
}

// === Load all module data ===
function loadAllModuleData(){
  const allModules = ['nms','power','riu_equip','comm','earthing'];
  allModules.forEach((module) => {
    loadModuleData(module);
  });
}

// === Show all modules ===
function showAllModule(){
  // Just show first module; user can click sidebar to navigate
  showModule('nms');
}

// === Get function for Get Details button ===
function get(){
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

  fetch("get_riu_details.php", {
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
      
      alert("✅ RIU details found! Loading data...");
      loadAllModuleData();
      showAllModule();
    } else {
      alert("⚠️ " + result.message);
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("❌ Failed to load details.");
  });
}

// ===== BARCODE / QR CAMERA SCANNER =====
let activeInput = "";
let html5QrCode = null;

function startScan(inputType) {
  activeInput = inputType;
  document.getElementById("scannerModal").style.display = "flex";

  html5QrCode = new Html5Qrcode("qr-reader");

  Html5Qrcode.getCameras().then(devices => {
    if (devices.length === 0) {
      alert("No camera found on this device!");
      stopScan();
      return;
    }

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        document.getElementById(activeInput).value = decodedText;
        stopScan();
      },
      (error) => { /* ignore */ }
    ).catch(err => {
      alert("Camera access denied! Please enable permission.");
      stopScan();
    });
  });
}


// 🚀 FIXED STOP FUNCTION
function stopScan() {
  if (html5QrCode && html5QrCode.isScanning) {  // 👈 check if running only then stop
    html5QrCode.stop()
      .then(() => {
        html5QrCode.clear();
        html5QrCode = null;
        document.getElementById("scannerModal").style.display = "none";
        console.log("Scanner stopped successfully!");
      })
      .catch(err => {
        console.warn("Scanner was not running:", err);
        document.getElementById("scannerModal").style.display = "none";
      });
  } else {
    console.warn("Scanner already stopped.");
    document.getElementById("scannerModal").style.display = "none";
  }
}



