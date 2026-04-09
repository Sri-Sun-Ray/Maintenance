

const moduleTableMap = {
  locomotive: "locomotive",
  brake_interface: "brake_interface",
  underframe: "underframe",
  locomotive_avail: "locomotive_avail",
  underframe2: "underframe2",
  roof: "roof"
};

const activeCellCameras = {};
const cameraCellMap = {};
let currentCamera = "environment";

function showModuleTab(moduleId) {

  document.querySelectorAll(".module-container")
    .forEach(div => div.style.display = "none");

  document.getElementById(moduleId).style.display = "block";

  document.querySelectorAll(".tab-btn")
    .forEach(btn => btn.classList.remove("active"));

  const activeBtn = [...document.querySelectorAll(".tab-btn")]
    .find(btn => btn.getAttribute("onclick").includes(moduleId));

  if (activeBtn) activeBtn.classList.add("active");

  // ✅ AUTO CHECK DATA STATUS
  const cleanId = moduleId.replace("module_", "");
  checkModuleDataStatus(cleanId);
}

function checkModuleDataStatus(moduleId) {

  const loco = document.getElementById("loco").value;
  const station = document.getElementById("station").value;

  if (!loco || !station) return;

  if (!moduleTableMap[moduleId]) {
    console.error("Invalid module ID:", moduleId);
    return;
  }

  fetch("/Maintenance/LTCAS/check_module_data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table: moduleTableMap[moduleId],
      loco: loco,
      station: station
    })
  })
    .then(res => res.json())
    .then(data => {

      const moduleDiv = document.getElementById(`module_${moduleId}`) || document.getElementById(moduleId);

      const saveBtn = moduleDiv.querySelector(".btn-save");
      const getBtn = moduleDiv.querySelector(".btn-get-details");
      const updBtn = moduleDiv.querySelector(".btn-update");

      if (data.exists) {
        saveBtn.style.display = "none";
        getBtn.style.display = "inline-block";
        updBtn.style.display = "inline-block";
      } else {
        saveBtn.style.display = "inline-block";
        getBtn.style.display = "none";
        updBtn.style.display = "none";
      }
    })
    .catch(err => console.error(err));
}

function getModuleDetails(moduleId) {
  const loco = document.getElementById("loco").value;
  const station = document.getElementById("station").value;

  if (!loco || !station) {
    alert("Loco and Station are required");
    return;
  }

  if (!moduleTableMap[moduleId]) {
    console.error("Invalid module:", moduleId);
    return;
  }

  fetch("/Maintenance/LTCAS/get_module_data.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table: moduleTableMap[moduleId],
      loco: loco,
      station: station
    })
  })
    .then(res => res.text())
    .then(text => {
      console.log("GET RAW RESPONSE:", text);
      return JSON.parse(text);
    })
    .then(data => {

      if (!data.success || !Array.isArray(data.data)) {
        alert("No data found for this module");
        return;
      }

      const tableBody = document.getElementById(`${moduleId}FullTableBody`);
      if (!tableBody) {
        console.error("Table body not found:", `${moduleId}FullTableBody`);
        return;
      }

      const rows = tableBody.querySelectorAll("tr");

      data.data.forEach((dbRow, index) => {

        const row = rows[index];
        if (!row) return;

        const cells = row.querySelectorAll("td");

        let startIndex = (cells.length === 12) ? 3 : 2;

        // ✅ SAFE TEXTAREAS
        const cab1 = cells[startIndex]?.querySelector("textarea");
        const cab2 = cells[startIndex + 1]?.querySelector("textarea");
        const remarks = cells[startIndex + 2]?.querySelector("textarea");

        // ✅ SAFE CHECKBOXES
        const trip = cells[startIndex + 3]?.querySelector("input");
        const ia_ib = cells[startIndex + 4]?.querySelector("input");
        const ic = cells[startIndex + 5]?.querySelector("input");
        const toh = cells[startIndex + 6]?.querySelector("input");
        const ioh = cells[startIndex + 7]?.querySelector("input");


        // ✅ ASSIGN VALUES SAFELY
        if (cab1) cab1.value = dbRow.cab1 ?? "";
        if (cab2) cab2.value = dbRow.cab2 ?? "";
        if (remarks) remarks.value = dbRow.remarks ?? "";

        if (trip) trip.checked = dbRow.trip == 1;
        if (ia_ib) ia_ib.checked = dbRow.ia_ib == 1;
        if (ic) ic.checked = dbRow.ic == 1;
        if (toh) toh.checked = dbRow.toh_aoh == 1;
        if (ioh) ioh.checked = dbRow.ioh_poh == 1;

        const imageCell = row.querySelector('.image-cell-container');
        if (imageCell) {
          hydrateImageCellWithExisting(imageCell, dbRow.image_paths || dbRow.image_path || []);
        }

      });

      alert("Data loaded successfully");

    })
    .catch(err => {
      console.error("Get Module Error:", err);
      alert("Error loading data from server");
    });
}

