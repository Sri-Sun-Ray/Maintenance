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
  /* 0️⃣ Clear store (avoid duplicate appends) */
  allObservations = [];
  moduleStatusMap = {};

  /* 1️⃣ Priority: sessionStorage (set by prepareReportSession) -> fallback to localStorage */
  const zone    = sessionStorage.getItem("zone") || localStorage.getItem("zone") || "-";
  const station = sessionStorage.getItem("station") || localStorage.getItem("selectedStation") || localStorage.getItem("station") || "-";
  const loco    = sessionStorage.getItem("loco") || localStorage.getItem("loco") || "-";

  document.getElementById("zone").textContent = zone;
  document.getElementById("station").textContent = station;
  document.getElementById("loco").textContent = loco;

  // 1.5️⃣ Disable "Create PDF" if station is missing
  if (!station || station === "-") {
    const pdfBtn = document.getElementById("createPdfBtn");
    if (pdfBtn) {
      pdfBtn.disabled = true;
      pdfBtn.title = "Station name is required to generate a PDF.";
      pdfBtn.style.opacity = "0.5";
      pdfBtn.style.cursor = "not-allowed";
    }
  }

  /* 2️⃣ Load Summary + Module Status */
  const summaryResponse = await fetch(
    "get_monthly_summary.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zone, station, loco })
    }
  );

  const summaryData = await summaryResponse.json();
  if (!summaryData.success) {
    alert("Could not load summary: " + summaryData.message);
    return;
  }

  const totalClosed = summaryData.modules.reduce((acc, m) => acc + (m.closedPoints || 0), 0);

  document.getElementById("totalPoints").textContent = summaryData.totalPoints;
  document.getElementById("closedPoints").textContent = totalClosed;
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
    "get_module_table_data.php",
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
          <td>${buildImageCellHtml(r.image_paths || r.image_path)}</td>
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
          <th>Images</th>
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

function parseImagePaths(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (err) {
    // ignore
  }
  return [String(value)].filter(Boolean);
}

function buildImageCellHtml(paths) {
  const imagePaths = parseImagePaths(paths);
  if (!imagePaths.length) return "—";
  return imagePaths.map(src => `<img src="${src}" class="report-image-thumb" alt="Image">`).join("");
}

function hasImageData(row) {
  return parseImagePaths(row.image_paths || row.image_path).length > 0;
}

function imageTypeFromDataUrl(dataUrl) {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'PNG';
}

