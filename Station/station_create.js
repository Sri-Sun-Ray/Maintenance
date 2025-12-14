/* station_create.js
   Works with fixed rows in HTML. Free-text remarks, RIU-style camera/image UI.
*/

/* ----- showModule defined first to avoid ReferenceError ----- */
function showModule(moduleId) {
  document.querySelectorAll('.module-table').forEach(div => div.style.display = 'none');
  const el = document.getElementById(moduleId);
  if (el) el.style.display = 'block';
  // ensure image cells in that module are initialized
  attachMetadataToRows(moduleId);
  // Initialize default values first (force update to ensure they're set)
  setTimeout(() => {
    initializeDefaultValues(moduleId, true);
    // Load module data if available (this will override defaults if data exists)
    loadModuleData(moduleId);
  }, 100);
}

function loadAllModuleData() {
  ['quarterly_check','daily_monthly','quarterly_half'].forEach(m => loadModuleData(m));
}

/* ---------------- CONFIG ---------------- */
const API_ENDPOINTS = {
  saveStationInfo: "save_station_info.php",
  save: "save_module_data.php",
  update: "update_module_data.php",
  get: "get_module_data.php"
};

/* ---------------- DEFAULT VALUES CONFIGURATION ---------------- */
/*
 * IMPORTANT: Update the default values below for each module.
 * These values will be pre-filled and set to readonly.
 * Users only need to fill: Name/Number, Date of Commissioning, Observed Value, Remarks, and Images.
 *
 * Format: { details: "Equipment Description", required_value: "Expected Value" }
 */
const DEFAULT_VALUES = {
  quarterly_check: [
    { details: "Signalling and Interlocking Plan ", required_value: "There shall not be any change in the SIP No" },
    { details: "RFID Tag Layout", required_value: "No mentioned above.Date of Commissioning on RFID Tag shall be on or after the Date of Commissioning as indicated in SIP " },
    { details: "Equipment 3 Details", required_value: "Required Value 3" },
    { details: "Equipment 4 Details", required_value: "Required Value 4" },
    { details: "Equipment 5 Details", required_value: "Required Value 5" },
    { details: "Equipment 6 Details", required_value: "Required Value 6" },
    { details: "Equipment 7 Details", required_value: "Required Value 7" },
    { details: "Equipment 8 Details", required_value: "Required Value 8" }
  ],
  daily_monthly: [
    { details: "Daily Equipment 1", required_value: "Daily Required 1" },
    { details: "Daily Equipment 2", required_value: "Daily Required 2" },
    { details: "Daily Equipment 3", required_value: "Daily Required 3" },
    { details: "Daily Equipment 4", required_value: "Daily Required 4" },
    { details: "Daily Equipment 5", required_value: "Daily Required 5" },
    { details: "Daily Equipment 6", required_value: "Daily Required 6" },
    { details: "Daily Equipment 7", required_value: "Daily Required 7" },
    { details: "Daily Equipment 8", required_value: "Daily Required 8" }
  ],
  quarterly_half: [
    { details: "Quarterly Equipment 1", required_value: "Quarterly Required 1" },
    { details: "Quarterly Equipment 2", required_value: "Quarterly Required 2" },
    { details: "Quarterly Equipment 3", required_value: "Quarterly Required 3" },
    { details: "Quarterly Equipment 4", required_value: "Quarterly Required 4" },
    { details: "Quarterly Equipment 5", required_value: "Quarterly Required 5" },
    { details: "Quarterly Equipment 6", required_value: "Quarterly Required 6" },
    { details: "Quarterly Equipment 7", required_value: "Quarterly Required 7" },
    { details: "Quarterly Equipment 8", required_value: "Quarterly Required 8" }
  ]
};

