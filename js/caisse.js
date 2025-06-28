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
  
  // Chargement des commandes par état
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
  
      // injection des données
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
          lignes += `<tr>
            <td>${i + 1}</td>
            <td>${t.montant} F</td>
            <td>${t.date_paiement}</td>
          </tr>`;
        });
        $("#tbodyTranches").html(lignes);
        $("#sectionTranches").removeClass("d-none");
      } else {
        $("#sectionTranches").addClass("d-none");
        $("#tbodyTranches").empty();
      }
  
      $("#modalDetailsPaiement").modal("show");
    }, "json");
  });
  
  // Paiement ou continuation
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
  
  // Ouverture du modal
  function ouvrirPopupPayer(data) {
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
      
      if (mode.includes('chèque') || mode.includes('virement')) {
        $('#groupe_banque').removeClass('d-none');
      }
      
      if (mode.includes('wave') || mode.includes('om') || mode.includes('orange')) {
        $('#groupe_recu').removeClass('d-none');
      }      
  
    const modal = new bootstrap.Modal(document.getElementById('modalPayer'));
    modal.show();
  }
  
  // Format français
  function numberFormat(x) {
    return parseFloat(x).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
  
  // Validation du paiement
  $('#btnValiderPaiement').on('click', function () {
    validerPaiement();
  });
  
  function validerPaiement() {
    const id_commande = $('#payer_id_commande').val();
    const montant = parseFloat($('#input_tranche').val()) || 0;
    const banque = $('#input_banque').val();
    const recu = $('#input_recu').val();
  
    const max = parseFloat($('#input_tranche').attr('max')) || Infinity;
    if (montant > max) {
      Swal.fire("Erreur", "Montant supérieur au reste à payer", "error");
      return;
    }
  
    if (!id_commande || montant <= 0) {
      Swal.fire("Erreur", "Veuillez renseigner un montant valide.", "error");
      return;
    }
  
    const data = new URLSearchParams({
      option: 105,
      id_commande,
      montant,
      banque,
      recu
    });
  
    fetch("../../controlleur/controlleur.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: data.toString()
    })
      .then(r => r.json())
      .then(resp => {
        if (resp.success) {
          Swal.fire("Succès", "Paiement enregistré avec succès !", "success").then(() => {
            const currentEtat = $("#etat_actuel").val();
            chargerCommandes(currentEtat);
            chargerStatistiques(); // mise à jour
          });
        } else {
          Swal.fire("Erreur", resp.message || "Échec du paiement", "error");
        }
      })
      .catch(err => {
        console.error("Erreur fetch :", err);
        Swal.fire("Erreur", "Une erreur s'est produite.", "error");
      });
  }  