function updateModule(id) {

  const loco = document.getElementById("loco").value;
  const station = document.getElementById("station").value;

  if (!loco || !station) {
    alert("Loco and Station are required");
    return;
  }

  const tableBody = document.getElementById(`${id}FullTableBody`);
  if (!tableBody) {
    console.error("Table body not found for:", id);
    return;
  }

  const rows = tableBody.querySelectorAll("tr");

  let tableData = [];
  let lastDescription = "";

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");

    let sno = cells[0]?.innerText.trim() || "";
    let description = "";
    let parameter = "";
    let startIndex = 0;

    if (cells.length === 12) {
      description = cells[1].innerText.trim();
      lastDescription = description;
      parameter = cells[2].innerText.trim();
      startIndex = 3;
    } else if (cells.length === 11) {
      description = lastDescription;
      parameter = cells[1].innerText.trim();
      startIndex = 2;
    }

    const imageCell = cells[cells.length - 1];
    const rowData = {
      sno: sno,
      description: description,
      parameter: parameter,
      cab1: cells[startIndex]?.querySelector("textarea")
        ? cells[startIndex].querySelector("textarea").value
        : "",
      cab2: cells[startIndex + 1]?.querySelector("textarea")
        ? cells[startIndex + 1].querySelector("textarea").value
        : "",
      remarks: cells[startIndex + 2]?.querySelector("textarea")
        ? cells[startIndex + 2].querySelector("textarea").value
        : "",
      trip: cells[startIndex + 3]?.querySelector("input")?.checked ? 1 : 0,
      ia_ib: cells[startIndex + 4]?.querySelector("input")?.checked ? 1 : 0,
      ic: cells[startIndex + 5]?.querySelector("input")?.checked ? 1 : 0,
      toh_aoh: cells[startIndex + 6]?.querySelector("input")?.checked ? 1 : 0,
      ioh_poh: cells[startIndex + 7]?.querySelector("input")?.checked ? 1 : 0,
      station: station,
      loco: loco,
      image_paths: getImageCellValues(imageCell)
    };

    tableData.push(rowData);
  });

  fetch("/Maintenance/LTCAS/update_module.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table: moduleTableMap[id],
      data: tableData
    })
  })
    .then(res => res.text())
    .then(text => {
      console.log("GET RAW RESPONSE:", text);
      return JSON.parse(text);
    })
    .then(result => {
      alert(result.message);
    })
    .catch(err => {
      console.error("Update Error:", err);
      alert("Error updating data");
    });
}



window.addEventListener("DOMContentLoaded", function () {


    document.querySelectorAll(".tab-btn, .btn-report").forEach(btn => {
      btn.disabled = true;
    });

  initLTCASImageColumns();

  const urlParams = new URLSearchParams(window.location.search);
  const queryZone = urlParams.get('zone');
  const queryStation = urlParams.get('station');
  const queryLoco = urlParams.get('loco');

  if (queryZone) {
    document.getElementById("zone").value = queryZone;
  }
  if (queryStation) {
    document.getElementById("station").value = queryStation;
  }
  if (queryLoco) {
    document.getElementById("loco").value = queryLoco;
  }

  const storedZone = localStorage.getItem("zone");
  const storedStation = localStorage.getItem("selectedStation") || localStorage.getItem("station");
  const storedLoco = localStorage.getItem("loco");

  if (!queryZone && storedZone) {
    document.getElementById("zone").value = storedZone;
  }
  if (!queryStation && storedStation) {
    document.getElementById("station").value = storedStation;
  }
  if (!queryLoco && storedLoco) {
    document.getElementById("loco").value = storedLoco;
  }

  // ✅ AUTO-ENABLE IF DATA EXISTS
  const currentLoco = document.getElementById("loco").value;
  const currentStation = document.getElementById("station").value;
  if (currentLoco && currentStation && currentStation !== "-") {
    document.querySelectorAll(".tab-btn, .btn-report").forEach(btn => {
      btn.disabled = false;
    });
  }

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');

  const formattedDate = `${yyyy}-${mm}-${dd}`;
  document.getElementById("date").value = formattedDate;
});

function saveLocoInfo() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const loco = document.getElementById("loco").value.trim();
  const date = document.getElementById("date").value.trim();

  if (!loco || !station || station === "-") {
    alert("Please fill all the required fields (Loco and Station)");
    return;
  }

  localStorage.setItem("loco", loco);
  localStorage.setItem("station", station);
  const data = {
    zone: zone,
    station: station,
    loco: loco,
    date: date
  };

  fetch("/Maintenance/LTCAS/save_loco_info.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert(result.message);
        document.querySelectorAll(".tab-btn, .btn-report").forEach(btn => {
          btn.disabled = false;
        });
        showModuleTab("module_locomotive");

      }
      else {
        alert("Error saving data:" + result.message);
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Something went wrong please try again");
    });
}

