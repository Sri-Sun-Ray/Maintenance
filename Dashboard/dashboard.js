// Simulated fetching data (replace with actual PHP API calls)

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

function populateStations(zone){

  const fromSelect=document.getElementById("fromStation");
  const toSelect=document.getElementById("toStation");
  const stationDropdown=document.getElementById("stationDropdown")

  fromSelect.innerHTML="";
  toSelect.innerHTML="";
  stationDropdown.innerHTML="";

  const stations=zoneStation[zone] || [];

  stations.forEach(station=> {
    fromSelect.innerHTML += `<option value="${station}">${station}</option>`;
    toSelect.innerHTML += `<option value="${station}">${station}</option>`;
    stationDropdown.innerHTML += `<option value="${station}">${station}</option>`;
  });

}

document.addEventListener("DOMContentLoaded", () => {
  // Simulate username
  const username=localStorage.getItem("employee_name");
  document.getElementById("username").textContent = username;

  // Simulate zone name
  const zone=localStorage.getItem("zone");
  document.getElementById("zoneName").textContent = zone;

  populateStations(zone);

  // Populate table dynamically
  const reports = [
    { station: "Hyderabad", report: "Signal Report", due: "2025-11-10", updated: "2025-10-28" },
    { station: "Vijayawada", report: "Maintenance Report", due: "2025-11-12", updated: "2025-10-25" },
    { station: "Tirupati", report: "Electrical Report", due: "2025-11-15", updated: "2025-10-27" },
  ];

  const tableBody = document.getElementById("tableBody");
  reports.forEach((item, index) => {
    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.station}</td>
        <td>${item.report}</td>
        <td>${item.due}</td>
        <td>${item.updated}</td>
        <td>
          <button class="action-btn btn-view"><i class="fa fa-eye"></i> View</button>
          <button class="action-btn btn-edit"><i class="fa fa-pen"></i> Edit</button>
          <button class="action-btn btn-download"><i class="fa fa-download"></i> Download</button>
        </td>
      </tr>`;
    tableBody.innerHTML += row;
  });

  // Interactivity (for example)
  document.querySelector(".btn-new").addEventListener("click", () => {
    window.location.href="../STCAS_index.html";
  });

  document.querySelector(".logout-btn").addEventListener("click",()=>{
  window.location.href="../login.html";
});



});

// Create new report with selected station
function createNewReport() {
  const selectedStation = document.getElementById("stationDropdown").value;
  const zone = localStorage.getItem("zone");

  if (selectedStation) {
    localStorage.setItem("selectedStation", selectedStation);
  }

  window.location.href = "../STCAS_create.html";
}

