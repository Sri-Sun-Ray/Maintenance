function convertToFullTemplate(moduleId) {
  const existingTableBody = document.getElementById(moduleId + 'TableBody');
  const newHtml = `
    <table class="module-table-full"> 
      <thead>...</thead>
      <tbody id="${moduleId}FullTableBody"></tbody>
    </table>
  `;
  
  document.getElementById(moduleId).innerHTML = newHtml;
}

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
      alert("Data saved Successfully");
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

