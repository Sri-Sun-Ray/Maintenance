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
  const fie = document.getElementById("fie").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  if (!zone || !station || !fie || !equipNo) {
    alert("Please fill all fields before saving.");
    return;
  }

  localStorage.setItem("selectedStation", station);
  localStorage.setItem("fieNo", fie);
  localStorage.setItem("equipNo", equipNo);

  const data = {
    zone: zone,
    station: station,
    fie_no: fie,
    equip_no: equipNo
  };

  fetch("FIE_details.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      sessionStorage.setItem('zone', zone);
      sessionStorage.setItem('station', station);
      sessionStorage.setItem('fieNo', fie);
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
  const storedFie = localStorage.getItem("fieNo");
  const storedEquipNo = localStorage.getItem("equipNo");

  if (storedZone) {
    document.getElementById("zone").value = storedZone;
    populateStationDropdown(storedZone);
  }

  if (storedStation) {
    document.getElementById("station").value = storedStation;
  }

  if (isRefresh) {
    // Show confirmation dialog only for FIE data, not zone/station
    const shouldClear = confirm("Do you want to clear FIE data and start a new report?\n\nZone and Station will be retained.");

    if (shouldClear) {
      // Clear only session and FIE/Equipment data
      sessionStorage.clear();

      // Clear ONLY FIE and Equipment fields
      document.getElementById("fie").value = '';
      document.getElementById("equipNo").value = '';

      // Remove FIE-specific localStorage items ONLY (keep zone/station)
      localStorage.removeItem("fieNo");
      localStorage.removeItem("equipNo");
      // DON'T remove selectedStation - keep it!

      // Show Save button for new report
      document.getElementById('btn-save').style.display = 'block';
      document.getElementById('btn-get_details').style.display = 'none';
      return;
    }
  }

  // If user clicked Cancel or not a refresh, restore data normally
  // Clear FIE and Equipment fields only
  document.getElementById("fie").value = '';
  document.getElementById("equipNo").value = '';

  // Check sessionStorage (user already filled details in this session)
  const sessionZone = sessionStorage.getItem('zone');
  const sessionStation = sessionStorage.getItem('station');
  const sessionFie = sessionStorage.getItem('fieNo');
  const sessionEquipNo = sessionStorage.getItem('equipNo');

  // If sessionStorage has data, restore FIE/Equipment and show Get Details
  if (sessionZone && sessionStation && sessionFie && sessionEquipNo) {
    document.getElementById("fie").value = sessionFie;
    document.getElementById("equipNo").value = sessionEquipNo;

    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
  }
  // If only localStorage has data (zone/station + FIE/Equipment), restore to sessionStorage and show Get Details
  else if (storedZone && storedStation && storedFie && storedEquipNo) {
    // Restore to sessionStorage for consistency
    sessionStorage.setItem('zone', storedZone);
    sessionStorage.setItem('station', storedStation);
    sessionStorage.setItem('fieNo', storedFie);
    sessionStorage.setItem('equipNo', storedEquipNo);

    document.getElementById("fie").value = storedFie;
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
  const editFie = localStorage.getItem('editFie');
  const editEquip = localStorage.getItem('editEquip');

  if (editStation) {
    document.getElementById("station").value = editStation;
  }
  if (editFie) {
    document.getElementById("fie").value = editFie;
    document.getElementById('btn-save').style.display = 'none';
    document.getElementById('btn-get_details').style.display = 'block';
    document.querySelector('.sidebar').style.pointerEvents = 'auto';
  }
  if (editEquip) {
    document.getElementById("equipNo").value = editEquip;
  }
});


// Check if FIE is existing (has data) or new
function checkIfExistingFie(zone, station, fie, equipNo) {
  const data = {
    zone: zone,
    station: station,
    fie_no: fie,
    equip_no: equipNo
  };

  fetch("FIE_details.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.message === "Record already exists") {
      // Existing FIE - show Get Details
      document.getElementById('btn-save').style.display = 'none';
      document.getElementById('btn-get_details').style.display = 'block';
    } else {
      // New FIE - show Save
      document.getElementById('btn-save').style.display = 'block';
      document.getElementById('btn-get_details').style.display = 'none';
    }
  })
  .catch(error => console.error("Error checking FIE:", error));
}