async function loadImageAsDataURL(src) {
  if (!src) return null;
  if (src.startsWith('data:image/')) {
    return src;
  }

  const url = src.startsWith('http') ? src : new URL(src, window.location.origin).href;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load image for PDF', src, err);
    return null;
  }
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
  const station = sessionStorage.getItem("station") || localStorage.getItem("selectedStation") || localStorage.getItem("station");
  const loco = sessionStorage.getItem("loco") || localStorage.getItem("loco");

  const response = await fetch(
    "get_monthly_summary.php",
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
  try {
    if (!window.jspdf) {
      alert("jsPDF library not loaded. Please check your internet connection.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const zone    = sessionStorage.getItem("zone") || localStorage.getItem("zone") || "-";
    const station = sessionStorage.getItem("station") || localStorage.getItem("selectedStation") || localStorage.getItem("station") || "-";
    const loco    = sessionStorage.getItem("loco") || localStorage.getItem("loco") || "-";
    const employeeName = sessionStorage.getItem("employee_name") || localStorage.getItem("employee_name") || "-";

    /* =========================
       HEADER & LOGO
    ========================= */
    doc.setFillColor(0, 51, 102);
    doc.rect(0, 0, pageWidth, 30, "F");

    try {
      const logoUrl = await loadImageAsDataURL("../hbl logo.jpg");
      if (logoUrl) {
        doc.addImage(logoUrl, 'JPEG', 10, 5, 30, 20);
      }
    } catch (e) {
      console.warn("Logo failed to load", e);
    }

    const moduleResult = await fetchModuleStatusFromPHP();

    doc.setTextColor(255, 255, 255);
    // Title positioned next to logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Monthly Maintenance Report - LTCAS", 45, 18);

    // Info stacked on the right
    doc.setFontSize(10);
    doc.text(`Employee: ${employeeName}`, pageWidth - 10, 15, { align: "right" });

    doc.setTextColor(0, 0, 0);

    /* =========================
       LTCAS BASIC DETAILS
    ========================= */
    doc.autoTable({
      startY: 35,
      head: [["Zone", "Station", "Loco Number", "Created At", "Updated At"]],
      body: [[
        zone, 
        station, 
        loco,
        moduleResult.reportCreated || "-",
        moduleResult.reportUpdated || "-"
      ]],
      theme: "grid",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      styles: { halign: "center", fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 249] }
    });

    /* =========================
       PERFORMANCE SUMMARY TABLE
    ========================= */
    const totalClosed = moduleResult.modules.reduce((acc, m) => acc + (m.closedPoints || 0), 0);
    const overallTotal = moduleResult.totalPoints;
    const overallOpen = moduleResult.openPoints;

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Total Points", "Closed Points", "Open Points"]],
      body: [[overallTotal, totalClosed, overallOpen]],
      theme: "grid",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      styles: { halign: "center", fontSize: 11, fontStyle: "bold" },
      didDrawCell: function(data) {
        if (data.section === 'body') {
          if (data.column.index === 1) doc.setTextColor(39, 174, 96); // Bold Green for Closed
          if (data.column.index === 2) doc.setTextColor(231, 76, 60); // Bold Red for Open
        }
      }
    });

    /* =========================
       DETAILED MODULE STATUS
    ========================= */
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Module Name", "Status", "Pending"]],
      body: moduleResult.modules.map(m => [
        m.module, 
        m.status, 
        m.openPoints
      ]),
      theme: "grid",
      headStyles: { 
        fillColor: [0, 51, 102], 
        textColor: [255, 255, 255], 
        fontSize: 7.5, 
        halign: 'center', 
        fontStyle: "bold",
        lineWidth: 0.2,
        lineColor: [0, 0, 0],
        cellPadding: 0.8
      },
      styles: { halign: "center", fontSize: 10 },
      alternateRowStyles: { fillColor: [245, 247, 249] }
    });

    /* =========================
       COMPLETION STATUS TABLE
    ========================= */
    const isAllCompleted = moduleResult.modules.every(m => m.status === "Closed");
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Completion Status", "Completed", "Not Completed"]],
      body: [
        ["Inspection Status", "", ""]
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      columnStyles: {
        0: { halign: 'left', fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' }
      },
      styles: { halign: "center", fontSize: 11, minCellHeight: 12 },
      alternateRowStyles: { fillColor: [245, 247, 249] },
      didDrawCell: function(data) {
        if (data.section === 'body') {
          const x = data.cell.x + data.cell.width / 2 - 3;
          const y = data.cell.y + data.cell.height / 2 - 3;

          if (data.column.index === 1 && isAllCompleted) {
            drawTick(x, y, [0, 150, 0]);
          } else if (data.column.index === 2 && !isAllCompleted) {
            drawWrongMark(x, y, [200, 0, 0]);
          }
        }
      }
    });



    function drawTick(x, y, color) {
      doc.setDrawColor(...color);
      doc.setLineWidth(1.5);
      doc.line(x + 1, y + 3, x + 3, y + 5);
      doc.line(x + 3, y + 5, x + 6, y + 1);
      doc.setDrawColor(0, 0, 0);
    }

    function drawWrongMark(x, y, color) {
      doc.setDrawColor(...color);
      doc.setLineWidth(1.5);
      doc.line(x + 1, y + 1, x + 5, y + 5);
      doc.line(x + 5, y + 1, x + 1, y + 5);
      doc.setDrawColor(0, 0, 0);
    }

    /* =========================
       OBSERVATIONS – MODULE WISE
    ========================= */

    const grouped = groupByModule(allObservations);
    
    if (Object.keys(grouped).length === 0) {
      const proceed = confirm("No observation data found for this loco/station. Do you want to generate a summary-only report?");
      if (!proceed) return;
    }

    let currentY = doc.lastAutoTable.finalY + 12;

    for (const [moduleKey, rows] of Object.entries(grouped)) {

      // Ensure Title and Table stay together - check for space (approx 40mm)
      if (currentY + 40 > 280) {
        doc.addPage();
        currentY = 20;
      }

      // MODULE TITLE
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(moduleKey.replace(/_/g, " ").toUpperCase(), 14, currentY);

      const body = rows.map((r, idx) => {
        const rowId = `${moduleKey}__${idx}`;
        return {
          sno: r.sno,
          description: r.description,
          parameter: r.parameter,
          cab1: r.cab1 || "",
          cab2: r.cab2 || "",
          remarks: r.remarks || "",
          images: "",
          trip: "",
          ia_ib: "",
          ic: "",
          toh_aoh: "",
          ioh_poh: "",
          rowId
        };
      });

      // Store raw values for didDrawCell to access
      const rawValues = rows.map((r, idx) => ({
        rowId: `${moduleKey}__${idx}`,
        imagePaths: Array.from(new Set(parseImagePaths(r.image_paths || r.image_path))),
        trip: r.trip,
        ia_ib: r.ia_ib,
        ic: r.ic,
        toh_aoh: r.toh_aoh,
        ioh_poh: r.ioh_poh
      }));

      const imageDataUrls = await Promise.all(rawValues.map(async raw => {
        if (!raw.imagePaths.length) return [];
        const uniquePaths = raw.imagePaths.filter((path, idx, arr) => path && arr.indexOf(path) === idx);
        const urls = await Promise.all(
          uniquePaths.map(path => loadImageAsDataURL(path))
        );
        return urls.filter(Boolean).filter((url, idx, arr) => arr.indexOf(url) === idx);
      }));

      imageDataUrls.forEach((dataUrls, index) => {
        if (rawValues[index]) {
          rawValues[index].imageDataArray = dataUrls;
          // Also store back into allObservations for later use
          rows[index].imageDataArray = dataUrls;
        }
      });

      function getRawRow(data) {
        const rowRaw = data.row.raw || {};
        const hiddenId = rowRaw.rowId;
        if (hiddenId) {
          return rawValues.find(rv => rv.rowId === hiddenId) || null;
        }

        const index = Number(data.row.index);
        if (!Number.isNaN(index) && rawValues[index]) {
          return rawValues[index];
        }

        return null;
      }

      const drawnImageRows = new Set();

      doc.autoTable({
        startY: currentY + 5,
        columns: [
          { header: "S.No", dataKey: "sno" },
          { header: "Description", dataKey: "description" },
          { header: "Parameter", dataKey: "parameter" },
          { header: "Cab1", dataKey: "cab1" },
          { header: "Cab2", dataKey: "cab2" },
          { header: "Remarks", dataKey: "remarks" },
          { header: "Images", dataKey: "images" },
          { header: "Trip", dataKey: "trip" },
          { header: "IA/IB", dataKey: "ia_ib" },
          { header: "IC", dataKey: "ic" },
          { header: "TOH/AOH", dataKey: "toh_aoh" },
          { header: "IOH/POH", dataKey: "ioh_poh" }
        ],
        body,
        theme: "grid",
        tableWidth: pageWidth - 20,
        margin: { left: 10, right: 10 },

        headStyles: {
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.5,
          halign: "center",
          valign: "middle",
          lineColor: [0, 0, 0],
          lineWidth: 1,
          minCellHeight: 8,
          cellPadding: 0.8
        },

        styles: { 
          fontSize: 8.5, 
          fontStyle: "bold",
          valign: "middle", 
          cellPadding: 2, 
          minCellHeight: 10,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },

        rowPageBreak: 'avoid',

        columnStyles: {
          0: { cellWidth: 14 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 18 },
          4: { cellWidth: 18 },
          5: { cellWidth: 24 },
          6: { cellWidth: 28 },
          7: { cellWidth: 8.8 },
          8: { cellWidth: 8.8 },
          9: { cellWidth: 8.8 },
          10:{ cellWidth: 8.8 },
          11:{ cellWidth: 8.8 }
        },
        alternateRowStyles: { fillColor: [245, 247, 249] },

        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 6) {
            const r = getRawRow(data);
            if (r && r.imageDataArray && r.imageDataArray.length > 0) {
              const padding = 2;
              const imgHeight = 25;
              const requiredHeight = (imgHeight * r.imageDataArray.length) + (padding * (r.imageDataArray.length + 1));
              if (data.row.height < requiredHeight) {
                data.row.height = requiredHeight;
              }
            }
          }
        },

        didDrawCell: function(data) {
          const tickCols = [7, 8, 9, 10, 11];
          const imageCol = 6;
          if (data.section === "body") {
            const rawRow = getRawRow(data);
            if (!rawRow) return;

            if (data.column.index === imageCol) {
              if (!rawRow.rowId || drawnImageRows.has(rawRow.rowId)) {
                return;
              }

              const imageDataArray = rawRow.imageDataArray || [];
              if (imageDataArray.length > 0) {
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;
                const padding = 2;
                const imgWidth = cellWidth - padding * 2;
                const imgHeight = 25;
                const totalImgStackHeight = (imgHeight * imageDataArray.length) + (padding * (imageDataArray.length - 1));

                let x = data.cell.x + padding;
                // Center the entire stack vertically in the cell
                let y = data.cell.y + (cellHeight - totalImgStackHeight) / 2;

                imageDataArray.forEach((imgData, idx) => {
                  try {
                    const type = imageTypeFromDataUrl(imgData);
                    doc.addImage(imgData, type, x, y, imgWidth, imgHeight);
                  } catch (err) {
                    console.warn(`Unable to draw image ${idx}`, err);
                  }

                  y += imgHeight + padding;
                });

                drawnImageRows.add(rawRow.rowId);
              }
            }

            if (tickCols.includes(data.column.index)) {
              let cellValue = false;
              if (data.column.index === 7) cellValue = rawRow.trip;
              else if (data.column.index === 8) cellValue = rawRow.ia_ib;
              else if (data.column.index === 9) cellValue = rawRow.ic;
              else if (data.column.index === 10) cellValue = rawRow.toh_aoh;
              else if (data.column.index === 11) cellValue = rawRow.ioh_poh;

              if (cellValue == 1 || cellValue === true) {
                const cellWidth = data.cell.width;
                const cellHeight = data.cell.height;
                const cellX = data.cell.x;
                const cellY = data.cell.y;

                const centerX = cellX + cellWidth / 2;
                const centerY = cellY + cellHeight / 2;

                doc.setLineWidth(0.8);
                doc.setDrawColor(0, 0, 0);
                doc.line(centerX - 2.5, centerY - 0.5, centerX - 0.5, centerY + 1.5);
                doc.line(centerX - 0.5, centerY + 1.5, centerX + 2.5, centerY - 1.5);
              }
            }
          }
        }
      });

      currentY = doc.lastAutoTable.finalY + 20;
    }

    /* =========================
       SYSTEM GENERATED NOTE
    ========================= */
    if (currentY > 260) doc.addPage();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("NOTE: This is a system-generated report. Physical signatures are not required.", 14, doc.lastAutoTable.finalY + 15, { maxWidth: pageWidth - 28 });

    /* =========================
       FOOTER (PAGE NUMBERS & BRANDING)
    ========================= */
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 200);
        doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
        
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    // Save report to server and open saved PDF
    const dataUri = doc.output("datauristring") || doc.output("dataurlstring") || doc.output("datauri");
    if (!dataUri || typeof dataUri !== 'string' || !dataUri.includes(',')) {
      throw new Error('Failed to generate PDF data URI');
    }
    const base64Data = dataUri.split(",")[1] || "";
    if (!base64Data) {
      throw new Error('Generated PDF is empty');
    }
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-'); // HH-mm-ss
    const nowTs = `${dateStr}_${timeStr}`;
    const statusText = moduleResult.modules.every(m => m.status === "Closed") ? "Completed" : "NotCompleted";
    const reportName = `LTCAS_${zone}_${station}_${loco}_${statusText}_${nowTs}.pdf`;
    const payload = {
      zone,
      station,
      loco,
      pdf_base64: base64Data,
      report_name: reportName
    };

    const uploadResponse = await fetch("../generate_pdf.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const uploadJson = await uploadResponse.json();
    if (!uploadJson.success) {
      throw new Error(uploadJson.message || "Failed to save PDF report");
    }

    const reportUrl = `../${uploadJson.file_path}`;
    const viewBtn = document.getElementById("viewReportsBtn");
    if (viewBtn) {
      viewBtn.style.display = "inline-block";
      viewBtn.disabled = false;
      viewBtn.innerText = 'View Reports';
    }

    alert("PDF created and saved to reports.");
    // window.open(reportUrl, "_blank"); // Removed auto-open
  } catch (err) {
    console.error("createPDF error:", err);
    alert("Could not generate report: " + err.message);
  }
}
