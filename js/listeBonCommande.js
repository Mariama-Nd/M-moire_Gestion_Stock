
    
$(document).ready(function () {
    window.del = function (idbon) {
        Swal.fire({
            title: 'Êtes-vous sûr?',
            text: "Vous ne pourrez pas revenir en arrière!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '../../controlleur/controlleur.php', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
                xhr.send(`option=8&idboncmd=${idbon}`);
    
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response) {
                            Swal.fire(
                                'Erreur!',
                                "Cette commande fait partie d'une livraison et ne peut pas être supprimée.",
                                'error'
                            );
                        } else {
                            Swal.fire(
                                'Supprimée!',
                                'La commande a été supprimée avec succès.',
                                'success'
                            ).then(() => {
                                location.reload();
                            });
                        }
                    } else {
                        Swal.fire(
                            'Erreur!',
                            'Une erreur est survenue lors de la requête.',
                            'error'
                        );
                    }
                };
            } else {
                Swal.fire(
                    'Annulé',
                    'L\'action a été annulée.',
                    'info'
                );
            }
        });
    };
    
  

    window.newWindows = function (id_bon_cmd) {
        // window.open("../../test.php?id=" + id_bon_cmd, "blank");
        location.href ="tirer.php?id=" + id_bon_cmd;
    };
    
 
    
    window.validation_bon = function (id_bon_cmd) {
        Swal.fire({
            title: 'Voulez-vous vraiment valider cette commande ?',
            text: "Cette action est irréversible!",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, valider!',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`../../controlleur/controlleur.php?option=16&idbon=${id_bon_cmd}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status) {
                            Swal.fire(
                                'Succès!',
                                data.status,
                                'success'
                            ).then(() => {
                                window.location.href = "Liste_bon_cmd.php";
                            });
                        } else if (data.error) {
                            console.error('Erreur lors de la validation du bon de commande :', data.error);
                            Swal.fire(
                                'Erreur!',
                                'Erreur lors de la validation du bon de commande : ' + data.error,
                                'error'
                            );
                        }
                    })
                    .catch(error => {
                        console.error('Erreur lors de la validation du bon de commande :', error);
                        Swal.fire(
                            'Erreur!',
                            'Une erreur est survenue pendant la validation.',
                            'error'
                        );
                    });
            } else {
                Swal.fire(
                    'Annulé',
                    'Action annulée.',
                    'info'
                );
            }
        });
    };
    


    window.creerBC = function () {
     
                    location.href = "nouvelleCommande.php";


    };
    function loadTableData() {
        $.ajax({
            url: '../../controlleur/controlleur.php',
            method: 'POST',
            data: { option: 6 },
            dataType: 'json',
            success: function (data) {
                var tableBody = $('#sales-table tbody');
                tableBody.empty();
                data.forEach(function (ventes) {
                    var actionButton = '';
                    if (ventes.Etat_commander == 1) {
                        actionButton = `<button onclick="location.href='commander.php?auto_gen=${ventes.idBC_gen}&nomBC=${ventes.nomBC}'" class='btn btn-warning btn-custom'>Editer</button>`;
                    } else if (ventes.Etat_commander == 2) {
                        actionButton = `<button   type="bouton" onclick="newWindows(${ventes.id_BC})" class='btn btn-light btn-custom' style=" background-color:rgb(97, 196, 229); /* Bleu clair */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;">Tirer </button>`;
                    } else if (ventes.Etat_commander == 3) {
                        actionButton = `<button onclick='location.href=' class='btn btn-danger btn-custom'>Supprimer</button>`;
                    } else if (ventes.Etat_commander == 5) {
                        actionButton = `<button onclick="location.href='poursuivre_cmd.php?idbon=${ventes.id_BC}&nomBC=${ventes.nomBC}'" class='btn btn-warning btn-custom'>Poursuivre</button>`;
                    } else {
                        actionButton = `<button onclick='location.href=' class='btn btn-success btn-custom'>Valider</button>`;
                    }
    
                    var validationButton = '';
                    $.ajax({
                        url: '../../controlleur/controlleur.php',
                        method: 'POST',
                        data: { option: 7, idbon_cmd: ventes.id_BC },
                        dataType: 'json',
                        async: false,
                        success: function (response) {
                            if (response.length > 0 && ventes.Etat_commander != 2) {
                                validationButton = `<button onclick="validation_bon(${ventes.id_BC})" class='btn btn-success btn-custom' name="valider">Valider</button>`;
                            } else if (response.length > 0 && ventes.Etat_commander == 2) {
                                validationButton = `<button onclick="location.href='Consulter_BC.php?idbon=${ventes.id_BC}&nomBC=${ventes.nomBC}'" class='btn btn-secondary btn-custom' name="valider">Apperçu</button>`;
                            }
                        }
                    });
    
                    var deleteButton = `<button onclick="del(${ventes.id_BC})" class='btn btn-danger btn-custom' name="Supprimer">Supprimer</button>`;
    
                    tableBody.append(`
                        <tr>
                            <td>${ventes.nomBC}</td>
                            <td></td>
                            <td>${ventes.date}</td>
                            <td>${ventes.nom_status_cmd}</td>
                            <td>${actionButton}</td>
                            <td>${validationButton}</td>
                            <td>${deleteButton}</td>
                        </tr>
                    `);
                });
    
               
                initializeDataTable();
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        });
    }
    

    function initializeDataTable() {
        const table = $('#sales-table').DataTable();
        const categoryOptions = new Set();
        const subcategoryOptions = new Set();
        const stockOptions = new Set();

        $('#sales-table tbody tr').each(function () {
            categoryOptions.add($(this).find('td:eq(0)').text());
            subcategoryOptions.add($(this).find('td:eq(1)').text());
            stockOptions.add($(this).find('td:eq(3)').text());
        });

        stockOptions.forEach(option => {
            $('#stock-select').append(`<option value="${option}">${option}</option>`);
        });

        $('select, #name-input').on('change input', function () {
            const categoryFilter = $('#cat-select').val();
            const subcategoryFilter = $('#subcat-select').val();
            const nameFilter = $('#name-input').val().toLowerCase();
            const stockFilter = $('#stock-select').val();

            table.rows().every(function () {
                const data = this.data();
                const row = $(this.node());
                const categoryMatch = categoryFilter === "" || data[0].toLowerCase().includes(categoryFilter.toLowerCase());
                const subcategoryMatch = subcategoryFilter === "" || data[1].toLowerCase().includes(subcategoryFilter.toLowerCase());
                const nameMatch = nameFilter === "" || data[2].toLowerCase().includes(nameFilter);
                const stockMatch = stockFilter === "" || data[3] === stockFilter;
                if (categoryMatch && subcategoryMatch && nameMatch && stockMatch) {
                    row.show();
                } else {
                    row.hide();
                }
            });
        });
    }

    loadTableData();

    setInterval(function () {
        $('#sales-table').DataTable().destroy();
        loadTableData();
    }, 180000);
});