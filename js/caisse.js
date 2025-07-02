// Démarrage
$(document).ready(function () {
  chargerStatistiques();
});

// Chargement des statistiques
function chargerStatistiques() {
  $.post("../../controlleur/controlleur.php", { option: 102 }, function (data) {
    if (data.success) {
      $('#countValide').text(data.validé);
      $('#countPartielle').text(data.partielle);
      $('#countAttente').text(data.en_attente);
    } else {
      alert("Erreur chargement des stats");
    }
  }, "json");
}

// Chargement des commandes
function chargerCommandes(etat) {
  $('#etat_actuel').val(etat);

  $.post("../../controlleur/controlleur.php", { option: 103, etat }, function (data) {
    if (!data.success) {
      alert("Erreur lors du chargement des commandes.");
      return;
    }

    if ($.fn.DataTable.isDataTable('#tableCommandes')) {
      $('#tableCommandes').DataTable().clear().destroy();
    }

    let colonnes = '';
    if (etat === 'validé') {
      colonnes = `<th>Numéro</th><th>Nom</th><th>Fournisseur</th><th>Date création</th><th>Date validation</th><th>Montant</th><th>Action</th>`;
    } else if (etat === 'partielle') {
      colonnes = `<th>Numéro</th><th>Nom</th><th>Fournisseur</th><th>Date création</th><th>Montant total</th><th>Montant versé</th><th>Action</th>`;
    } else {
      colonnes = `<th>Numéro</th><th>Nom</th><th>Fournisseur</th><th>Date création</th><th>Montant total</th><th>Action</th>`;
    }

    $("#headerTable").html(colonnes);

    $('#tableCommandes').DataTable({
      data: data.commandes,
      columns: data.colonnes,
      pageLength: 5,
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/fr-FR.json"
      }
    });

    $('#titreTable').text("Liste des commandes " + etat.replace("_", " "));
  }, "json");
}

// Détails d’un paiement
$(document).on("click", ".btn-details", function () {
  const commandeId = $(this).data("id");

  $.post("../../controlleur/controlleur.php", { option: 104, id: commandeId }, function (data) {
    if (!data.success) {
      alert("Erreur chargement détails : " + data.message);
      return;
    }

    $("#detailNumero").text(data.numero);
    $("#detailMontantTotal").text(data.montant_total + " F");
    $("#detailMode").text(data.mode_reglement);
    $("#detailModalite").text(data.modalite_paiement);

    if (data.tranches.length > 0) {
      let lignes = "";
      data.tranches.forEach((t, i) => {
        lignes += `<tr class="align-middle text-center">
          <td>${i + 1}</td>
          <td class="text-success fw-semibold">${t.montant} F</td>
          <td>${t.date_paiement}</td>
          <td>
            ${t.recu && t.recu !== ""
              ? `<a href="../../${t.recu}" target="_blank">
                  <img src="../../${t.recu}" alt="Reçu" class="img-fluid rounded" style="height: 45px; max-width: 60px; object-fit: cover;">
                </a>`
              : `<span class="text-muted fst-italic">—</span>`}
          </td>
        </tr>`;
      });
      $("#tbodyTranches").html(lignes);
      $("#sectionTranches").removeClass("d-none");
    } else {
      $("#sectionTranches").addClass("d-none");
      $("#tbodyTranches").empty();
    }

    $("#modalDetailsPaiement").modal("show");
  }, "json").fail(function (xhr) {
    console.error("Erreur serveur :", xhr.responseText);
    Swal.fire("Erreur", "Une erreur serveur s'est produite.", "error");
  });
});

// Paiement / continuation
$(document).on("click", ".btn-payer, .btn-continuer", function () {
  const data = {
    id: $(this).data("id"),
    montant_total: $(this).data("montant"),
    mode_reglement: $(this).data("mode"),
    modalite_paiement: $(this).data("modalite"),
    reste: $(this).data("reste") || null
  };
  ouvrirPopupPayer(data);
});

