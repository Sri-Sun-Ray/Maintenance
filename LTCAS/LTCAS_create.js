

const moduleTableMap = {
  locomotive: "locomotive",
  brake_interface: "brake_interface",
  underframe: "underframe",
  locomotive_avail: "locomotive_avail",
  underframe2: "underframe2",
  roof: "roof"
};

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
  const cleanId = moduleId.replace("module_","");
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
    const getBtn  = moduleDiv.querySelector(".btn-get-details");
    const updBtn  = moduleDiv.querySelector(".btn-update");

    if (data.exists) {
      saveBtn.style.display = "none";
      getBtn.style.display  = "inline-block";
      updBtn.style.display  = "inline-block";
    } else {
      saveBtn.style.display = "inline-block";
      getBtn.style.display  = "none";
      updBtn.style.display  = "none";
    }
  })
  .catch(err => console.error(err));
}

function getModuleDetails(moduleId)
{
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

      let startIndex = (cells.length === 11) ? 3 : 2;

      // ✅ SAFE TEXTAREAS
      const cab1    = cells[startIndex]?.querySelector("textarea");
      const cab2    = cells[startIndex + 1]?.querySelector("textarea");
      const remarks= cells[startIndex + 2]?.querySelector("textarea");

      // ✅ SAFE CHECKBOXES
      const trip   = cells[startIndex + 3]?.querySelector("input");
      const ia_ib  = cells[startIndex + 4]?.querySelector("input");
      const ic     = cells[startIndex + 5]?.querySelector("input");
      const toh    = cells[startIndex + 6]?.querySelector("input");
      const ioh    = cells[startIndex + 7]?.querySelector("input");
      

      // ✅ ASSIGN VALUES SAFELY
      if (cab1)     cab1.value = dbRow.cab1 ?? "";
      if (cab2)     cab2.value = dbRow.cab2 ?? "";
      if (remarks) remarks.value = dbRow.remarks ?? "";

      if (trip)  trip.checked  = dbRow.trip == 1;
      if (ia_ib) ia_ib.checked = dbRow.ia_ib == 1;
      if (ic)    ic.checked    = dbRow.ic == 1;
      if (toh)   toh.checked   = dbRow.toh_aoh == 1;
      if (ioh)   ioh.checked   = dbRow.ioh_poh == 1;

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

    if (cells.length === 11) {
      description = cells[1].innerText.trim();
      lastDescription = description;
      parameter = cells[2].innerText.trim();
      startIndex = 3;
    } else if (cells.length === 10) {
      description = lastDescription;
      parameter = cells[1].innerText.trim();
      startIndex = 2;
    }

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
      loco: loco
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



window.addEventListener("DOMContentLoaded", function(){


    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.disabled = true;
    });

    const storedZone=localStorage.getItem("zone");
    const storedStation=this.localStorage.getItem("selectedStation");

    if(storedZone)
    {
      this.document.getElementById("zone").value=storedZone;
    }

    if(storedStation)
    {
      this.document.getElementById("station").value=storedStation;
    }

    const today=new Date();
    const yyyy=today.getFullYear();
    const mm=String(today.getMonth() +1).padStart(2,'0');
    const dd=String(today.getDate()).padStart(2,'0');

    const formattedDate= `${yyyy}-${mm}-${dd}`;
    this.document.getElementById("date").value=formattedDate;
});

function saveLocoInfo(){
  const zone=document.getElementById("zone").value.trim();
  const station=document.getElementById("station").value.trim();
  const loco=document.getElementById("loco").value.trim();
  const date=document.getElementById("date").value.trim();

  if(!loco)
  {
    alert("Please fill all the required fields");
    return;
  }

  localStorage.setItem("loco",loco);
  const data={
    zone: zone,
    station: station,
    loco: loco,
    date: date
  };

  fetch("/Maintenance/LTCAS/save_loco_info.php",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if(result.success)
    {
      alert(result.message);
      document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.disabled = false;
    });
    showModuleTab("module_locomotive");

    }
    else{
      alert("Error saving data:"+result.message);
    }
  })
  .catch(error => {
    console.error("Error:",error);
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
    if (cells.length === 11) {
      description = cells[1].innerText.trim();
      lastDescription = description;
      parameter = cells[2].innerText.trim();
      startIndex = 3;
    } 
    // ✅ If this row is part of rowspan
    else if (cells.length === 10) {
      description = lastDescription;   // reuse previous
      parameter = cells[1].innerText.trim();
      startIndex = 2;
    }

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
      module: id
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

function generateReport() {
  prepareReportSession();   // store zone, station, loco
  window.location.href = "./LTCAS_Observation/observation.html";
}