// Load module data after FIE info is saved
function loadModuleData(moduleId) {
  const zone = sessionStorage.getItem('zone');
  const station = sessionStorage.getItem('station');
  const fieNo = sessionStorage.getItem('fieNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !fieNo || !equipNo) {
    return;
  }

  const data = {
    zone: zone,
    station: station,
    fie_no: fieNo,
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
        <td><textarea placeholder="Condition">${row.equipment_condition || row.observation || ''}</textarea></td>
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

		// store metadata on the td for later upload/update handling
		const appendedRowTds = tr.querySelectorAll('td');
		if (appendedRowTds && appendedRowTds.length >= 5) {  // Adjust based on columns
			const imgTd = appendedRowTds[appendedRowTds.length - 1];
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
    if (cells.length >= 5) {  // Adjust for FIE tables
      const imgTd = cells[cells.length - 1];
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
  td.dataset.imageCellInitialized = '1';
  td.existingImages = existingPaths || [];
  td.newImages = [];
  td.removedExistingImages = [];
  td.innerHTML = buildImageCellMarkup();
  renderImageList(td);
}

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
    const type = isExisting ? 'existing' : 'new';
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
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      removeImageFromCell(td, idx, type, isExisting ? img : null);
    };

    box.appendChild(imgEl);
    box.appendChild(removeBtn);
    imgList.appendChild(box);
  });
}

function addImageToCell(td, imageObj) {
  if (!td) return;
  td.newImages = td.newImages || [];
  td.newImages.push(imageObj);
  renderImageList(td);
}

