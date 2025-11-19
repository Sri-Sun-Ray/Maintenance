// =========================
// 1. STATIC STATION DATA
// =========================
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

let allReports = []; // Global for filtering

// DOM Elements
const stationInput = document.getElementById("stationSearch");
const suggestionBox = document.getElementById("suggestionBox");
const searchBtn = document.getElementById("searchBtn");
const zone = localStorage.getItem("zone");
const stationDropdown = document.getElementById("stationDropdown");


// =========================
// 2. AUTOCOMPLETE FEATURE
// =========================
stationInput.addEventListener("keyup", function () {
  const searchText = stationInput.value.toLowerCase();
  suggestionBox.innerHTML = ""; // Clear box

  if (searchText === "") {
    renderTable(allReports);  // Reset full table
    return;
  }

  const stations = zoneStation[zone] || [];
  const filtered = stations.filter(st => st.toLowerCase().includes(searchText));

  filtered.forEach(station => {
    const li = document.createElement("li");
    li.textContent = station;
    li.addEventListener("click", () => {
      stationInput.value = station;
      suggestionBox.innerHTML = ""; // hide box
    });
    suggestionBox.appendChild(li);
  });
});


// =========================
// 3. SEARCH BUTTON (FILTER)
// =========================
searchBtn.addEventListener("click", function () {
  const stationName = stationInput.value.trim();
  if (!stationName) return alert("Please enter or select a station.");
  const filteredReports = allReports.filter(report => report.station === stationName);
  renderTable(filteredReports);
});


// =========================
// 4. POPULATE DROPDOWN
// =========================
function populateStations(zone) {
  stationDropdown.innerHTML = '<option value="">Select</option>';
  const stations = zoneStation[zone] || [];
  stations.forEach(station => {
    stationDropdown.innerHTML += `<option value="${station}">${station}</option>`;
  });
}


// =========================
// 5. FETCH REPORTS (PHP)
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("username").textContent = localStorage.getItem("employee_name");
  document.getElementById("zoneName").textContent = zone;
  populateStations(zone);

  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "<tr><td colspan='6'>Loading reports...</td></tr>";

  try {
    const res = await fetch(`get_reports.php?zone=${zone}`);
    const data = await res.json();

    if (data.success && data.reports.length > 0) {
      allReports = data.reports; // Save reports
      renderTable(allReports);   // Display
    } else {
      tableBody.innerHTML = "<tr><td colspan='6'>No reports found.</td></tr>";
    }
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = "<tr><td colspan='6'>Failed to load reports.</td></tr>";
  }
});


// =========================
// 6. DUE DATE LOGIC (MONTHLY)
// =========================
function getNextDueDate(lastUpdated) {
  let date = new Date(lastUpdated);
  date.setMonth(date.getMonth() + 1);  // Next Month

  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0');
  let yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
}

function getDueStatus(dueDate) {
  const today = new Date();
  const due = new Date(dueDate.split('-').reverse().join('-'));

  if (due < today) return "overdue";      // RED
  if (due.toDateString() === today.toDateString()) return "dueToday"; // ORANGE
  return "upcoming";                      // GREEN
}


// =========================
// 7. RENDER TABLE
// =========================
function renderTable(reports) {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  if (reports.length === 0) {
    tableBody.innerHTML = "<tr><td colspan='6'>No reports found.</td></tr>";
    return;
  }

  reports.forEach((item, index) => {
    const nextDueDate = getNextDueDate(item.last_updated);
    const dueClass = getDueStatus(nextDueDate);

    const row = `
      <tr>
        <td>${index + 1}</td>
        <td>${item.station}</td>
        <td>${item.report}</td>
        <td class="${dueClass}">${nextDueDate}</td>
        <td>${item.last_updated}</td>
        <td>
          <button class="action-btn btn-view" onclick="viewReport('${item.path}')"><i class="fa fa-eye"></i> View</button>
          <button class="action-btn btn-download" onclick="downloadReport('${item.path}')"><i class="fa fa-download"></i> Download</button>
          <button class="action-btn btn-edit" data-item='${JSON.stringify(item)}' onclick="editReport(this)"><i class="fa fa-edit"></i> Edit</button>
        </td>
      </tr>`;
    tableBody.innerHTML += row;
  });
}


// =========================
// 7. VIEW / DOWNLOAD / EDIT
// =========================
function viewReport(path) {
  if (!path) return alert("File not found!");
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
  localStorage.setItem("editStation", item.station);
  localStorage.setItem("editRiu", item.riu_no);
  localStorage.setItem("editEquip", item.riu_equip_no);
  window.location.href = "../RIU_create.html";
}


// =========================
// 8. CREATE NEW REPORT
// =========================
function createNewReport() {
  const selectedStation = stationDropdown.value;
  if (selectedStation) {
    localStorage.setItem("selectedStation", selectedStation);
    window.location.href = "../STCAS_index.html";
  } else {
    confirm("Continue without selecting station?")
      ? window.location.href = "../STCAS_index.html"
      : alert("Please select a station.");
  }
}
