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

  fromSelect.innerHTML = `<option value="">Select</option>`;
  toSelect.innerHTML = `<option value="">Select</option>`;
  stationDropdown.innerHTML = `<option value="">Select</option>`;

  stations.forEach(station=> {
    fromSelect.innerHTML += `<option value="${station}">${station}</option>`;
    toSelect.innerHTML += `<option value="${station}">${station}</option>`;
    stationDropdown.innerHTML += `<option value="${station}">${station}</option>`;
  });

}

document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("employee_name");
  document.getElementById("username").textContent = username;

  const zone = localStorage.getItem("zone");
  document.getElementById("zoneName").textContent = zone;

  populateStations(zone);

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "<tr><td colspan='6'>Loading reports...</td></tr>";

  try {
    const zone = localStorage.getItem("zone");
    const res = await fetch(`get_reports.php?zone=${zone}`);
    const data = await res.json();

    tableBody.innerHTML = "";

    if (data.success && data.reports.length > 0) {
      data.reports.forEach((item, index) => {
        const row = `
          <tr>
            <td>${index + 1}</td>
            <td>${item.station}</td>
            <td>${item.report}</td>
            <td>${item.due_date}</td>
            <td>${item.last_updated}</td>
            <td>
              <button class="action-btn btn-view" onclick="viewReport('${item.path}')">
                <i class="fa fa-eye"></i> View
              </button>
              <button class="action-btn btn-download" onclick="downloadReport('${item.path}')">
                <i class="fa fa-download"></i> Download
              </button>
              <!-- Edit Button -->
              <button class="action-btn btn-edit" data-item='${JSON.stringify(item)}' onclick="editReport(this)">
                <i class="fa fa-edit"></i> Edit
              </button>
            </td>
          </tr>`;
        tableBody.innerHTML += row;
      });
    } else {
      tableBody.innerHTML = "<tr><td colspan='6'>No reports found.</td></tr>";
    }
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='6'>Failed to load reports.</td></tr>";
  }
});


function viewReport(path) {
  if (!path) {
    alert("File not found!");
    return;
  }
  window.open(path, "_blank");
}


function downloadReport(path) {
  const link = document.createElement("a");
  link.href = path;
  link.download = path.split("/").pop();
  link.click();
}

function editReport(button) {
  const item = JSON.parse(button.getAttribute('data-item'));
  localStorage.setItem("editStation",item.station);
  localStorage.setItem("editRiu",item.riu_no);
  localStorage.setItem("editEquip",item.riu_equip_no);

  window.location.href="../RIU_create.html";
  
};


// Create new report with selected station
function createNewReport() {
  const selectedStation = document.getElementById("stationDropdown").value;
  const zone = localStorage.getItem("zone");

  if (selectedStation) {
    localStorage.setItem("selectedStation", selectedStation);
    window.location.href = "../STCAS_index.html";
  }

  else{
  if (confirm("Do you want to continue without selecting Station?")) {
    window.location.href = "../STCAS_index.html";
  } else {
      alert("Please select the station.")
  }
}

}

