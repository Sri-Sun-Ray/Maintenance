const pendingReports = [
  { name: "Signal Maintenance Report", due: "2025-10-28" },
  { name: "Track Alignment Report", due: "2025-10-30" },
  { name: "Electrical Inspection", due: "2025-11-02" },
];

const completedReport = {
  name: "Bridge Safety Audit",
  date: "2025-10-25"
};

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

const zoneInput = document.getElementById('zone');
const stationSelect = document.getElementById('station');

// --- Update stations based on zone ---
function updateStations(selectedZone) {
  stationSelect.innerHTML = '<option value="">Select Station</option>'; // reset

  if (zoneStation[selectedZone]) {
    zoneStation[selectedZone].forEach(station => {
      const option = document.createElement("option");
      option.value = station;
      option.textContent = station;
      stationSelect.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.textContent = "No stations available";
    stationSelect.appendChild(option);
  }
}

// --- Fetch Zone and then Update Stations ---
fetch('STCAS_project.php')
  .then(response => response.json())
  .then(data => {
    if (data.zone) {
      zoneInput.value = data.zone;
      updateStations(data.zone); // ✅ safe now
    } else {
      zoneInput.value = "Not Found";
      updateStations("");
    }
  })
  .catch(error => {
    console.error('Error fetching zone:', error);
    zoneInput.value = "Error";
  });



stationSelect.addEventListener('change', () => {
  localStorage.setItem('station', stationSelect.value); 
  console.log('Station saved:', stationSelect.value);
});





// --- Populate Pending Reports ---
const pendingContainer = document.getElementById("pendingReports");
pendingReports.forEach(report => {
  const item = document.createElement("div");
  item.className = "report-item";
  item.innerHTML = `
    <span>${report.name}</span>
    <span><strong>Due:</strong> ${report.due}</span>
  `;
  pendingContainer.appendChild(item);
});

// --- Populate Last Completed Report ---
const completedContainer = document.getElementById("completedReport");
completedContainer.innerHTML = `
  <p><strong>Report:</strong> ${completedReport.name}</p>
  <p><strong>Date:</strong> ${completedReport.date}</p>
`;

document.querySelector('.new-btn').addEventListener('click', () => {
  const selectedStation=stationSelect.value.trim();
  if(!selectedStation)
  {
    alert("Please select the station");
  }
  else{
    alert("Navigating to create report page.");
  window.location.href = 'STCAS_index.html'; 
  }
});
