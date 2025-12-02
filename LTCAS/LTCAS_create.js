function convertToFullTemplate(moduleId) {
  const existingTableBody = document.getElementById(moduleId + 'TableBody');
  const newHtml = `
    <table class="module-table-full"> 
      <thead>...</thead>
      <tbody id="${moduleId}FullTableBody"></tbody>
    </table>
  `;
  
  document.getElementById(moduleId).innerHTML = newHtml;
}

function showModuleTab(moduleId) {
    // Hide all module containers
    document.querySelectorAll(".module-container")
      .forEach(div => div.style.display = "none");

    // Show selected module
    document.getElementById(moduleId).style.display = "block";

    // Update active tab
    document.querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));

    const activeBtn = [...document.querySelectorAll(".tab-btn")]
      .find(btn => btn.getAttribute("onclick").includes(moduleId));

    if (activeBtn) activeBtn.classList.add("active");
}
