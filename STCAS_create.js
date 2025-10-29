const zoneInput = document.getElementById("zone");
const stationInput = document.getElementById("station");

zoneInput.value = localStorage.getItem("zone");
stationInput.value = localStorage.getItem("station");

function saveNumbers() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riu = document.getElementById("riuNo").value.trim();
  const equip = document.getElementById("equipNo").value.trim();

  if (zone && station && riu && equip) {
    // Create data object to send in the AJAX request
    const data = {
      zone: zone,
      station: station,
      riu: riu,
      equip: equip
    };

    fetch('save_data.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // Convert data to JSON
    })
    .then(response => response.json()) // Parse the JSON response
    .then(responseData => {
      if (responseData.success) {
        alert("✅ Data saved successfully!");
        document.getElementById("scheduleButtons").classList.remove("hidden");
      } else {
        alert("❌ Error saving data.");
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
// Function to save the report

 document.addEventListener("DOMContentLoaded", function() {
    // Simulate fetching logged-in username from backend or session
    const username = localStorage.getItem("loggedUser") || "Admin"; 
    document.getElementById("userName").textContent = `User: ${username}`;

    // Get current date dynamically
    const today = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-GB', options);
    document.getElementById("dateTag").textContent = `Date: ${formattedDate}`;
  });
  
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
  alert("📄 Report generated successfully!");
}

localStorage.setItem("last_report_date", new Date().toISOString());
