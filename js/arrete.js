document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("dateArrete");
  const modeInput = document.getElementById("modePaiement");

  chargerArrete(); // Initial

  dateInput.addEventListener("change", chargerArrete);
  modeInput.addEventListener("change", chargerArrete);

  document.getElementById("btnExportPDF").addEventListener("click", () => {
    window.print();
  });
});

function chargerArrete() {
  const date = document.getElementById("dateArrete").value;
  const mode = document.getElementById("modePaiement").value;

  if (!date || !mode) {
    Swal.fire("Erreur", "Veuillez sélectionner une date et un mode de paiement", "warning");
    return;
  }

  fetch("../../controlleur/controlleur.php", {
    method: "POST",
    body: new URLSearchParams({ option: 106, date, mode }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (!data.success) {
        Swal.fire("Erreur", data.message || "Erreur inconnue", "error");
        return;
      }

      const { caisse, paiements } = data;
      const tbody = document.getElementById("tbodyPaiements");
      tbody.innerHTML = "";

      const total = parseFloat(caisse?.montant_alloue ?? 0);
      const utilise = parseFloat(caisse?.montant_utilise ?? 0);
      const reste = total - utilise;
      const nbPaiements = parseInt(caisse?.nombre_paiements ?? 0);

      // Affiche les 3 cartes
      document.getElementById("infosCaisse").classList.remove("d-none");

      if (!isNaN(total) && total > 0) {
        document.getElementById("montantAlloue").textContent = total.toLocaleString("fr-FR") + " F";
        document.getElementById("soldeRestant").textContent = reste.toLocaleString("fr-FR") + " F";
      } else {
        document.getElementById("montantAlloue").textContent = "—";
        document.getElementById("soldeRestant").textContent = "—";
      }

      document.getElementById("montantUtilise").innerHTML =
        `${utilise.toLocaleString("fr-FR")} F<br><small class="text-muted">${paiements.length} paiement${paiements.length > 1 ? 's' : ''}</small>`;

      if (paiements.length > 0) {
        paiements.forEach((p, i) => {
          const ligne = document.createElement("tr");
          ligne.innerHTML = `
            <td>${i + 1}</td>
            <td>${p.numero_commande}</td>
            <td>${parseFloat(p.montant).toLocaleString("fr-FR")} F</td>
            <td>${p.banque || "-"}</td>
            <td>${p.date_paiement}</td>
            <td class="text-center">
              ${p.recu
                ? `<a href='../../${p.recu}' target='_blank'><img src='../../${p.recu}' class='img-thumbnail' style='max-height:50px;'></a>`
                : "-"}
            </td>`;
          tbody.appendChild(ligne);
        });
        document.getElementById("tablePaiements").classList.remove("d-none");
      } else {
        document.getElementById("tablePaiements").classList.add("d-none");
        Swal.fire("Info", "Aucun paiement enregistré pour ce mode", "info");
      }
    })
    .catch((err) => {
      console.error(err);
      Swal.fire("Erreur", "Erreur réseau ou serveur", "error");
    });
}