function removeImageFromCell(td, index, type, removed) {
  if (!td) return;

  if (type === 'existing') {
    td.existingImages.splice(index, 1);
    if (removed) {
      td.removedExistingImages = td.removedExistingImages || [];
      td.removedExistingImages.push(removed);
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
  const fieNo = sessionStorage.getItem('fieNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !fieNo || !equipNo) {
    alert("Please save FIE details first.");
    return;
  }

  const moduleTable = document.getElementById(moduleId);
  const rows = moduleTable.querySelectorAll('table tbody tr');

  // Validation: require at least one observed/condition filled
  let anyFilled = false;
  rows.forEach(row => {
    const fillEl = row.querySelector('td:nth-child(5) input, td:nth-child(6) textarea');  // Adjust indices
    if (fillEl && String(fillEl.value || '').trim() !== '') {
      anyFilled = true;
    }
  });
  if (!anyFilled) {
    alert("Please fill at least one field before saving.");
    return;
  }

  const formData = new FormData();

  formData.append('zone', zone);
  formData.append('station', station);
  formData.append('fie_no', fieNo);
  formData.append('equip_no', equipNo);
  formData.append('module', moduleId);

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');

    let slNo, description, actionTaken, observation, remarks;

    if (moduleId === 'verification') {
      slNo = rowIndex + 1;
      description = cells[0].textContent.trim();
      const nameNumber = cells[1].querySelector('input')?.value.trim() || '';
      const dateComm = cells[2].querySelector('input')?.value.trim() || '';
      actionTaken = cells[3].textContent.trim();
      observation = cells[4].querySelector('input')?.value.trim() || '';
      remarks = cells[5].querySelector('input')?.value.trim() || '';
      formData.append(`observations[${rowIndex}][name_number]`, nameNumber);
      formData.append(`observations[${rowIndex}][date_of_commissioning]`, dateComm);
    } else if (moduleId === 'monthly') {
      slNo = cells[0].textContent.trim();
      description = cells[2].textContent.trim();
      actionTaken = cells[3].textContent.trim();
      observation = cells[5].querySelector('textarea, input')?.value.trim() || '';
      remarks = cells[6].querySelector('input')?.value.trim() || '';
    } else if (moduleId === 'components') {
      slNo = rowIndex + 1;
      const componentName = cells[0].querySelector('input')?.value.trim() || '';
      const qty = cells[1].querySelector('input')?.value.trim() || '';
      description = componentName;  // Treat as description
      actionTaken = qty;  // Reuse fields if needed
      observation = cells[2].querySelector('input')?.value.trim() || '';  // Reason
      remarks = cells[3].querySelector('input')?.value.trim() || '';
    }

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[cells.length - 1];
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
      document.getElementById(`btn-save-${moduleId}`)?.style.display = 'none';
      document.getElementById(`btn-update-${moduleId}`)?.style.display = 'block';

      // highlight corresponding sidebar tab
      const tabId = `${moduleId}-tab`;
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
  const fieNo = sessionStorage.getItem('fieNo');
  const equipNo = sessionStorage.getItem('equipNo');

  if (!zone || !station || !fieNo || !equipNo) {
    alert("Please save FIE details first.");
    return;
  }

  const moduleTable = document.getElementById(moduleId);
  const rows = moduleTable.querySelectorAll('table tbody tr');

  // Validation: require at least one filled
  let anyFilled = false;
  rows.forEach(row => {
    const fillEl = row.querySelector('td:nth-child(5) input, td:nth-child(6) textarea');
    if (fillEl && String(fillEl.value || '').trim() !== '') {
      anyFilled = true;
    }
  });
  if (!anyFilled) {
    alert("Please fill at least one field before updating.");
    return;
  }

  const formData = new FormData();

  formData.append('zone', zone);
  formData.append('station', station);
  formData.append('fie_no', fieNo);
  formData.append('equip_no', equipNo);
  formData.append('module', moduleId);

  rows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');

    let slNo, description, actionTaken, observation, remarks;

    if (moduleId === 'verification') {
      slNo = rowIndex + 1;
      description = cells[0].textContent.trim();
      const nameNumber = cells[1].querySelector('input')?.value.trim() || '';
      const dateComm = cells[2].querySelector('input')?.value.trim() || '';
      actionTaken = cells[3].textContent.trim();
      observation = cells[4].querySelector('input')?.value.trim() || '';
      remarks = cells[5].querySelector('input')?.value.trim() || '';
      formData.append(`observations[${rowIndex}][name_number]`, nameNumber);
      formData.append(`observations[${rowIndex}][date_of_commissioning]`, dateComm);
    } else if (moduleId === 'monthly') {
      slNo = cells[0].textContent.trim();
      description = cells[2].textContent.trim();
      actionTaken = cells[3].textContent.trim();
      observation = cells[5].querySelector('textarea, input')?.value.trim() || '';
      remarks = cells[6].querySelector('input')?.value.trim() || '';
    } else if (moduleId === 'components') {
      slNo = rowIndex + 1;
      const componentName = cells[0].querySelector('input')?.value.trim() || '';
      const qty = cells[1].querySelector('input')?.value.trim() || '';
      description = componentName;
      actionTaken = qty;
      observation = cells[2].querySelector('input')?.value.trim() || '';  // Reason
      remarks = cells[3].querySelector('input')?.value.trim() || '';
    }

    formData.append(`observations[${rowIndex}][sl_no]`, slNo);
    formData.append(`observations[${rowIndex}][module]`, moduleId);
    formData.append(`observations[${rowIndex}][description]`, description);
    formData.append(`observations[${rowIndex}][action_taken]`, actionTaken);
    formData.append(`observations[${rowIndex}][observation]`, observation);
    formData.append(`observations[${rowIndex}][remarks]`, remarks);

    const td = cells[cells.length - 1];
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
      const tabId = `${moduleId}-tab`;
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

// === Get Details Button (from top FIE section) ===
function get() {
    const zone = document.getElementById("zone").value.trim();
    const station = document.getElementById("station").value.trim();
    const fie = document.getElementById("fie").value.trim();
    const equipNo = document.getElementById("equipNo").value.trim();

    if (!zone || !station || !fie || !equipNo) {
        alert("Please fill all FIE details first.");
        return;
    }

    const data = {
        zone: zone,
        station: station,
        fie_no: fie,
        equip_no: equipNo
    };

    fetch("FIE_details.php", {
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
            sessionStorage.setItem('fieNo', fie);
            sessionStorage.setItem('equipNo', equipNo);

            // Check modules with data and highlight sidebar
            checkModulesWithData(zone, station, fie, equipNo);

            // Load data for all modules
            loadAllModuleData();

            // Enable sidebar
            document.querySelector('.sidebar').style.pointerEvents = 'auto';

            if (result.success) {
                alert("✔️ New FIE Saved!");
            } else {
                alert("ℹ️ FIE already exists!");
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
function checkModulesWithData(zone, station, fie, equipNo) {
    const modules = ['verification', 'monthly', 'components'];

    modules.forEach(moduleId => {
        const data = {
            zone: zone,
            station: station,
            fie_no: fie,
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
            const tabId = `${moduleId}-tab`;
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
  const allModules = ['verification','monthly','components'];
  allModules.forEach((module) => {
    loadModuleData(module);
  });
}

// === Add Row for Components ===
function addComponentRow() {
  const tableBody = document.getElementById('componentsTableBody');
  if (!tableBody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td class="image-cell"><button onclick="openImageOptions(this)">Add Image</button></td>
  `;
  tableBody.appendChild(tr);

  // Initialize image cell
  const cells = tr.querySelectorAll('td');
  const imgTd = cells[4];
  initializeBlankImageCell(imgTd);
}

// Add this button to HTML if not there, but assume added in components div
// <button onclick="addComponentRow()">Add Component Row</button>