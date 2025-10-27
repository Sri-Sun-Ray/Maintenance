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

// Example of a function that shows tables after save
function showDaily() {
  document.getElementById("tablesSection").classList.remove("hidden");
  document.getElementById("dailyTable").style.display = "table";
  document.getElementById("monthlyTable").style.display = "none";
}

function showMonthly() {
  document.getElementById("tablesSection").classList.remove("hidden");
  document.getElementById("dailyTable").style.display = "none";
  document.getElementById("monthlyTable").style.display = "table";
}

function generateReport() {
  alert("📄 Report generated successfully!");
}

localStorage.setItem("last_report_date", new Date().toISOString());