function saveModule(id) {

  const tableBody = document.getElementById(`${id}FullTableBody`);
  if (!tableBody) {
    console.error("Table body not found for:", id);
    return;
  }
  const rows = tableBody.querySelectorAll("tr");

  let tableData = [];
  let lastDescription = "";   // ✅ store rowspan description

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");

    let sno = cells[0]?.innerText.trim() || "";

    let description = "";
    let parameter = "";
    let startIndex = 0;

    // ✅ If this row contains new description (rowspan row)
    if (cells.length === 12) {
      description = cells[1].innerText.trim();
      lastDescription = description;
      parameter = cells[2].innerText.trim();
      startIndex = 3;
    }
    // ✅ If this row is part of rowspan
    else if (cells.length === 11) {
      description = lastDescription;   // reuse previous
      parameter = cells[1].innerText.trim();
      startIndex = 2;
    }

    const imageCell = cells[cells.length - 1];
    const rowData = {
      sno: sno,
      description: description,
      parameter: parameter,
      cab1: cells[startIndex]?.querySelector("textarea")
        ? cells[startIndex].querySelector("textarea").value
        : "",
      cab2: cells[startIndex + 1]?.querySelector("textarea")
        ? cells[startIndex + 1].querySelector("textarea").value
        : "",
      remarks: cells[startIndex + 2]?.querySelector("textarea")
        ? cells[startIndex + 2].querySelector("textarea").value
        : "",
      trip: cells[startIndex + 3]?.querySelector("input")?.checked ? 1 : 0,
      ia_ib: cells[startIndex + 4]?.querySelector("input")?.checked ? 1 : 0,
      ic: cells[startIndex + 5]?.querySelector("input")?.checked ? 1 : 0,
      toh_aoh: cells[startIndex + 6]?.querySelector("input")?.checked ? 1 : 0,
      ioh_poh: cells[startIndex + 7]?.querySelector("input")?.checked ? 1 : 0,
      station: document.getElementById("station").value,
      loco: document.getElementById("loco").value,
      module: id,
      image_paths: getImageCellValues(imageCell)
    };

    tableData.push(rowData);
  });

  fetch("/Maintenance/LTCAS/save_module.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      table: id,
      tableData: tableData
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      const moduleDiv = document.getElementById(`module_${id}`) || document.getElementById(id);
      moduleDiv.querySelector(".btn-save").style.display = "none";
      moduleDiv.querySelector(".btn-get-details").style.display = "inline-block";
      moduleDiv.querySelector(".btn-update").style.display = "inline-block";
    })
    .catch(err => {
      console.error(err);
      alert("Error Saving Data");
    });
}

function prepareReportSession() {
  sessionStorage.setItem("zone", document.getElementById("zone").value);
  sessionStorage.setItem("station", document.getElementById("station").value);
  sessionStorage.setItem("loco", document.getElementById("loco").value);   // loco = riu number
  sessionStorage.setItem("date", document.getElementById("date").value); // if same
}

function initLTCASImageColumns() {
  document.querySelectorAll('.module-table-full').forEach(table => {
    const thead = table.querySelector('thead');
    if (!thead) return;

    const headerRows = thead.querySelectorAll('tr');
    if (headerRows.length >= 2) {
      const extraTh = document.createElement('th');
      extraTh.textContent = 'Images';
      headerRows[1].appendChild(extraTh);

      const scheduleTh = headerRows[0].querySelector('th[colspan="5"]');
      if (scheduleTh) scheduleTh.colSpan = '6';
    }

    table.querySelectorAll('tbody tr').forEach(row => {
      if (row.querySelector('.image-cell-container')) return;
      const imageCell = document.createElement('td');
      imageCell.className = 'image-cell-container';
      imageCell.innerHTML = `<div class="image-collection-placeholder"><button type="button" onclick="openImageOptions(this)">Add Image</button></div>`;
      row.appendChild(imageCell);
    });
  });
}

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
  if (!td || td.dataset.imageCellInitialized === '1') return;
  td.dataset.imageCellInitialized = '1';
  td.existingImages = td.existingImages || [];
  td.newImages = td.newImages || [];
  td.innerHTML = buildImageCellMarkup();
  renderImageList(td);
}