/* ---------------- Initialize Default Values ---------------- */
function initializeDefaultValues(moduleId, forceUpdate = false) {
  const map = { 'quarterly_check':'quarterlyCheckBody','daily_monthly':'dailyMonthlyBody','quarterly_half':'quarterlyHalfBody' };
  const tbody = document.getElementById(map[moduleId]);
  if (!tbody) return;

  const defaults = DEFAULT_VALUES[moduleId];
  if (!defaults) return;

  const rows = Array.from(tbody.querySelectorAll('tr'));
  rows.forEach((row, index) => {
    if (index < defaults.length) {
      const detailsInput = row.cells[1].querySelector('input');
      const requiredValueInput = row.cells[4].querySelector('input');

      // Set details field - always set if forceUpdate is true, or if field is empty/placeholder
      if (detailsInput) {
        const currentValue = detailsInput.value.trim();
        const isPlaceholder = !currentValue ||
                              currentValue === '' ||
                              currentValue === 'Details of the Equipment' ||
                              (currentValue.startsWith('Equipment') && currentValue.includes('Details')) ||
                              (currentValue.startsWith('Daily Equipment')) ||
                              (currentValue.startsWith('Quarterly Equipment'));

        // Always set if forceUpdate, or if empty/placeholder and not readonly (meaning it hasn't been set yet)
        if (forceUpdate || (isPlaceholder && !detailsInput.readOnly)) {
          detailsInput.value = defaults[index].details;
          detailsInput.readOnly = true;
          detailsInput.style.backgroundColor = '#f5f5f5';
          detailsInput.style.cursor = 'not-allowed';
        }
      }

      // Set required value field - always set if forceUpdate is true, or if field is empty/placeholder
      if (requiredValueInput) {
        const currentValue = requiredValueInput.value.trim();
        const isPlaceholder = !currentValue ||
                             currentValue === '' ||
                             currentValue === 'Required Value' ||
                             (currentValue.startsWith('Required Value')) ||
                             (currentValue.startsWith('Daily Required')) ||
                             (currentValue.startsWith('Quarterly Required'));

        // Always set if forceUpdate, or if empty/placeholder and not readonly (meaning it hasn't been set yet)
        if (forceUpdate || (isPlaceholder && !requiredValueInput.readOnly)) {
          requiredValueInput.value = defaults[index].required_value;
          requiredValueInput.readOnly = true;
          requiredValueInput.style.backgroundColor = '#f5f5f5';
          requiredValueInput.style.cursor = 'not-allowed';
        }
      }
    }
  });
}

/* ----------------- helpers ----------------- */
function parseJSONSafe(response) {
  return response.text().then(text => { try { return JSON.parse(text); } catch(e) { console.error("Non-JSON response:", text); throw e; }});
}

/* ---------------- Image / Camera UI (RIU-like) ---------------- */
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
  if (!td) return;
  if (td.dataset.imageCellInitialized === '1') return;
  td.dataset.imageCellInitialized = '1';
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];
  td.removedExistingImages = td.removedExistingImages || [];
  td.innerHTML = buildImageCellMarkup();
  renderImageList(td);
}

function renderImageList(td) {
  if (!td) return;
  initializeBlankImageCell(td);
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];

  const list = td.querySelector('.image-list');
  if (!list) return;
  list.innerHTML = '';

  if ((td.existingImages.length === 0) && (td.newImages.length === 0)) {
    list.innerHTML = '<div class="image-empty">No images yet</div>';
    return;
  }

  td.existingImages.forEach((p, idx) => {
    const div = document.createElement('div'); div.className = 'image-box';
    div.innerHTML = `<img src="${p}" alt="Existing"><button type="button" class="remove-btn" data-type="existing" data-index="${idx}" onclick="removeImage(this)">✖</button>`;
    list.appendChild(div);
    div.querySelector('img').addEventListener('click', () => openImagePreview(p));
  });

  td.newImages.forEach((obj, idx) => {
    const div = document.createElement('div'); div.className = 'image-box';
    div.innerHTML = `<img src="${obj.preview}" alt="New"><button type="button" class="remove-btn" data-type="new" data-index="${idx}" onclick="removeImage(this)">✖</button>`;
    list.appendChild(div);
    div.querySelector('img').addEventListener('click', () => openImagePreview(obj.preview));
  });
}

