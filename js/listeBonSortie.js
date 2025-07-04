document.addEventListener('DOMContentLoaded', () => {
    fetch('../../controlleur/controlleur.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ option: 68 })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Correction ici ⬇️
          if ($.fn.DataTable.isDataTable('#sales-table')) {
            $('#sales-table').DataTable().clear().destroy();
          }
  
          $('#sales-table').DataTable({
            data: data.data,
            columns: [
              { data: 'prenom' },
              { data: 'nom' },
              { data: 'structure' },
              { data: 'date_creation' },
              { data: 'nom_status_cmd' },
              {
                data: null,
                render: function (data, type, row) {
                  return getActions(row);
                }
              }
            ],
            language: {
              processing:     "Traitement en cours...",
              search:         "Rechercher&nbsp;:",
              lengthMenu:     "Afficher _MENU_ éléments",
              info:           "Affichage de l'élément _START_ à _END_ sur _TOTAL_ éléments",
              infoEmpty:      "Affichage de l'élément 0 à 0 sur 0 élément",
              infoFiltered:   "(filtré de _MAX_ éléments au total)",
              infoPostFix:    "",
              loadingRecords: "Chargement en cours...",
              zeroRecords:    "Aucun élément à afficher",
              emptyTable:     "Aucune donnée disponible dans le tableau",
              paginate: {
                  first:      "Premier",
                  previous:   "Précédent",
                  next:       "Suivant",
                  last:       "Dernier"
              },
              aria: {
                  sortAscending:  ": activer pour trier la colonne par ordre croissant",
                  sortDescending: ": activer pour trier la colonne par ordre décroissant"
              }
            },
            pageLength: 5,
            lengthMenu: [5, 10, 25, 50]
          });
        } else {
          Swal.fire('Erreur', data.message, 'error');
        }
      })
      .catch(err => Swal.fire('Erreur réseau', err.message, 'error'));
  });  
  
  function creerBS() {
    location.href = "index.php";
  }
  
  function newWindows(idBS) {
    window.open("FPDF.php?id=" + idBS, "_blank");
  }
  
  function validation_Sortie(idBon) {
    fetch('../../controlleur/controlleur.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'option': 69, 'idBon': idBon })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          Swal.fire('Succès', 'Validation effectuée', 'success')
            .then(() => location.reload());
        } else {
          Swal.fire('Erreur', data.message, 'error');
        }
      });
  }
  
  function deleteBonSortie(idBon) {
    Swal.fire({
      title: 'Supprimer ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then(result => {
      if (result.isConfirmed) {
        fetch('../../controlleur/controlleur.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ 'option': 70, 'idBon': idBon })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              Swal.fire('Supprimé!', 'Le bon a été supprimé.', 'success')
                .then(() => location.reload());
            } else {
              Swal.fire('Erreur!', data.message, 'error');
            }
          });
      }
    });
  }
  
  function getActions(bon) {
    const { idBS, expID, Etat_bon_sortie, nbr_produits } = bon;
    let html = `<div class="btn-group" role="group">`;
  
    // Afficher "Ajouter produit" seulement si état = Créé (1) ET que ce n'est pas Validé (4)
    if ((Etat_bon_sortie == 1 || nbr_produits <= 0) && Etat_bon_sortie != 4) {
      html += `<button onclick="location.href='add_product_to_bs.php?idBon=${idBS}&expID=${expID}'" 
                class="btn btn-primary btn-sm rounded me-2">
                <i class="bi bi-plus-circle"></i> Insérer produits
              </button>`;
    }
  
    // Aperçu + Voir pour états Soumis (2) ou Validé (4)
    if (Etat_bon_sortie == 2 || Etat_bon_sortie == 4) {
      html += `
        <button onclick="location.href='Consulter_BS.php?idBon=${idBS}'" 
                class="btn btn-secondary btn-sm rounded me-2">
                <i class="bi bi-eye"></i> Aperçu
        </button>
        <button onclick="newWindows(${idBS})" 
                class="btn btn-info btn-sm rounded me-2">
                <i class="bi bi-file-earmark-pdf"></i> Voir BS
        </button>`;
    }
  
    // Poursuivre ou valider pour état = 5 (en cours)
    if (Etat_bon_sortie == 5) {
      html += `
        <button onclick="validation_Sortie(${idBS})" 
                class="btn btn-success btn-sm rounded me-2">
                <i class="bi bi-check-circle"></i> Valider
        </button>
        <button onclick="location.href='poursuivre_sortie.php?idBon=${idBS}&expID=${expID}'" 
                class="btn btn-warning btn-sm rounded me-2">
                <i class="bi bi-arrow-repeat"></i> Poursuivre
        </button>`;
    }
  
    // Si aucun des états ci-dessus → bouton Valider
    if (![1, 2, 4, 5].includes(Etat_bon_sortie)) {
      html += `<button onclick="validation_Sortie(${idBS})" 
                class="btn btn-success btn-sm rounded me-2">
                <i class="bi bi-check-circle"></i> Valider
              </button>`;
    }
  
    // Supprimer uniquement si État = 1 (Créé)
    if (Etat_bon_sortie == 1) {
      html += `<button onclick="deleteBonSortie(${idBS})" 
                class="btn btn-danger btn-sm rounded">
                <i class="bi bi-trash"></i> Supprimer
              </button>`;
    }
  
    html += `</div>`;
    return html;
  }        