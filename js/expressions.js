// Fonction utilitaire
function showAlert(type, message) {
    Swal.fire({
        icon: type, // 'success', 'error', 'warning', 'info'
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

$(document).ready(function () {
    const table = $('#tableExpressions').DataTable({
        ajax: {
            url: '../../controlleur/controlleur.php',
            type: 'POST',
            data: { option: 89 },
            dataSrc: ''
        },
        columns: [
            { data: 'titre' },
            { data: 'structure' },
            { data: 'nom' },
            { data: 'prenom' },
            { data: 'date_creation' },
            { data: 'montant_estime' },
            {
                data: null,
                className: 'table-actions',
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-info btn-sm" onclick="voirLignes(${row.idEB})">Voir</button>
                        <button class="btn btn-warning btn-sm" onclick="modifierExpression(${row.idEB})">Modifier</button>
                        <button class="btn btn-success btn-sm" onclick="genererAchat(${row.idEB})">Générer Achat</button>
                    `;
                }
            }
        ]
    });

    window.voirLignes = function (id) {
        window.location.href = `voir_lignes.php?idEB=${id}`;
    };

    window.modifierExpression = function (idEB) {
        $.post("../../controlleur/controlleur.php", { option: 90, idEB }, function (data) {
            if (data && data.idEB) {
                $('#mod_idEB').val(data.idEB);
                $('#mod_titre').val(data.titre);
                $('#mod_structure').val(data.structure);
                $('#mod_nom').val(data.nom);
                $('#mod_prenom').val(data.prenom);
                const modal = new bootstrap.Modal(document.getElementById('modalModifierExpression'));
                modal.show();
            } else {
                showAlert('error', "Erreur lors du chargement de l'expression.");
            }
        }, 'json');
    };
    
    $('#formModifierExpression').on('submit', function (e) {
        e.preventDefault();
        const formData = $(this).serialize() + '&option=91';
    
        $.post("../../controlleur/controlleur.php", formData, function (res) {
            showAlert('success', res.message || "Expression modifiée !");
            $('#tableExpressions').DataTable().ajax.reload();
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalModifierExpression'));
            modal.hide();
        }, 'json');
    });

    window.genererAchat = function (id) {
        Swal.fire({
            title: "Générer un achat pour cette expression ?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Oui, générer",
            cancelButtonText: "Annuler"
        }).then((result) => {
            if (result.isConfirmed) {
                $.post("../../controller.php", { option: 82, idEB: id }, function (res) {
                    showAlert('success', res.message || "Achat généré avec succès !");
                    table.ajax.reload();
                }, 'json');
            }
        });
    };
});