function openImageOptions(btn) {
  const td = btn.closest('td');
  if (!td) return;
  initializeBlankImageCell(td);
  const actions = td.querySelector('.image-actions');
  actions.innerHTML = `
    <div class="image-options">
      <button type="button" onclick="openCameraInCell(this,'user')">Front Camera</button>
      <button type="button" onclick="openCameraInCell(this,'environment')">Back Camera</button>
      <button type="button" onclick="uploadInCell(this)">Upload from Device</button>
      <button type="button" class="cancel-btn" onclick="closeImageOptions(this)">Cancel</button>
    </div>
  `;
}

function closeImageOptions(button) {
  const td = button.closest('td');
  if (!td) return;
  const actions = td.querySelector('.image-actions');
  if (actions) actions.innerHTML = `<button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>`;
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
        td.newImages = td.newImages || [];
        td.newImages.push({ file, preview: ev.target.result });
        renderImageList(td);
      };
      reader.readAsDataURL(file);
    });
    closeImageOptions(button);
  };
  input.click();
}

function openCameraInCell(button, facingMode) {
  const td = button.closest('td');
  if (!td) return;
  initializeBlankImageCell(td);
  const actions = td.querySelector('.image-actions');
  const rowId = Date.now();
  actions.innerHTML = `
    <div class="camera-container" data-camera-id="${rowId}">
      <video id="camera-${rowId}" autoplay playsinline style="width:160px;height:120px;border:1px solid #333;border-radius:6px;"></video>
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
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
    video.srcObject = stream;
    activeCellCameras[rowId] = stream;
    cameraCellMap[rowId] = td;
  } catch (err) {
    alert('Camera access denied or unavailable.');
    console.error(err);
    closeImageOptions({ closest: () => td });
  }
}

function stopCameraInCell(rowId) {
  const stream = activeCellCameras[rowId];
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    delete activeCellCameras[rowId];
  }
  const td = cameraCellMap[rowId];
  if (td) {
    const actions = td.querySelector('.image-actions');
    if (actions) actions.innerHTML = `<button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>`;
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
    const file = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
    const reader = new FileReader();
    reader.onload = ev => {
      td.newImages = td.newImages || [];
      td.newImages.push({ file, preview: ev.target.result });
      renderImageList(td);
      stopCameraInCell(rowId);
    };
    reader.readAsDataURL(file);
  }, 'image/png');
}

function removeImage(button) {
  const td = button.closest('td');
  if (!td) return;
  const type = button.dataset.type;
  const index = Number(button.dataset.index);
  if (type === 'existing') {
    if (td.existingImages && td.existingImages[index] !== undefined) {
      const [removed] = td.existingImages.splice(index, 1);
      td.removedExistingImages = td.removedExistingImages || [];
      td.removedExistingImages.push(removed);
    }
  } else {
    if (td.newImages) td.newImages.splice(index, 1);
  }
  renderImageList(td);
}

function openImagePreview(src) {
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

/* ------------- row initializers (for fixed-rows HTML) ------------- */
function attachMetadataToRows(moduleId) {
  const map = { 'quarterly_check':'quarterlyCheckBody','daily_monthly':'dailyMonthlyBody','quarterly_half':'quarterlyHalfBody' };
  const tbody = document.getElementById(map[moduleId]);
  if (!tbody) return;
  Array.from(tbody.querySelectorAll('tr')).forEach(row => {
    const cells = row.querySelectorAll('td');
    const imgTd = cells[cells.length - 1];
    if (imgTd) {
      initializeBlankImageCell(imgTd);
    }
    // Auto-resize textarea
    const remarksTA = cells[6].querySelector('textarea');
    if (remarksTA) {
      remarksTA.addEventListener('input', e => {
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
      });
    }
  });
}

/* ------------- Station save / get ------------- */
function saveStationInfo() {
  const zone = document.getElementById('zone')?.value?.trim() || '';
  const station = document.getElementById('station')?.value?.trim() || '';
  const date = document.getElementById('date')?.value?.trim() || '';
  if (!zone || !station || !date) { alert('Please fill Zone, Station and Date.'); return; }

  fetch(API_ENDPOINTS.saveStationInfo, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ zone, station, date })
  })
  .then(res => parseJSONSafe(res))
  .then(result => {
    if (result && result.success) {
      alert('Station info saved.');
      if (result.station_id) sessionStorage.setItem('station_id', result.station_id);
      sessionStorage.setItem('zone', zone);
      sessionStorage.setItem('station', station);
      sessionStorage.setItem('date', date);
      localStorage.setItem('zone', zone);
      localStorage.setItem('selectedStation', station);
      localStorage.setItem('date', date);
      document.getElementById('btn-get') && (document.getElementById('btn-get').style.display = 'inline-block');
      document.querySelector('.sidebar') && (document.querySelector('.sidebar').style.pointerEvents = 'auto');
    } else {
      alert('Save failed: ' + (result.message || JSON.stringify(result)));
    }
  })
  .catch(err => { console.error('Error saving station info:', err); alert('Error saving station info. See console.'); });
}

function getStationDetails() {
  const zone = document.getElementById('zone')?.value?.trim() || '';
  const station = document.getElementById('station')?.value?.trim() || '';
  const date = document.getElementById('date')?.value?.trim() || '';
  if (!zone || !station || !date) { alert('Please fill Zone, Station and Date.'); return; }

  sessionStorage.setItem('zone', zone);
  sessionStorage.setItem('station', station);
  sessionStorage.setItem('date', date);

  loadAllModuleData();
  checkModulesWithData(zone, station, date);
  document.querySelector('.sidebar') && (document.querySelector('.sidebar').style.pointerEvents = 'auto');
  alert('Loaded available details (if any).');
}

/* ------------- Save / Update module rows ------------- */
function validateStationFields() {
  const zone = document.getElementById('zone')?.value?.trim();
  const station = document.getElementById('station')?.value?.trim();
  const date = document.getElementById('date')?.value?.trim();
  if (!zone || !station || !date) { 
    alert('Please fill Zone, Station and Date before saving module data.'); 
    return false; 
  }
  return true;
}

function saveModuleData(moduleId) {
  if (!validateStationFields()) return;

  const zone = document.getElementById('zone').value.trim();
  const station = document.getElementById('station').value.trim();
  const date = document.getElementById('date').value.trim();

  const map = {
    quarterly_check: "quarterlyCheckBody",
    daily_monthly: "dailyMonthlyBody",
    quarterly_half: "quarterlyHalfBody"
  };

  const tbody = document.getElementById(map[moduleId]);
  if (!tbody) { alert("Module table not found: " + moduleId); return; }

  const rows = Array.from(tbody.querySelectorAll("tr"));

  let anyFilled = false;
  rows.forEach(r => {
    const observed = r.cells[5].querySelector("input")?.value?.trim();
    const remarks = r.cells[6].querySelector("textarea")?.value?.trim();
    if (observed || remarks) anyFilled = true;
  });
  if (!anyFilled && !confirm("No Observed Value / Remarks found. Save anyway?")) return;

  const fd = new FormData();
  fd.append("zone", zone);
  fd.append("station", station);
  fd.append("date", date);
  fd.append("module", moduleId);

  rows.forEach((row, idx) => {

    const s_no = row.cells[0].textContent.trim();

    /* -----------------------------
       CASE 1: quarterly_check (OLD)
       ----------------------------- */
    if (moduleId === "quarterly_check") {
      // For quarterly_check, details and required_value might be text (defaults) or input
      const detailsCell = row.cells[1];
      const detailsInput = detailsCell.querySelector("input");
      const details = detailsInput ? detailsInput.value.trim() : detailsCell.textContent.trim();
      
      const name_number = row.cells[2].querySelector("input")?.value.trim() || "";
      const date_commission = row.cells[3].querySelector("input")?.value || "";
      
      const requiredValueCell = row.cells[4];
      const requiredValueInput = requiredValueCell.querySelector("input");
      const required_value = requiredValueInput ? requiredValueInput.value.trim() : requiredValueCell.textContent.trim();
      
      const observed_value = row.cells[5].querySelector("input")?.value.trim() || "";
      const remarks = row.cells[6].querySelector("textarea")?.value.trim() || "";

      fd.append(`observations[${idx}][s_no]`, s_no);
      fd.append(`observations[${idx}][details]`, details);
      fd.append(`observations[${idx}][name_number]`, name_number);
      fd.append(`observations[${idx}][date_commission]`, date_commission);
      fd.append(`observations[${idx}][required_value]`, required_value);
      fd.append(`observations[${idx}][observed_value]`, observed_value);
      fd.append(`observations[${idx}][remarks]`, remarks);
    }

    /* --------------------------------------------------
       CASE 2: daily_monthly + quarterly_half (NEW FORMAT)
       -------------------------------------------------- */
    else {

      const location = row.cells[1].textContent.trim();
      const taskDescription = row.cells[2].textContent.trim();
      const actionTaken = row.cells[3].textContent.trim();
      const frequency = row.cells[4].textContent.trim();
      const equipmentCondition = row.cells[5].querySelector("input")?.value.trim() || "";
      const remarks = row.cells[6].querySelector("textarea")?.value.trim() || "";

      fd.append(`observations[${idx}][s_no]`, s_no);
      fd.append(`observations[${idx}][name_number]`, location);
      fd.append(`observations[${idx}][details]`, taskDescription);
      fd.append(`observations[${idx}][required_value]`, actionTaken);
      fd.append(`observations[${idx}][date_commission]`, frequency);
      fd.append(`observations[${idx}][observed_value]`, equipmentCondition);
      fd.append(`observations[${idx}][remarks]`, remarks);
    }

    /* -----------------------------
       IMAGES FOR ALL MODULES
       ----------------------------- */
    const imgTd = row.cells[7];

    if (imgTd) {
      if (Array.isArray(imgTd.existingImages)) {
        imgTd.existingImages.forEach(p => {
          fd.append(`observations[${idx}][existing_images][]`, p);
        });
      }

      if (Array.isArray(imgTd.newImages)) {
        imgTd.newImages.forEach(o => {
          fd.append(`observations[${idx}][images][]`, o.file);
        });
      }
    }

  });

  fetch(API_ENDPOINTS.save, { method: "POST", body: fd })
    .then(res => parseJSONSafe(res))
    .then(result => {
      if (result.success) {
        alert("Module saved successfully.");
        markModuleTabFilled(moduleId);
        // Toggle buttons after save
        const saveBtn = getSaveButtonForModule(moduleId);
        const updateBtn = getUpdateButtonForModule(moduleId);
        if (saveBtn) saveBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'inline-block';
      } else {
        alert("Save failed: " + (result.message || JSON.stringify(result)));
      }
    })
    .catch(err => {
      console.error("Error saving module:", err);
      alert("Error saving module. See console.");
    });

}

function updateModuleData(moduleId) {

  if (!validateStationFields()) return;

  const zone = document.getElementById('zone').value.trim();
  const station = document.getElementById('station').value.trim();
  const date = document.getElementById('date').value.trim();

  const map = {
    quarterly_check: "quarterlyCheckBody",
    daily_monthly: "dailyMonthlyBody",
    quarterly_half: "quarterlyHalfBody"
  };

  const tbody = document.getElementById(map[moduleId]);
  if (!tbody) { alert("Module table not found: " + moduleId); return; }

  const rows = Array.from(tbody.querySelectorAll("tr"));
  const fd = new FormData();

  fd.append("zone", zone);
  fd.append("station", station);
  fd.append("date", date);
  fd.append("module", moduleId);

  rows.forEach((row, idx) => {

    const s_no = row.cells[0].textContent.trim();

    /* ---------------------------------------
       CASE 1: quarterly_check (OLD STRUCTURE)
       --------------------------------------- */
    if (moduleId === "quarterly_check") {
      // For quarterly_check, details and required_value might be text (defaults) or input
      const detailsCell = row.cells[1];
      const detailsInput = detailsCell.querySelector("input");
      const details = detailsInput ? detailsInput.value.trim() : detailsCell.textContent.trim();
      
      const name_number = row.cells[2].querySelector("input")?.value.trim() || "";
      const date_commission = row.cells[3].querySelector("input")?.value || "";
      
      const requiredValueCell = row.cells[4];
      const requiredValueInput = requiredValueCell.querySelector("input");
      const required_value = requiredValueInput ? requiredValueInput.value.trim() : requiredValueCell.textContent.trim();
      
      const observed_value = row.cells[5].querySelector("input")?.value.trim() || "";
      const remarks = row.cells[6].querySelector("textarea")?.value.trim() || "";

      fd.append(`observations[${idx}][s_no]`, s_no);
      fd.append(`observations[${idx}][details]`, details);
      fd.append(`observations[${idx}][name_number]`, name_number);
      fd.append(`observations[${idx}][date_commission]`, date_commission);
      fd.append(`observations[${idx}][required_value]`, required_value);
      fd.append(`observations[${idx}][observed_value]`, observed_value);
      fd.append(`observations[${idx}][remarks]`, remarks);
    }

    /* ---------------------------------------------------
       CASE 2: daily_monthly & quarterly_half (NEW FORMAT)
       --------------------------------------------------- */
    else {

      const location = row.cells[1].textContent.trim();
      const taskDescription = row.cells[2].textContent.trim();
      const actionTaken = row.cells[3].textContent.trim();
      const frequency = row.cells[4].textContent.trim();
      const equipmentCondition = row.cells[5].querySelector("input")?.value.trim() || "";
      const remarks = row.cells[6].querySelector("textarea")?.value.trim() || "";

      fd.append(`observations[${idx}][s_no]`, s_no);
      fd.append(`observations[${idx}][name_number]`, location);
      fd.append(`observations[${idx}][details]`, taskDescription);
      fd.append(`observations[${idx}][required_value]`, actionTaken);
      fd.append(`observations[${idx}][date_commission]`, frequency);
      fd.append(`observations[${idx}][observed_value]`, equipmentCondition);
      fd.append(`observations[${idx}][remarks]`, remarks);
    }

    /* ---------------------------------------
       IMAGE HANDLING FOR ALL MODULES
       --------------------------------------- */
    const imgTd = row.cells[7];

    if (imgTd) {
      if (Array.isArray(imgTd.existingImages)) {
        imgTd.existingImages.forEach(p => {
          fd.append(`observations[${idx}][existing_images][]`, p);
        });
      }

      if (Array.isArray(imgTd.removedExistingImages)) {
        imgTd.removedExistingImages.forEach(p => {
          fd.append(`observations[${idx}][removed_images][]`, p);
        });
      }

      if (Array.isArray(imgTd.newImages)) {
        imgTd.newImages.forEach(o => {
          fd.append(`observations[${idx}][images][]`, o.file);
        });
      }
    }

  });

  fetch(API_ENDPOINTS.update, { method: "POST", body: fd })
    .then(res => parseJSONSafe(res))
    .then(result => {
      if (result && result.success) {
        alert("Module updated successfully.");
        markModuleTabFilled(moduleId);
        // Ensure update button stays visible
        const saveBtn = getSaveButtonForModule(moduleId);
        const updateBtn = getUpdateButtonForModule(moduleId);
        if (saveBtn) saveBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'inline-block';
      } else {
        alert("Update failed: " + (result.message || JSON.stringify(result)));
      }
    })
    .catch(err => {
      console.error("Error updating module:", err);
      alert("Error updating module. See console.");
    });

}


/* ------------- Load module data ------------- */
function loadModuleData(moduleId) {
  const zone = document.getElementById('zone')?.value?.trim();
  const station = document.getElementById('station')?.value?.trim();
  const date = document.getElementById('date')?.value?.trim();
  if (!zone || !station || !date) return;

  fetch(API_ENDPOINTS.get, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ zone, station, date, module: moduleId })
  })
  .then(res => res.json())
  .then(result => { if (result && result.success && Array.isArray(result.data)) populateModuleFromServer(moduleId, result.data); })
  .catch(err => console.error('Error loading module data:', err));
}

function populateModuleFromServer(moduleId, serverRows) {
  const map = { 'quarterly_check':'quarterlyCheckBody','daily_monthly':'dailyMonthlyBody','quarterly_half':'quarterlyHalfBody' };
  const tbody = document.getElementById(map[moduleId]);
  if (!tbody) return;

  attachMetadataToRows(moduleId);

  serverRows.forEach(rowData => {
    const sNo = String(rowData.s_no || rowData.sl_no || rowData.sno || '').trim();
    if (!sNo) return;
    const matched = Array.from(tbody.querySelectorAll('tr')).find(tr => String(tr.cells[0].textContent).trim() === sNo);
    if (!matched) return;

    const detailsInput = matched.cells[1].querySelector('input');
    const requiredValueInput = matched.cells[4].querySelector('input');

    // Populate details (keep readonly if it was set)
    if (detailsInput) {
      // If details is empty in DB, use default value
      const defaults = DEFAULT_VALUES[moduleId];
      const rowIndex = parseInt(sNo) - 1;
      const defaultDetails = (defaults && defaults[rowIndex]) ? defaults[rowIndex].details : '';
      const dbDetails = rowData.details || '';
      
      if (dbDetails) {
        detailsInput.value = dbDetails;
      } else if (defaultDetails) {
        detailsInput.value = defaultDetails;
        detailsInput.readOnly = true;
        detailsInput.style.backgroundColor = '#f5f5f5';
        detailsInput.style.cursor = 'not-allowed';
      }
    }

    matched.cells[2].querySelector('input').value = rowData.name_number || '';
    if (rowData.date_commission) matched.cells[3].querySelector('input').value = rowData.date_commission;

    // Populate required value (keep readonly if it was set)
    if (requiredValueInput) {
      // If required_value is empty in DB, use default value
      const defaults = DEFAULT_VALUES[moduleId];
      const rowIndex = parseInt(sNo) - 1;
      const defaultRequired = (defaults && defaults[rowIndex]) ? defaults[rowIndex].required_value : '';
      const dbRequired = rowData.required_value || '';
      
      if (dbRequired) {
        requiredValueInput.value = dbRequired;
      } else if (defaultRequired) {
        requiredValueInput.value = defaultRequired;
        requiredValueInput.readOnly = true;
        requiredValueInput.style.backgroundColor = '#f5f5f5';
        requiredValueInput.style.cursor = 'not-allowed';
      }
    }

    matched.cells[5].querySelector('input').value = rowData.observed_value || '';
    matched.cells[6].querySelector('textarea').value = rowData.remarks || '';

    const imgCell = matched.cells[7];
    const paths = Array.isArray(rowData.image_paths) ? rowData.image_paths : (rowData.image_path ? [rowData.image_path] : []);
    imgCell.existingImages = paths.slice();
    imgCell.newImages = [];
    imgCell.removedExistingImages = [];
    renderImageList(imgCell);
  });
}

/* ------------- Module presence check ------------- */
function checkModulesWithData(zone, station, date) {
  const modules = ['quarterly_check','daily_monthly','quarterly_half'];
  modules.forEach(moduleId => {
    fetch(API_ENDPOINTS.get, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ zone, station, date, module: moduleId })
    })
    .then(res => res.json())
    .then(result => {
      const li = findSidebarLiForModule(moduleId);
      const saveBtn = getSaveButtonForModule(moduleId);
      const updateBtn = getUpdateButtonForModule(moduleId);
      if (result && result.success && Array.isArray(result.data) && result.data.length > 0) {
        if (li) li.classList.add('filled');
        if (saveBtn) saveBtn.style.display = 'none';
        if (updateBtn) updateBtn.style.display = 'inline-block';
      } else {
        if (li) li.classList.remove('filled');
        if (saveBtn) saveBtn.style.display = 'inline-block';
        if (updateBtn) updateBtn.style.display = 'none';
      }
    })
    .catch(err => console.error('checkModulesWithData error for', moduleId, err));
  });
}

function findSidebarLiForModule(moduleId) {
  const mapping = { 'quarterly_check':'Schedule Check – Quarterly','daily_monthly':'Maintenance Schedule – Daily & Monthly','quarterly_half':'Maintenance Schedule – Quarterly & Half Yearly' };
  const text = mapping[moduleId];
  const items = document.querySelectorAll('.sidebar ul li');
  for (let li of items) if (li.textContent.trim() === text) return li;
  return null;
}
function getSaveButtonForModule(moduleId) {
  if (moduleId === 'quarterly_check') return document.getElementById('saveQuarterly');
  if (moduleId === 'daily_monthly') return document.getElementById('saveDailyMonthly');
  if (moduleId === 'quarterly_half') return document.getElementById('saveQuarterlyHalf');
  return null;
}
function getUpdateButtonForModule(moduleId) {
  if (moduleId === 'quarterly_check') return document.getElementById('updateQuarterly');
  if (moduleId === 'daily_monthly') return document.getElementById('updateDailyMonthly');
  if (moduleId === 'quarterly_half') return document.getElementById('updateQuarterlyHalf');
  return null;
}
function markModuleTabFilled(moduleId) { const li = findSidebarLiForModule(moduleId); if (li) li.classList.add('filled'); }

/* ------------- Generate Report ------------- */
function generateReport() {
  const zone = document.getElementById('zone')?.value?.trim();
  const station = document.getElementById('station')?.value?.trim();
  const date = document.getElementById('date')?.value?.trim();

  if (!zone || !station || !date) {
    alert('Please fill Zone, Station and Date before generating report.');
    return;
  }

  // Store in sessionStorage
  sessionStorage.setItem('zone', zone);
  sessionStorage.setItem('station', station);
  sessionStorage.setItem('date', date);

  // Redirect to observations page
  window.location.href = 'observations.html';
}

/* ------------- Init ------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize defaults for all modules on page load
  ['quarterly_check','daily_monthly','quarterly_half'].forEach(m => {
    attachMetadataToRows(m);
    // Force update defaults on initial load
    initializeDefaultValues(m, true);
  });

  document.getElementById('btn-save')?.addEventListener('click', saveStationInfo);
  document.getElementById('btn-get')?.addEventListener('click', getStationDetails);

  document.getElementById('saveQuarterly')?.addEventListener('click', () => saveModuleData('quarterly_check'));
  document.getElementById('updateQuarterly')?.addEventListener('click', () => updateModuleData('quarterly_check'));
  document.getElementById('saveDailyMonthly')?.addEventListener('click', () => saveModuleData('daily_monthly'));
  document.getElementById('updateDailyMonthly')?.addEventListener('click', () => updateModuleData('daily_monthly'));
  document.getElementById('saveQuarterlyHalf')?.addEventListener('click', () => saveModuleData('quarterly_half'));
  document.getElementById('updateQuarterlyHalf')?.addEventListener('click', () => updateModuleData('quarterly_half'));

  document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);

  document.querySelectorAll('.sidebar ul li').forEach(li => li.addEventListener('click', () => {
    const text = li.textContent.trim();
    if (text === 'Schedule Check – Quarterly') showModule('quarterly_check');
    else if (text === 'Maintenance Schedule – Daily & Monthly') showModule('daily_monthly');
    else if (text === 'Maintenance Schedule – Quarterly & Half Yearly') showModule('quarterly_half');
  }));

  document.querySelectorAll('.close-preview').forEach(b => b.addEventListener('click', closeImagePreview));
  const modal = document.getElementById('imagePreviewModal');
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeImagePreview(); });

  const storedZone = localStorage.getItem('zone');
  const storedStation = localStorage.getItem('selectedStation');
  const storedDate = localStorage.getItem('date');
  if (storedZone) document.getElementById('zone').value = storedZone;
  if (storedStation) document.getElementById('station').value = storedStation;
  if (storedDate) document.getElementById('date').value = storedDate;

  const sZone = sessionStorage.getItem('zone');
  const sStation = sessionStorage.getItem('station');
  const sDate = sessionStorage.getItem('date');
  if (sZone && sStation && sDate) {
    document.getElementById('btn-get') && (document.getElementById('btn-get').style.display = 'inline-block');
    document.querySelector('.sidebar') && (document.querySelector('.sidebar').style.pointerEvents = 'auto');
  } else {
    document.getElementById('btn-save') && (document.getElementById('btn-save').style.display = 'inline-block');
  }

  document.querySelectorAll('.module-table').forEach(m => m.style.display = 'none');
});
