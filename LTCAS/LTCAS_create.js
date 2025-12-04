
function showModuleTab(moduleId) {
    // Hide all module containers
    document.querySelectorAll(".module-container")
      .forEach(div => div.style.display = "none");

    // Show selected module
    document.getElementById(moduleId).style.display = "block";

    // Update active tab
    document.querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));

    const activeBtn = [...document.querySelectorAll(".tab-btn")]
      .find(btn => btn.getAttribute("onclick").includes(moduleId));

    if (activeBtn) activeBtn.classList.add("active");
}

function showActionButtons() {
  document.querySelector('.btn-get-details').style.display = 'inline-block';
  document.querySelector('.btn-update').style.display = 'inline-block';
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

  fetch("save_loco_info.php",{
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if(result.success)
    {
      alert(result.message);
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
      cab1: cells[startIndex]?.querySelector("textarea")?.value || "",
      cab2: cells[startIndex + 1]?.querySelector("textarea")?.value || "",
      remarks: cells[startIndex + 2]?.querySelector("textarea")?.value || "",
      trip: cells[startIndex + 3]?.querySelector("input")?.checked ? 1 : 0,
      ia_ib: cells[startIndex + 4]?.querySelector("input")?.checked ? 1 : 0,
      ic: cells[startIndex + 5]?.querySelector("input")?.checked ? 1 : 0,
      toh_aoh: cells[startIndex + 6]?.querySelector("input")?.checked ? 1 : 0,
      ioh_poh: cells[startIndex + 7]?.querySelector("input")?.checked ? 1 : 0,
      station: document.getElementById("station").value,
      loco: document.getElementById("loco").value
    };

    tableData.push(rowData);
  });

  fetch("save_module.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tableData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
  })
  .catch(err => {
    console.error(err);
    alert("Error Saving Data");
  });
}