// Affichage du popup paiement
function ouvrirPopupPayer(data) {
  $('#formPaiement')[0].reset();

  $('#payer_id_commande').val(data.id);
  $('#payer_mode').val(data.mode_reglement);
  $('#payer_modalite').val(data.modalite_paiement);
  $('#payer_montant').val(numberFormat(data.montant_total) + ' F');

  $('#groupe_banque, #groupe_recu, #groupe_tranche').addClass('d-none');

  const mode = data.mode_reglement.toLowerCase();
  const modalite = data.modalite_paiement.toLowerCase();

  if (modalite.includes('tranche')) {
    $('#groupe_tranche').removeClass('d-none');
    const reste = parseFloat(data.reste) || 0;
    $('#reste_affiche').text(`Reste à payer : ${numberFormat(reste)} F`);
    $('#input_tranche').attr("max", reste);
  }

  if (mode.includes('chèque') || mode.includes('virement') || mode.includes('liquide')) {
    $('#groupe_banque').removeClass('d-none');
  }

  // ✅ Ajout recu pour TOUS les modes
  $('#groupe_recu').removeClass('d-none');

  const modal = new bootstrap.Modal(document.getElementById('modalPayer'));
  modal.show();
}

// Format numérique
function numberFormat(x) {
  return parseFloat(x).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

// Validation du paiement
$('#btnValiderPaiement').on('click', function () {
  validerPaiement();
});

function validerPaiement() {
  const form = document.getElementById("formPaiement");
  const formData = new FormData(form);

  const id_commande = $('#payer_id_commande').val();
  const mode = $('#payer_mode').val().toLowerCase();
  const modalite = $('#payer_modalite').val().toLowerCase();

  let montant = 0;

  if (modalite.includes("tranche")) {
    montant = parseFloat($('#input_tranche').val()) || 0;
    const max = parseFloat($('#input_tranche').attr('max')) || Infinity;
    if (montant > max) {
      Swal.fire("Erreur", "Montant supérieur au reste à payer", "error");
      return;
    }
  } else {
    const montantStr = $('#payer_montant').val().replace(/\s|F/g, '').replace(',', '.');
    montant = parseFloat(montantStr) || 0;
  }

  if (!id_commande || montant <= 0) {
    Swal.fire("Erreur", "Veuillez renseigner un montant valide.", "error");
    return;
  }

  // Vérifie tous les champs visibles du formulaire
  const visibleInputs = $('#formPaiement')
    .find('input, select, textarea')
    .filter(':visible');

  for (let i = 0; i < visibleInputs.length; i++) {
    const input = visibleInputs[i];
    const type = input.type;
    const name = input.name;

    if (type === 'file') {
      if (input.files.length === 0) {
        Swal.fire("Erreur", "Veuillez ajouter un fichier requis.", "error");
        return;
      }
      const file = input.files[0];
      if (!file.type.startsWith("image/")) {
        Swal.fire("Erreur", "Le fichier doit être une image.", "error");
        return;
      }
      formData.append(name, file);
    } else {
      if ($(input).val().trim() === '') {
        const label = $(input).closest('.mb-3').find('label').text() || 'Ce champ';
        Swal.fire("Erreur", `${label.trim()} est requis.`, "error");
        return;
      }
      formData.append(name, $(input).val().trim());
    }
  }

  // Champs additionnels obligatoires
  formData.append("option", 105);
  formData.append("id_commande", id_commande);
  formData.append("montant", montant);
  formData.append("mode_reglement", mode);

  fetch("../../controlleur/controlleur.php", {
    method: "POST",
    body: formData
  })
    .then(async r => {
      const txt = await r.text();
      try {
        const resp = JSON.parse(txt);
        if (resp.success) {
          Swal.fire("Succès", "Paiement enregistré avec succès !", "success").then(() => {
            const currentEtat = $("#etat_actuel").val();
            chargerCommandes(currentEtat);
            chargerStatistiques();
          });
        } else {
          Swal.fire("Erreur", resp.message || "Erreur inconnue", "error");
        }
      } catch (err) {
        console.error("Réponse serveur invalide : ", txt);
        Swal.fire("Erreur", "Une erreur technique s'est produite (réponse invalide)", "error");
      }
    })
    .catch(err => {
      console.error("Erreur fetch :", err);
      Swal.fire("Erreur", "Erreur réseau ou serveur", "error");
    });
}