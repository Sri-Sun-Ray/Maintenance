document.addEventListener("DOMContentLoaded", initObservation);

async function initObservation() {

  /* ===============================
     1️⃣ Read Zone / Station / Loco
     =============================== */
  const zone = localStorage.getItem("zone") || "-";
  const station = localStorage.getItem("selectedStation") || "-";
  const loco = localStorage.getItem("loco") || "-";

  document.getElementById("zone").textContent = zone;
  document.getElementById("station").textContent = station;
  document.getElementById("loco").textContent = loco;

  const moduleTablesContainer =
    document.getElementById("moduleTablesContainer");

  if (!moduleTablesContainer) {
    console.error("moduleTablesContainer not found in HTML");
    return;
  }

  /* ===============================
     2️⃣ Load Summary + Module Status
     =============================== */
  let summaryResponse;
  try {
    summaryResponse = await fetch(
      "/Maintenance/LTCAS/LTCAS_Observation/get_monthly_summary.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone, station, loco })
      }
    );
  } catch (err) {
    console.error("Summary fetch failed", err);
    alert("Server error while loading observation summary");
    return;
  }

  const data = await summaryResponse.json();

  if (!data.success) {
    alert("Failed to load observation summary");
    return;
  }

  /* 🔹 Summary */
  document.getElementById("totalPoints").textContent = data.totalPoints;
  document.getElementById("openPoints").textContent = data.openPoints;

  /* 🔹 Module Status Table */
  const tbody = document.getElementById("moduleStatusBody");
  tbody.innerHTML = "";

  data.modules.forEach(mod => {

    const statusText =
      mod.status === "Closed"
        ? "Closed (0)"
        : `Open (${mod.openPoints})`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${mod.module}</td>
      <td class="${mod.status === "Open" ? "status-open" : "status-closed"}">
        ${statusText}
      </td>
    `;
    tbody.appendChild(tr);
  });

  /* ===============================
     3️⃣ Load Module Tables (ORDERED)
     =============================== */
  const MODULES = [
    "locomotive",
    "brake_interface",
    "underframe",
    "locomotive_avail",
    "underframe2",
    "roof"
  ];

  moduleTablesContainer.innerHTML = "";

  for (const module of MODULES) {
    await loadModuleTable(module, station, loco);
  }
}

/* =====================================================
   Load & Render One Module Table (SEQUENTIAL & CLEAN)
   ===================================================== */
async function loadModuleTable(module, station, loco) {

  const res = await fetch(
    "/Maintenance/LTCAS/LTCAS_Observation/get_module_table_data.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, station, loco })
    }
  );

  const data = await res.json();
  if (!data.success || !data.data.length) return;

  const container = document.getElementById("moduleTablesContainer");

  // 🔹 GROUP ROWS BY DESCRIPTION
  const grouped = {};
  data.data.forEach(row => {
    if (!grouped[row.description]) {
      grouped[row.description] = [];
    }
    grouped[row.description].push(row);
  });

  let tableRowsHTML = "";

  Object.keys(grouped).forEach(description => {
    const rows = grouped[description];
    const rowspan = rows.length;

    rows.forEach((r, index) => {
      tableRowsHTML += `
        <tr>
          <td>${r.sno}</td>
          ${index === 0
            ? `<td rowspan="${rowspan}">${description}</td>`
            : ""
          }
          <td>${r.parameter}</td>
          <td>${r.cab1 || ""}</td>
          <td>${r.cab2 || ""}</td>
          <td>${r.remarks || ""}</td>
          <td>${r.trip == 1 ? "✔" : ""}</td>
          <td>${r.ia_ib == 1 ? "✔" : ""}</td>
          <td>${r.ic == 1 ? "✔" : ""}</td>
          <td>${r.toh_aoh == 1 ? "✔" : ""}</td>
          <td>${r.ioh_poh == 1 ? "✔" : ""}</td>
        </tr>
      `;
    });
  });

  const section = document.createElement("div");
  section.className = "module-section";

  section.innerHTML = `
    <h3 class="module-title">
      ${module.replace(/_/g, " ").toUpperCase()}
    </h3>

    <table class="print-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Description</th>
          <th>Parameter</th>
          <th>Cab1</th>
          <th>Cab2</th>
          <th>Remarks</th>
          <th>Trip</th>
          <th>IA/IB</th>
          <th>IC</th>
          <th>TOH/AOH</th>
          <th>IOH/POH</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHTML}
      </tbody>
    </table>
  `;

  container.appendChild(section);
}