function renderImageList(td) {
  if (!td) return;
  initializeBlankImageCell(td);
  const list = td.querySelector('.image-list');
  if (!list) return;

  const existing = td.existingImages || [];
  const newcomer = td.newImages || [];
  list.innerHTML = '';

  const allImages = [...existing, ...newcomer];
  if (allImages.length === 0) {
    list.innerHTML = '<div class="image-empty">No images yet</div>';
    return;
  }

  allImages.forEach((img, idx) => {
    const src = typeof img === 'string' ? img : img.preview;
    const type = typeof img === 'string' ? 'existing' : 'new';
    const div = document.createElement('div');
    div.className = 'image-box';
    div.innerHTML = `
      <img src="${src}" alt="Uploaded" class="uploaded-image">
      <button type="button" class="remove-btn" data-type="${type}" data-index="${idx}" onclick="removeImage(this)">✖</button>
    `;
    list.appendChild(div);
    div.querySelector('img')?.addEventListener('click', () => openImagePreview(src));
  });
}

function parseImagePaths(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (err) {
    // ignore
  }
  return [String(value)].filter(Boolean);
}

function hydrateImageCellWithExisting(td, imagePaths) {
  if (!td) return;
  initializeBlankImageCell(td);
  td.existingImages = parseImagePaths(imagePaths);
  td.newImages = td.newImages || [];
  renderImageList(td);
}

function getImageCellValueArray(td) {
  if (!td) return [];
  const existing = Array.isArray(td.existingImages) ? td.existingImages : [];
  const incoming = Array.isArray(td.newImages)
    ? td.newImages.map(img => img.preview).filter(Boolean)
    : [];
  return [...existing, ...incoming];
}

function getImageCellValues(td) {
  return getImageCellValueArray(td).map(value => {
    if (typeof value === 'string') return value;
    return '';
  }).filter(Boolean);
}

function openImageOptions(button) {
  const td = button.closest('td');
  if (!td) return;
  initializeBlankImageCell(td);
  const actions = td.querySelector('.image-actions');
  if (!actions) return;
  actions.innerHTML = `
    <div class="image-options">
      <button type="button" onclick="openCameraInCell(this)">Camera</button>
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

function addNewImageToCell(td, file, previewSrc) {
  if (!td) return;
  initializeBlankImageCell(td);
  td.newImages = td.newImages || [];
  td.newImages.push({ file, preview: previewSrc });
  renderImageList(td);
}

function resetImageActions(td) {
  if (!td) return;
  const actions = td.querySelector('.image-actions');
  if (actions) {
    actions.innerHTML = `<button type="button" class="add-image-btn" onclick="openImageOptions(this)">Add Image</button>`;
  }
}

function openCameraInCell(button) {
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
        <button type="button" onclick="switchCameraInCell(${rowId})">🔄 Switch</button>
        <button type="button" onclick="stopCameraInCell(${rowId})">Close</button>
      </div>
    </div>
  `;

  startCameraInCell(rowId, td);
}

function switchCameraInCell(rowId) {
  currentCamera = currentCamera === "environment" ? "user" : "environment";
  const td = cameraCellMap[rowId];
  startCameraInCell(rowId, td);
}

async function startCameraInCell(rowId, td) {
  const video = document.getElementById(`camera-${rowId}`);
  if (!video) return;

  Object.values(activeCellCameras).forEach(s => {
    if (s && s.getTracks) s.getTracks().forEach(track => track.stop());
  });

  try {
    let stream;
    try {
      if (currentCamera === 'environment') {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },
          audio: false
        });
      }
    } catch (err) {
      console.warn('Environment exact failed, attempting ideal fallback', err);
    }

    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: currentCamera } },
          audio: false
        });
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    video.srcObject = stream;
    activeCellCameras[rowId] = stream;
    cameraCellMap[rowId] = td;
  } catch (err) {
    alert('Camera access denied!');
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
  input.onchange = e => {
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

function removeImage(button) {
  const td = button.closest('td');
  if (!td) return;
  const type = button.dataset.type;
  const index = Number(button.dataset.index);
  if (type === 'existing' && Array.isArray(td.existingImages)) {
    td.existingImages.splice(index, 1);
  } else if (type === 'new' && Array.isArray(td.newImages)) {
    td.newImages.splice(index, 1);
  }
  renderImageList(td);
}

function openImagePreview(src) {
  let modal = document.getElementById('ltcasImagePreviewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ltcasImagePreviewModal';
    modal.className = 'image-preview-modal';
    modal.innerHTML = `
      <div class="image-preview-content">
        <span class="image-preview-close" onclick="closeImagePreview()">×</span>
        <img id="ltcasPreviewImage" alt="Preview">
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById('ltcasPreviewImage').src = src;
  modal.style.display = 'flex';
}

function closeImagePreview() {
  const modal = document.getElementById('ltcasImagePreviewModal');
  if (modal) modal.style.display = 'none';
}

function generateReport() {
  const station = document.getElementById("station").value.trim();
  if (!station || station === "-") {
    alert("Station name is required to generate a report.");
    return;
  }
  prepareReportSession();   // store zone, station, loco
  window.location.href = "./LTCAS_Observation/observation.html";
}


