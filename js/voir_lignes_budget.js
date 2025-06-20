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

// ✅ Gestion commande achat "

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
            const fournisseursValides = (Array.isArray(fournisseurs) ? fournisseurs : []).filter(f => {
                const id = f.id_fournisseur || f.idF || f.id;
                return id && !isNaN(id) && parseInt(id) > 0;
            });

            if (fournisseursValides.length === 0) {
                showAlert('error', "Aucun fournisseur avec ID valide trouvé.");
                return;
            }

            const fournisseurOptions = fournisseursValides.map(f => {
                const id = f.id_fournisseur || f.idF || f.id;
                return `<option value="${id}">${f.nomF} ${f.prenomF} (${f.entreprise || 'N/A'})</option>`;
            }).join("");

            const optionsReglement = ['Liquide', 'Chèque', 'Virement bancaire', 'Wave', 'Orange Money'];
            const optionsModalite = ['Comptant à la livraison', 'Comptant avant livraison', 'Par tranche', '50%'];

            let formHTML = `<form id="formCommande">`;

            lignesSelectionnees.forEach((ligneObj, index) => {
                const ligne = ligneObj.data;
                const idLigneBudget = ligneObj.idLigneBudget;
                const quantiteRestante = ligneObj.quantiteRestante;

                const reglementOptionsHTML = optionsReglement.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                const modaliteOptionsHTML = optionsModalite.map(opt => `<option value="${opt}">${opt}</option>`).join('');

                formHTML += `
                    <hr>
                    <p><strong>${ligne[1]}</strong> <br><small class="text-muted">Quantité restante : ${quantiteRestante}</small></p>
                    <input type="hidden" name="ligne_ids[]" value="${idLigneBudget}">
                    <input type="hidden" name="quantites_restantes[]" value="${quantiteRestante}">

                    <div class="mb-2">
                        <label>Fournisseur <span class="text-danger">*</span></label>
                        <select name="fournisseurs[]" class="form-select" required>
                            <option value="">-- Choisir un fournisseur --</option>
                            ${fournisseurOptions}
                        </select>
                    </div>
                    <div class="mb-2">
                        <label>Quantité réelle <span class="text-danger">*</span></label>
                        <input type="number" name="quantites[]" class="form-control" min="1" max="${quantiteRestante}" step="1" required>
                    </div>
                    <div class="mb-2">
                        <label>Prix réel <span class="text-danger">*</span></label>
                        <input type="number" name="prix[]" class="form-control" min="0" step="0.01" required>
                    </div>
                    <div class="mb-2">
                        <label>Mode de règlement <span class="text-danger">*</span></label>
                        <select name="mode_reglement[]" class="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            ${reglementOptionsHTML}
                        </select>
                    </div>
                    <div class="mb-2">
                        <label>Modalité de paiement <span class="text-danger">*</span></label>
                        <select name="modalite_paiement[]" class="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            ${modaliteOptionsHTML}
                        </select>
                    </div>
                `;
            });

            formHTML += `</form>`;

            Swal.fire({
                title: 'Créer une commande',
                html: formHTML,
                showCancelButton: true,
                confirmButtonText: 'Valider la commande',
                cancelButtonText: 'Annuler',
                focusConfirm: false,
                width: '800px',
                preConfirm: () => {
                    const form = $('#formCommande');
                    let erreurs = [];

                    form.find('select[name="fournisseurs[]"]').each(function (i) {
                        const val = $(this).val();
                        if (!val || isNaN(val) || parseInt(val) <= 0) {
                            erreurs.push(`Fournisseur manquant ou invalide pour la ligne ${i + 1}`);
                        }
                    });

                    form.find('input[name="quantites[]"]').each(function (i) {
                        const val = parseFloat($(this).val());
                        const max = parseFloat(form.find('input[name="quantites_restantes[]"]').eq(i).val());
                        if (!val || isNaN(val) || val <= 0) {
                            erreurs.push(`Quantité invalide ligne ${i + 1}`);
                        } else if (val > max) {
                            erreurs.push(`Quantité réelle (${val}) dépasse la quantité restante (${max}) pour la ligne ${i + 1}`);
                        }
                    });

                    form.find('input[name="prix[]"]').each(function (i) {
                        const val = $(this).val();
                        if (!val || isNaN(val) || parseFloat(val) < 0) {
                            erreurs.push(`Prix invalide ligne ${i + 1}`);
                        }
                    });

                    form.find('select[name="mode_reglement[]"]').each(function (i) {
                        if (!$(this).val()) {
                            erreurs.push(`Mode de règlement manquant ligne ${i + 1}`);
                        }
                    });

                    form.find('select[name="modalite_paiement[]"]').each(function (i) {
                        if (!$(this).val()) {
                            erreurs.push(`Modalité de paiement manquante ligne ${i + 1}`);
                        }
                    });

                    if (erreurs.length > 0) {
                        Swal.showValidationMessage(erreurs.join('<br>'));
                        return false;
                    }

                    const data = form.serialize() + '&option=100';

                    return fetch("../../controlleur/controlleur.php", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: data
                    })
                        .then(res => res.json())
                        .then(json => {
                            if (!json.success) {
                                Swal.showValidationMessage(json.message || "Erreur serveur.");
                                return false;
                            }
                            return json;
                        })
                        .catch(error => {
                            Swal.showValidationMessage("Erreur réseau : " + error);
                            return false;
                        });
                }
            }).then(result => {
                if (result.isConfirmed && result.value && result.value.success) {
                    showAlert('success', result.value.message || "Commande enregistrée avec succès !");
                    chargerLignes();
                }
            });
        }, 'json').fail(function (xhr, status, error) {
            showAlert('error', "Impossible de charger les fournisseurs.");
        });
    });
                            
});