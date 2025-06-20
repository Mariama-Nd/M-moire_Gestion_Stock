$(document).ready(function () {
    $('#tableAchats').DataTable({
        ajax: {
            url: '../../controlleur/controlleur.php',
            type: 'POST',
            data: { option: 88 },
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'titre' },
            { data: 'structure' },
            { data: 'date_creation' },
            { data: 'statut' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button class="btn btn-info btn-sm" onclick="voirAchat(${row.id})">Voir</button>
                    `;
                }
            }
        ]
    });
});

function voirAchat(id) {
    alert("Fonction voirAchat à implémenter pour l'achat #" + id);
}