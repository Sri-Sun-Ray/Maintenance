const zoneInput = document.getElementById("zone");
const stationInput = document.getElementById("station");

zoneInput.value = localStorage.getItem("zone");
stationInput.value = localStorage.getItem("station");
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

  const zoneSelect = document.getElementById("zone");
  const stationSelect = document.getElementById("station");

  // When a zone is selected, update the station dropdown
  zoneSelect.addEventListener("change", function () {
    const selectedZone = this.value;
    stationSelect.innerHTML = '<option value="">-- Select Station --</option>'; // reset

    if (selectedZone && zoneStation[selectedZone]) {
      zoneStation[selectedZone].forEach(station => {
        const option = document.createElement("option");
        option.value = station;
        option.textContent = station;
        stationSelect.appendChild(option);
      });
    }
  });

function saveNumbers() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riu = document.getElementById("riuNo").value.trim();
  const equip = document.getElementById("equipNo").value.trim();

  if (zone && station && riu && equip) {
    // Create data object to send in the AJAX request
    const data = { zone: zone, station: station, riu: riu, equip: equip };

    const getDetailsBtn = document.querySelector('.btn-get');

    fetch('save_data.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
      if (responseData.success) {
        // store metadata in sessionStorage so observations.html can use it (no prompts)
        sessionStorage.setItem('zone', zone);
        sessionStorage.setItem('station', station);
        sessionStorage.setItem('riuNo', riu);
        sessionStorage.setItem('equipNo', equip);
        alert("✅ Data saved successfully!");
      } else {
        alert("❌ Error saving data.");
      }
      if(responseData.key==='exist') {
         getDetailsBtn.style.display = 'inline-block';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("❌ Something went wrong. Please try again.");
    });
  } else {
    alert("⚠️ Please fill all the fields (Zone, Station, RIU No, Equipment No).");
  }
}
// Function to save the report


function SaveReport() {
  // Get the Zone, Station, RIU No, and Equipment No from the form
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riuNo = document.getElementById("riuNo").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  // Check if the inputs are filled
  if (zone && station && riuNo && equipNo) {
    // Collect the observation data from the table
    const observations = [];
    const rows = document.querySelectorAll("#monthlyTable tbody tr");

    rows.forEach((row) => {
      // Check if the row is not empty
      if (row.querySelector("td")) {
        const slNo = row.querySelector("td:first-child") ? row.querySelector("td:first-child").innerText : '';
        const location = row.querySelector("td:nth-child(2)") ? row.querySelector("td:nth-child(2)").innerText : '';
        const description = row.querySelector("td:nth-child(3)") ? row.querySelector("td:nth-child(3)").innerText : '';
        const actionTakenRange = row.querySelector("td:nth-child(4)") ? row.querySelector("td:nth-child(4)").innerText : '';

        // Fetching the observation and remarks from input fields
        const observationInput = row.querySelector("td:nth-child(5) input");
        const remarksInput = row.querySelector("td:nth-child(6) input");

        const observation = observationInput ? observationInput.value : '';
        const remarks = remarksInput ? remarksInput.value : '';

        // Push to observations array only if required data is present
        if (slNo && location && description && actionTakenRange) {
          observations.push({
            sl_no: slNo,
            location: location,
            description: description,
            action_taken_range: actionTakenRange,
            observation: observation,
            remarks: remarks
          });
        }
      }
    });

    // If there are observations to save, proceed to send data
    if (observations.length > 0) {
      fetch('STCAS_observations.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zone: zone,
          station: station,
          riu_no: riuNo,
          equip_no: equipNo,
          observations: observations
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("✅ Report saved successfully!");
        } else {
          alert("❌ Error saving report.");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("❌ Something went wrong. Please try again.");
      });
    } else {
      alert("⚠️ Please fill in all observations and remarks.");
    }
  } else {
    alert("⚠️ Please fill all the fields (Zone, Station, RIU No, Equipment No).");
  }
}


// Example of a function that shows tables after save
function showDaily() {
  document.getElementById("tablesSection").classList.remove("hidden");
  document.getElementById("monthlyTable").style.display = "none";
}

function showMonthly() {
  document.getElementById("tablesSection").classList.remove("hidden");
  document.getElementById("monthlyTable").style.display = "table";
}

function generateReport() {
  // Prefer sessionStorage; if not present, fall back to current form values
  const sZone = sessionStorage.getItem('zone');
  const sStation = sessionStorage.getItem('station');
  const sRiu = sessionStorage.getItem('riuNo');
  const sEquip = sessionStorage.getItem('equipNo');

  const zone = sZone || document.getElementById("zone").value.trim();
  const station = sStation || document.getElementById("station").value.trim();
  const riuNo = sRiu || document.getElementById("riuNo").value.trim();
  const equipNo = sEquip || document.getElementById("equipNo").value.trim();

  if (!zone || !station || !riuNo || !equipNo) {
    alert("⚠️ RIU metadata missing. Please Save the RIU details first.");
    return;
  }

  // ensure session has values
  sessionStorage.setItem('zone', zone);
  sessionStorage.setItem('station', station);
  sessionStorage.setItem('riuNo', riuNo);
  sessionStorage.setItem('equipNo', equipNo);

  // navigate to observations page which will read from sessionStorage
  window.location.href = 'observations.html';
}

function getDetails() {
  // Get Zone, Station, RIU No, and Equipment No
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riuNo = document.getElementById("riuNo").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  if (zone && station && riuNo && equipNo) {
    fetch('get_observations.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zone: zone,
        station: station,
        riu_no: riuNo,
        equip_no: equipNo
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const tbody = document.querySelector("#monthlyTable tbody");
        tbody.innerHTML = ""; // Clear existing rows

        data.observations.forEach((obs, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${obs.sl_no}</td>
            <td>${obs.location}</td>
            <td>${obs.description}</td>
            <td>${obs.action_taken_range}</td>
            <td><input type="text" value="${obs.observation || ''}" /></td>
            <td><input type="text" value="${obs.remarks || ''}" /></td>
          `;
          tbody.appendChild(row);
        });

        alert("✅ Details loaded successfully!");
      } else {
        alert("⚠️ No data found for this RIU entry.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("❌ Failed to load details.");
    });
  } else {
    alert("⚠️ Please fill all the fields (Zone, Station, RIU No, Equipment No).");
  }
}
function logout(){
  window.location.href="login.html";
}

