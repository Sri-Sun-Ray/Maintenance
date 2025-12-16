document.addEventListener("DOMContentLoaded", initObservation);

/* ===============================
   GLOBAL STORES (for PDF)
================================ */
let allObservations = [];
let moduleStatusMap = {};

/* ===============================
   INIT
================================ */
async function initObservation() {

  /* 1️⃣ Read Zone / Station / Loco */
  const zone = localStorage.getItem("zone") || "-";
  const station = localStorage.getItem("selectedStation") || "-";
  const loco = localStorage.getItem("loco") || "-";

  document.getElementById("zone").textContent = zone;
  document.getElementById("station").textContent = station;
  document.getElementById("loco").textContent = loco;

  /* 2️⃣ Load Summary + Module Status */
  const summaryResponse = await fetch(
    "/Maintenance/LTCAS/LTCAS_Observation/get_monthly_summary.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone, station, loco })
    }
  );

  const summaryData = await summaryResponse.json();
  if (!summaryData.success) return;

  document.getElementById("totalPoints").textContent = summaryData.totalPoints;
  document.getElementById("openPoints").textContent = summaryData.openPoints;

  const tbody = document.getElementById("moduleStatusBody");
  tbody.innerHTML = "";

  summaryData.modules.forEach(mod => {
    const statusText = mod.status === "Closed" ? "Closed" : "Not Completed";
    moduleStatusMap[mod.module] = statusText;

    tbody.innerHTML += `
      <tr>
        <td>${mod.module}</td>
        <td class="${mod.status === "Open" ? "status-open" : "status-closed"}">
          ${statusText}
        </td>
      </tr>`;
  });

  /* 3️⃣ Load Module Tables */
  const MODULES = [
    "locomotive",
    "brake_interface",
    "underframe",
    "locomotive_avail",
    "underframe2",
    "roof"
  ];

  document.getElementById("moduleTablesContainer").innerHTML = "";

  for (const module of MODULES) {
    await loadModuleTable(module, station, loco);
  }
}

/* ===============================
   LOAD EACH MODULE
================================ */
async function loadModuleTable(module, station, loco) {

  const res = await fetch(
    "/Maintenance/LTCAS/LTCAS_Observation/get_module_table_data.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module, station, loco })
    }
  );

  const result = await res.json();
  if (!result.success || !result.data.length) return;

  result.data.forEach(r => {
    r.__module = module;
    allObservations.push(r);
  });

  /* UI Rendering (unchanged) */
  const container = document.getElementById("moduleTablesContainer");

  const grouped = {};
  result.data.forEach(row => {
    if (!grouped[row.description]) grouped[row.description] = [];
    grouped[row.description].push(row);
  });

  let tableRowsHTML = "";

  Object.entries(grouped).forEach(([desc, rows]) => {
    rows.forEach((r, i) => {
      tableRowsHTML += `
        <tr>
          <td>${r.sno}</td>
          ${i === 0 ? `<td rowspan="${rows.length}">${desc}</td>` : ""}
          <td>${r.parameter}</td>
          <td>${r.cab1 || ""}</td>
          <td>${r.cab2 || ""}</td>
          <td>${r.remarks || ""}</td>
          <td>${r.trip == 1 ? "✔" : ""}</td>
          <td>${r.ia_ib == 1 ? "✔" : ""}</td>
          <td>${r.ic == 1 ? "✔" : ""}</td>
          <td>${r.toh_aoh == 1 ? "✔" : ""}</td>
          <td>${r.ioh_poh == 1 ? "✔" : ""}</td>
        </tr>`;
    });
  });

  const section = document.createElement("div");
  section.className = "module-section";
  section.innerHTML = `
    <h3 class="module-title">${module.replace(/_/g, " ").toUpperCase()}</h3>
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
      <tbody>${tableRowsHTML}</tbody>
    </table>
  `;
  container.appendChild(section);
}

/* ===============================
   PDF HELPERS
================================ */
function tick(v) {
  return v == 1 ? "✓" : "";
}

/* ===============================
   CREATE PDF (FIXED)
================================ */
function createPDF() {

  const pdfEl = document.getElementById("ltcas-pdf");

  /* Fill PDF data FIRST */
  document.getElementById("pdf-loco").textContent =
    localStorage.getItem("loco") || "-";
  document.getElementById("pdf-zone").textContent =
    localStorage.getItem("zone") || "-";
  document.getElementById("pdf-station").textContent =
    localStorage.getItem("selectedStation") || "-";
  document.getElementById("pdf-date").textContent =
    new Date().toLocaleDateString();
  document.getElementById("pdf-generated").textContent =
    new Date().toLocaleString();

  /* TEMPORARILY SHOW PDF CONTENT */
  pdfEl.style.display = "block";

  html2pdf()
    .set({
      margin: 10,
      filename: `LTCAS_Maintenance_${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        windowWidth: pdfEl.scrollWidth
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "landscape"
      },
      pagebreak: {
        mode: ["avoid-all", "css"]
      }
    })
    .from(pdfEl)
    .save()
    .then(() => {
      /* HIDE IT AGAIN */
      pdfEl.style.display = "none";
    });
}
