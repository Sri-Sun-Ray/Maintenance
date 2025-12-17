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
  return v == 1 ? "✔" : "";
}

/* ===============================
   CREATE PDF (FIXED)
================================ */

async function fetchModuleStatusFromPHP() {
  const station = localStorage.getItem("selectedStation");
  const loco = localStorage.getItem("loco");

  const response = await fetch(
    "/Maintenance/LTCAS/LTCAS_Observation/get_monthly_summary.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station, loco })
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Module status fetch failed");
  }

  return result; // full response
}


function groupByModule(observations) {
  const grouped = {};
  observations.forEach(o => {
    if (!grouped[o.__module]) {
      grouped[o.__module] = [];
    }
    grouped[o.__module].push(o);
  });
  return grouped;
}



async function createPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();

  const zone = localStorage.getItem("zone") || "-";
  const station = localStorage.getItem("selectedStation") || "-";
  const loco = localStorage.getItem("loco") || "-";

  /* =========================
     HEADER
  ========================= */
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("Monthly Maintenance Report - LTCAS", pageWidth / 2, 18, { align: "center" });

  doc.setTextColor(0, 0, 0);

  /* =========================
     ZONE TABLE
  ========================= */
  const zoneWidth = 120;
  doc.autoTable({
    startY: 35,
    head: [["Zone", "Station", "Loco"]],
    body: [[zone, station, loco]],
    theme: "grid",
    tableWidth: zoneWidth,
    margin: { left: (pageWidth - zoneWidth) / 2 },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center"
    },
    styles: { halign: "center", fontSize: 11 }
  });

  /* =========================
     MODULE STATUS TABLE
  ========================= */
  const moduleResult = await fetchModuleStatusFromPHP();

  const moduleWidth = 140;
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Module", "Status", "Open Points"]],
    body: moduleResult.modules.map(m => [m.module, m.status, m.openPoints]),
    theme: "grid",
    tableWidth: moduleWidth,
    margin: { left: (pageWidth - moduleWidth) / 2 },
    headStyles: {
      fillColor: [0, 51, 102],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center"
    },
    styles: { halign: "center", fontSize: 11 }
  });

  /* =========================
     COMPLETION CHECKBOXES
  ========================= */
  const isAllCompleted = moduleResult.modules.every(m => m.status === "Closed");

  const boxY = doc.lastAutoTable.finalY + 15;
  const boxSize = 6;
  const centerX = pageWidth / 2;

  const completedX = centerX - 45;
  const notCompletedX = centerX + 15;

  doc.rect(completedX, boxY, boxSize, boxSize);
  doc.text("Completed", completedX + boxSize + 4, boxY + 5);

  doc.rect(notCompletedX, boxY, boxSize, boxSize);
  doc.text("Not Completed", notCompletedX + boxSize + 4, boxY + 5);

  function drawTick(x, y, color) {
    doc.setDrawColor(...color);
    doc.setLineWidth(1.5);
    doc.line(x + 1, y + 3, x + 3, y + 5);
    doc.line(x + 3, y + 5, x + 6, y + 1);
    doc.setDrawColor(0, 0, 0);
  }

  if (isAllCompleted) {
    drawTick(completedX, boxY, [0, 150, 0]);
  } else {
    drawTick(notCompletedX, boxY, [200, 0, 0]);
  }

  /* =========================
     OBSERVATIONS – MODULE WISE
  ========================= */

  const grouped = groupByModule(allObservations);
  let currentY = boxY + 12;

  Object.entries(grouped).forEach(([moduleKey, rows]) => {

    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // MODULE TITLE
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(moduleKey.replace(/_/g, " ").toUpperCase(), 14, currentY);

    let lastDescription = "";

    const body = rows.map(r => {
      const showDesc = r.description !== lastDescription;
      lastDescription = r.description;

      return [
        r.sno,
        showDesc ? r.description : "",
        r.parameter,
        r.cab1 || "",
        r.cab2 || "",
        r.remarks || "",
        r.trip,
        r.ia_ib,
        r.ic,
        r.toh_aoh,
        r.ioh_poh
      ];
    });

    doc.autoTable({
      startY: currentY + 5,
      head: [[
        "S.No", "Description", "Parameter",
        "Cab1", "Cab2", "Remarks",
        "Trip", "IA/IB", "IC", "TOH/AOH", "IOH/POH"
      ]],
      body,
      theme: "grid",

      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
        halign: "center"
      },

      styles: { fontSize: 7, valign: "middle" },

      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 35 },
        2: { cellWidth: 28 },
        3: { cellWidth: 10 },
        4: { cellWidth: 10 },
        5: { cellWidth: 22 },
        6: { cellWidth: 10 },
        7: { cellWidth: 10 },
        8: { cellWidth: 8 },
        9: { cellWidth: 12 },
        10:{ cellWidth: 12 }
      },

      didDrawCell: function (data) {
        const tickCols = [6,7,8,9,10];
        if (
          data.section === "body" &&
          tickCols.includes(data.column.index) &&
          data.cell.raw == 1
        ) {
          const x = data.cell.x + data.cell.width / 2;
          const y = data.cell.y + data.cell.height / 2;
          doc.setLineWidth(1.2);
          doc.line(x - 2, y, x - 0.5, y + 2);
          doc.line(x - 0.5, y + 2, x + 2.5, y - 2);
        }
      }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  });

  window.open(doc.output("bloburl"), "_blank");
}
