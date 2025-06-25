//Fonction utilitaire pour afficher une alerte
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
    const budget_id = $('#budgetId').val();
    let lignesPourPreforma = [];

    const table = $('#tableLignes').DataTable({
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.1/i18n/fr-FR.json"
        },
        columnDefs: [{ orderable: false, targets: 0 }]
    });

    $('#tableLignes_filter').appendTo('#datatable-search-wrapper');
    $('#tableLignes_filter label').addClass('w-100 d-flex justify-content-center');
    $('#tableLignes_filter input').addClass('form-control w-50 mx-2');

    function chargerLignes() {
        $.post("../../controlleur/controlleur.php", { option: 83, budget_id }, function (data) {
            table.clear();
            if (Array.isArray(data)) {
                data.forEach(item => {
                    console.log("🔍 Ligne reçue :", item);
    
                    const estEpuisé = parseFloat(item.quantite_restante) <= 0;
    
                    const checkbox = estEpuisé
                        ? `<input type="checkbox" class="check-ligne" disabled title="Quantité restante nulle">`
                        : `<input type="checkbox" class="check-ligne" 
                               data-id="${item.id}" 
                               data-id-ligne="${item.id_LignesBudget}" 
                               data-quantite-restante="${item.quantite_restante}">`;
    
                    const actions = estEpuisé
                        ? `<span class="text-muted small">Indisponible</span>`
                        : `<div class="d-flex flex-column gap-1">
                               <button class="btn btn-danger btn-sm" onclick="retirerLigne(${item.id})">Retirer</button>
                           </div>`;
    
                    const rowClasses = estEpuisé ? 'table-secondary text-muted' : '';
    
                    const newRow = table.row.add([
                        checkbox,
                        item.designation ?? '-',
                        item.quantite != null ? item.quantite : '0',
                        item.quantite_restante != null ? item.quantite_restante : '0',
                        item.prix_unitaire != null ? item.prix_unitaire : '0',
                        ((parseFloat(item.quantite) || 0) * (parseFloat(item.prix_unitaire) || 0)).toFixed(2),
                        item.rubrique ?? '-',
                        item.sous_rubrique ?? '-',
                        item.description ?? '-',
                        actions.trim()
                    ]).node();
    
                    $(newRow).addClass(rowClasses);
                });
            }
            table.draw();
        }, 'json');
    }                

    chargerLignes();

    window.retirerLigne = function (idLigne) {
        if (confirm("Êtes-vous sûr de vouloir retirer cette ligne ?")) {
            $.post("../../controlleur/controlleur.php", { option: 92, ligne_id: idLigne }, function (res) {
                showAlert('success', res.message || "Ligne retirée !");
                chargerLignes();
            }, 'json');
        }
    };

    $('#btnAjoutLigne').on('click', function () {
        $('#formAjoutLigne')[0].reset();
        $('#ajout_budget_id').val(budget_id);
        $.post("../../controlleur/controlleur.php", { option: 93, budget_id }, function (res) {
            $('#ajout_rubrique').html('<option value="">-- Choisir une rubrique --</option>');
            res.forEach(r => {
                $('#ajout_rubrique').append(`<option value="${r.id}">${r.nom}</option>`);
            });
        }, 'json');
        $('#ligne_budget_select').html('<option value="">-- Choisir une ligne --</option>');
        new bootstrap.Modal(document.getElementById('modalAjoutLigne')).show();
    });

    $('#ajout_rubrique').on('change', function () {
        const rubrique_id = $(this).val();
        if (!rubrique_id) return;
        $.post("../../controlleur/controlleur.php", { option: 94, budget_id, rubrique_id }, function (res) {
            $('#ligne_budget_select').html('<option value="">-- Choisir une ligne --</option>');
            res.forEach(l => {
                $('#ligne_budget_select').append(`<option value="${l.id}">${l.designation}</option>`);
            });
        }, 'json');
    });

    $('#formAjoutLigne').on('submit', function (e) {
        e.preventDefault();
        const ligne_id = $('#ligne_budget_select').val();
        if (!ligne_id) return showAlert('warning', "Veuillez choisir une ligne.");
        let doublon = false;
        table.rows().every(function () {
            const rowData = this.data();
            if (rowData[1] === $('#ligne_budget_select option:selected').text()) {
                doublon = true;
                return false;
            }
        });
        if (doublon) return showAlert('warning', "Cette ligne est déjà associée.");
        const formData = $(this).serialize() + '&option=95';
        $.post("../../controlleur/controlleur.php", formData, function (res) {
            showAlert('success', res.message || "Ligne ajoutée !");
            bootstrap.Modal.getInstance(document.getElementById('modalAjoutLigne')).hide();
            chargerLignes();
        }, 'json');
    });

    $('#checkAll').on('change', function () {
        $('.check-ligne').prop('checked', $(this).is(':checked'));
    });

    $('#btnExporterPDF').on('click', function () {
        lignesPourPreforma = [];
        $('.check-ligne:checked').each(function () {
            const row = table.row($(this).closest('tr')).data();
            if (row) lignesPourPreforma.push(row);
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
        const expressionName = $('#nomExpression').val().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
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
                body.push([row[1], '', '']);
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
            zip.file(`${expressionName}_DemandeProforma_${index}_${cleanName}.pdf`, pdfBlob);
            index++;
        }

        zip.generateAsync({ type: 'blob' }).then(function (content) {
            const filename = `${expressionName}_proforma_${new Date().toISOString().split('T')[0]}.zip`;
            const link = document.createElement("a");
            link.href = URL.createObjectURL(content);
            link.download = filename;
            link.click();
        });

        bootstrap.Modal.getInstance(document.getElementById('modalFournisseur')).hide();
    });

    $('#btnNouveauFournisseur').on('click', function () {
        $('#formAjoutFournisseur')[0].reset();
        new bootstrap.Modal(document.getElementById('#modalAjoutFournisseur')).show();
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
    
        $('.check-ligne:checked').each(function () {
            const row = table.row($(this).closest('tr')).data();
            const idLigneBudget = $(this).data('id-ligne') || $(this).data('id_ligne');
            const quantiteRestante = parseFloat($(this).data('quantite-restante') || 0);
    
            if (row && idLigneBudget && !isNaN(idLigneBudget) && parseInt(idLigneBudget) > 0) {
                lignesSelectionnees.push({
                    data: row,
                    idLigneBudget: parseInt(idLigneBudget),
                    quantiteRestante: quantiteRestante
                });
            }
        });
    
        if (lignesSelectionnees.length === 0) {
            showAlert('warning', "Veuillez cocher au moins une ligne.");
            return;
        }
    
        $.post("../../controlleur/controlleur.php", { option: 98 }, function (fournisseurs) {
            const fournisseurOptions = fournisseurs.map(f => {
                const id = f.idF || f.id || f.id_fournisseur;
                return `<option value="${id}">${f.nomF} ${f.prenomF} (${f.entreprise})</option>`;
            }).join("");
    
            const rowsHTML = lignesSelectionnees.map((ligneObj, index) => {
                const ligne = ligneObj.data;
                const id = ligneObj.idLigneBudget;
                const reste = ligneObj.quantiteRestante;
                return `
                    <tr>
                        <td>${ligne[1]}</td>
                        <td>
                            <input type="number" name="quantites[]" class="form-control" required min="1" max="${reste}" step="1">
                            <input type="hidden" name="ligne_ids[]" value="${id}">
                        </td>
                        <td>
                            <input type="number" name="prix[]" class="form-control" required min="0" step="0.01">
                        </td>
                    </tr>`;
            }).join("");
    
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
                                <option value="50%">50%</option>
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
    
                    const params = new URLSearchParams({
                        option: 100,
                        fournisseur_id: fournisseur,
                        mode_reglement: mode,
                        modalite_paiement: modalite,
                        id_expression: $('#expressionId').val() // NOUVEAU
                    });
    
                    lignes.forEach(id => params.append('ligne_ids[]', id));
                    quantites.forEach(q => params.append('quantites[]', q));
                    prix.forEach(p => params.append('prix[]', p));
    
                    return fetch("../../controlleur/controlleur.php", {
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
                        }).catch(err => {
                            Swal.showValidationMessage("Erreur réseau : " + err.message);
                            return false;
                        });
                }
            }).then(result => {
                if (result.isConfirmed && result.value && result.value.success) {
                    showAlert('success', result.value.message || "Commande créée !");
                    chargerLignes();
                }
            });
        }, 'json');
    });        
                            
});