// ✅ A placer tout en haut si pas encore défini
function showAlert(type, message) {
    Swal.fire({
        icon: type, // 'success', 'error', 'warning', 'info'
        title: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
            popup: 'swal-custom'
        }
    });
}

$(document).ready(function () {
    const table = $('#tableBudgets').DataTable({
        ajax: {
            url: '../../controlleur/controlleur.php',
            type: 'POST',
            data: { option: 84 },
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'annee' },
            { data: 'type_budget' },
            { data: 'date_creation' },
            { data: 'montant_total' },
            { data: 'statut' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-info btn-sm" onclick="voirLignes(${row.id})">Voir</button>
                        <button class="btn btn-warning btn-sm" onclick="ouvrirModalModification(${row.id})">Modifier</button>
                    `;
                }
            }
        ]
    });

    window.voirLignes = function (id) {
        window.location.href = `voir_lignes.php?idEB=${id}`;
    };

    window.ouvrirModalModification = function (id) {
        $('#mod_id').val(id);

        $.post('../../controlleur/controlleur.php', { option: 85 }, function (types) {
            $('#mod_type_budget_id').empty();
            types.forEach(type => {
                $('#mod_type_budget_id').append(`<option value="${type.id}">${type.nom}</option>`);
            });

            $.post('../../controller.php', { option: 86, id }, function (data) {
                $('#mod_annee').val(data.annee);
                $('#mod_type_budget_id').val(data.type_budget_id);
                $('#mod_montant').val(data.montant_total);
                $('#mod_statut').val(data.statut);
                new bootstrap.Modal(document.getElementById('modalModifierBudget')).show();
            }, 'json');
        }, 'json');
    };

    $('#formModifierBudget').on('submit', function (e) {
        e.preventDefault();
        const formData = $(this).serialize() + '&option=87';

        $.post('../../controller.php', formData, function (res) {
            if (res.success) {
                showAlert('success', res.message || "Budget modifié avec succès !");
                table.ajax.reload();
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalModifierBudget'));
                modal.hide();
            } else {
                showAlert('error', res.message || "Erreur lors de la modification.");
            }
        }, 'json');
    });
});