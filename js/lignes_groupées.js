function showAlert(type, message) {
    Swal.fire({
      icon: type,
      title: message,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  $(document).ready(function () {
    let lignesPourPreforma = []; // utilisé uniquement pour export PDF
    let lignesPourCommande = []; // utilisé pour les commandes
  
    let table;

    if ($.fn.DataTable.isDataTable('#tableLignes')) {
    table = $('#tableLignes').DataTable();
    } else {
    table = $('#tableLignes').DataTable({
        language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.1/i18n/fr-FR.json"
        },
        columnDefs: [{ orderable: false, targets: 0 }]
    });
    }
  
    $('#tableLignes_filter').appendTo('#datatable-search-wrapper');
    $('#tableLignes_filter label').addClass('w-100 d-flex justify-content-center');
    $('#tableLignes_filter input').addClass('form-control w-50 mx-2');
  
    function chargerLignes() {
        $.post("../../controlleur/controlleur.php", { option: 108 }, function (data) {
          console.log("📦 Données reçues :", data); // ➤ AJOUTE CECI
      
          table.clear();
          lignesPourPreforma = [];
          lignesPourCommande = [];      
      
          if (Array.isArray(data)) {
            data.forEach(item => {
              const estEpuisé = parseFloat(item.quantite_restante) <= 0;
      
              const checkbox = estEpuisé
                ? `<input type="checkbox" class="check-ligne" disabled title="Quantité restante nulle">`
                : `<input type="checkbox" class="check-ligne"
                         data-id="${item.id}"
                         data-id-lignesbudget="${item.id_LignesBudget}"
                         data-quantite-restante="${item.quantite_restante}"
                         data-id-expression="${item.id_expression}">`;
      
              const rowClasses = estEpuisé ? 'table-secondary text-muted' : '';
      
              const newRow = table.row.add([
                checkbox,
                item.titre_expression || '-',
                item.designation || '-',
                item.quantite || '0',
                item.quantite_restante || '0',
                item.quantite_en_cours || '0',
                item.prix_unitaire || '0',
                ((parseFloat(item.quantite) || 0) * (parseFloat(item.prix_unitaire) || 0)).toFixed(2),
                item.rubrique || '-',
                item.sous_rubrique || '-',
                item.description || '-',
              ]).node();
      
              $(newRow).addClass(rowClasses);
            });
            table.draw();
          } else if (data?.error) {
            showAlert('warning', data.error);
          } else {
            showAlert('error', "Erreur inattendue lors du chargement.");
          }
        }, 'json').fail(function (xhr, status, error) {
          console.error("❌ Erreur AJAX :", error);
          showAlert('error', "Erreur réseau : " + error);
        });
      }      
  
    chargerLignes();
  
    $('#checkAll').on('change', function () {
      $('.check-ligne').prop('checked', $(this).is(':checked'));
    });
  
    $('#btnExporterPDF').on('click', function () {
      lignesPourPreforma = [];
  
      table.rows().every(function () {
        const $row = $(this.node());
        const checkbox = $row.find('.check-ligne');
        if (checkbox.is(':checked')) {
          const idLigneBudget = checkbox.attr('data-id-lignesbudget');
          const quantiteRestante = parseFloat(checkbox.attr('data-quantite-restante') || 0);
          const rowData = this.data();
          if (rowData && idLigneBudget) {
            lignesPourPreforma.push({
              data: rowData,
              idLigneBudget: parseInt(idLigneBudget),
              quantiteRestante: quantiteRestante
            });
          }
        }
      });
  
      if (lignesPourPreforma.length === 0) {
        showAlert('warning', "Veuillez cocher au moins une ligne à exporter.");
        return;
      }
  
      const modal = new bootstrap.Modal(document.getElementById('modalFournisseur'));
      modal.show();
  
      $.post("../../controlleur/controlleur.php", { option: 98 }, function (res) {
        $('#listeFournisseurs').html('');
        res.forEach(f => {
          $('#listeFournisseurs').append(`<option value="${f.nomF} ${f.prenomF} (${f.entreprise})">${f.nomF} ${f.prenomF} - ${f.entreprise}</option>`);
        });
      }, 'json');
    });
  
    $('#validerExportFournisseurs').on('click', async function () {
      const fournisseurs = $('#listeFournisseurs').val();
      if (!fournisseurs || fournisseurs.length === 0) {
        showAlert('warning', "Veuillez sélectionner au moins un fournisseur.");
        return;
      }
  
      const zip = new JSZip();
      let index = 1;
  
      for (const fournisseur of fournisseurs) {
        const body = [['Désignation', 'Quantité réelle', 'Prix réel']];
        lignesPourPreforma.forEach(row => {
          body.push([row.data[2], '', '']); // row.data[2] = Désignation
        });
  
        const docDefinition = {
          content: [
            { text: `Préforma - ${fournisseur}`, style: 'header' },
            { text: `Date : ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ['*', 'auto', 'auto'],
                body: body
              }
            }
          ],
          styles: {
            header: { fontSize: 18, bold: true, alignment: 'center' }
          }
        };
  
        const pdfBlob = await new Promise(resolve => {
          pdfMake.createPdf(docDefinition).getBlob(blob => resolve(blob));
        });
  
        const cleanName = fournisseur.replace(/\s+/g, '_').replace(/[()]/g, '');
        zip.file(`DemandeProforma_${index}_${cleanName}.pdf`, pdfBlob);
        index++;
      }
  
      zip.generateAsync({ type: 'blob' }).then(function (content) {
        const filename = `proforma_${new Date().toISOString().split('T')[0]}.zip`;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = filename;
        link.click();
      });
  
      bootstrap.Modal.getInstance(document.getElementById('modalFournisseur')).hide();
    });
  
    // Ajout fournisseur (inchangé)
    $('#btnNouveauFournisseur').on('click', function () {
      $('#formAjoutFournisseur')[0].reset();
      new bootstrap.Modal(document.getElementById('modalAjoutFournisseur')).show();
    });
  
    $('#formAjoutFournisseur').on('submit', function (e) {
      e.preventDefault();
      const formData = $(this).serialize() + '&option=99';
      $.post("../../controlleur/controlleur.php", formData, function (res) {
        showAlert('success', res.message || "Fournisseur ajouté !");
        bootstrap.Modal.getInstance(document.getElementById('modalAjoutFournisseur')).hide();
        $.post("../../controlleur/controlleur.php", { option: 98 }, function (fournisseurs) {
          $('#listeFournisseurs').html('');
          fournisseurs.forEach(f => {
            $('#listeFournisseurs').append(`<option value="${f.nomF} ${f.prenomF} (${f.entreprise})">${f.nomF} ${f.prenomF} - ${f.entreprise}</option>`);
          });
        }, 'json');
      }, 'json');
    });

    // Gestion commande-achat
    $('#btnPasserCommandes').on('click', function () {
        const lignesSelectionnees = [];
    
        // ✅ Prend en compte les lignes sélectionnées sur toutes les pages
        table.rows().every(function () {
            const $row = $(this.node());
            const checkbox = $row.find('input.check-ligne');
    
            if (checkbox.is(':checked')) {
                const idLigneBudget = checkbox.data('id-lignesbudget');
                const quantiteRestante = parseFloat(checkbox.data('quantite-restante') || 0);
                const rowData = this.data(); // tableau avec les colonnes définies dans table.row.add([...])
    
                if (rowData && idLigneBudget) {
                    lignesSelectionnees.push({
                        data: rowData,
                        idLigneBudget: parseInt(idLigneBudget),
                        quantiteRestante: quantiteRestante
                    });
                }
            }
        });
    
        if (lignesSelectionnees.length === 0) {
            showAlert('warning', "Veuillez cocher au moins une ligne.");
            return;
        }
    
        // Charger la liste des fournisseurs
        $.post("/University_Gestion/controlleur/controlleur.php", { option: 98 }, function (fournisseurs) {
            const fournisseurOptions = fournisseurs.map(f => {
                const id = f.idF || f.id || f.id_fournisseur;
                return `<option value="${id}">${f.nomF} ${f.prenomF} (${f.entreprise})</option>`;
            }).join("");
    
            // Construire les lignes du tableau
            const rowsHTML = lignesSelectionnees.map(ligneObj => {
                const ligne = ligneObj.data;
                const id = ligneObj.idLigneBudget;
                const reste = ligneObj.quantiteRestante;
    
                const designation = ligne[2] || '---'; // Index 2 = désignation dans table.row.add([...])
    
                return `
                    <tr>
                        <td>${designation}</td>
                        <td>
                            <input type="number" name="quantites[]" class="form-control" required min="1" max="${reste}" step="1">
                            <input type="hidden" name="ligne_ids[]" value="${id}">
                        </td>
                        <td>
                            <input type="number" name="prix[]" class="form-control" required min="0" step="0.01">
                        </td>
                    </tr>`;
            }).join("");
    
            // Formulaire HTML dans la modale SweetAlert
            const htmlForm = `
                <form id="formCommande">
                    <div class="row mb-3">
                        <div class="col">
                            <label class="form-label">Fournisseur</label>
                            <select name="fournisseur_id" id="fournisseurSelect" class="form-select" required>
                                <option value="">-- Choisir un fournisseur --</option>
                                ${fournisseurOptions}
                            </select>
                        </div>
                        <div class="col">
                            <label class="form-label">Mode de règlement</label>
                            <select name="mode_reglement" id="modeReglementSelect" class="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                <option value="Liquide">Liquide</option>
                                <option value="Chèque">Chèque</option>
                                <option value="Virement bancaire">Virement bancaire</option>
                                <option value="Wave">Wave</option>
                                <option value="Orange Money">Orange Money</option>
                            </select>
                        </div>
                        <div class="col">
                            <label class="form-label">Modalité de paiement</label>
                            <select name="modalite_paiement" id="modalitePaiementSelect" class="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                <option value="Comptant à la livraison">Comptant à la livraison</option>
                                <option value="Comptant avant livraison">Comptant avant livraison</option>
                                <option value="Par tranche">Par tranche</option>
                            </select>
                        </div>
                    </div>
    
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Désignation</th>
                                <th>Quantité réelle</th>
                                <th>Prix réel</th>
                            </tr>
                        </thead>
                        <tbody>${rowsHTML}</tbody>
                    </table>
                </form>`;
    
            Swal.fire({
                title: 'Passer une commande',
                html: htmlForm,
                confirmButtonText: 'Valider',
                showCancelButton: true,
                focusConfirm: false,
                width: '900px',
                preConfirm: () => {
                    const form = $('#formCommande');
                    const fournisseur = $('#fournisseurSelect').val();
                    const mode = $('#modeReglementSelect').val();
                    const modalite = $('#modalitePaiementSelect').val();
    
                    if (!fournisseur || !mode || !modalite) {
                        Swal.showValidationMessage("Tous les champs généraux sont obligatoires.");
                        return false;
                    }
    
                    const quantites = form.find('input[name="quantites[]"]').map(function () {
                        return this.value;
                    }).get();
    
                    const prix = form.find('input[name="prix[]"]').map(function () {
                        return this.value;
                    }).get();
    
                    const lignes = form.find('input[name="ligne_ids[]"]').map(function () {
                        return this.value;
                    }).get();
    
                    for (let i = 0; i < lignes.length; i++) {
                        if (!quantites[i] || isNaN(quantites[i]) || parseFloat(quantites[i]) <= 0) {
                            Swal.showValidationMessage(`Quantité invalide pour la ligne ${i + 1}`);
                            return false;
                        }
                        if (!prix[i] || isNaN(prix[i]) || parseFloat(prix[i]) < 0) {
                            Swal.showValidationMessage(`Prix invalide pour la ligne ${i + 1}`);
                            return false;
                        }
                    }
    
                    const params = new URLSearchParams();
                    params.append('option', '100');
                    params.append('fournisseur_id', fournisseur);
                    params.append('mode_reglement', mode);
                    params.append('modalite_paiement', modalite);
    
                    lignes.forEach(id => params.append('ligne_ids[]', id));
                    quantites.forEach(q => params.append('quantites[]', q));
                    prix.forEach(p => params.append('prix[]', p));
    
                    return fetch("/University_Gestion/controlleur/controlleur.php", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params
                    })
                        .then(res => res.json())
                        .then(json => {
                            if (!json.success) {
                                Swal.showValidationMessage(json.message || "Erreur inconnue");
                                return false;
                            }
                            return json;
                        })
                        .catch(err => {
                            Swal.showValidationMessage("Erreur réseau : " + err.message);
                            return false;
                        });
                }
            }).then(result => {
                if (result.isConfirmed && result.value && result.value.success) {
                    showAlert('success', result.value.message || "Commande créée !");
                    chargerLignes(); // Recharge le tableau après création
                }
            });
        }, 'json');
    });            
                            
});