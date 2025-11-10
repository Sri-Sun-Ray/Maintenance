document.getElementById("logoutBtn").addEventListener("click", () => {
  alert("You have been logged out!");
});

function saveInfo() {
  const zone = document.getElementById("zone").value.trim();
  const station = document.getElementById("station").value.trim();
  const riu = document.getElementById("riu").value.trim();
  const equipNo = document.getElementById("equipNo").value.trim();

  if (!zone || !station || !riu || !equipNo) {
    alert("Please fill all fields before saving.");
    return;
  }

  alert(`Data Saved:\nZone: ${zone}\nStation: ${station}\nRIU: ${riu}\nEquipment No: ${equipNo}`);
}

function selectModule(moduleName) {
  const contentArea = document.getElementById("contentArea");
  contentArea.innerHTML = `<h2>${moduleName}</h2><p>Here you can display the checklist for ${moduleName}.</p>`;
}


