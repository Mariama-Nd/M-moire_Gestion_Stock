$(document).ready(function () {

    window.newWindows = function (id_bon_cmd) {
        // window.open("../../test.php?id=" + id_bon_cmd, "blank");
        location.href ="tirer.php?id=" + id_bon_cmd;
    };
    

    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];


    function loadTableData() {
        $.ajax({
            url: '../../controlleur/controlleur.php',
            method: 'POST',
            data: { option: 60 },
            dataType: 'json',
            success: function (data) {
                var tableBody = $('#sales-table tbody');
                tableBody.empty();
                data.forEach(function (ventes) {
                    var actionButton = '';
                   if (ventes.Etat_commander == 2) {
                        actionButton = `<button onclick="newWindows(${ventes.id_BC})" class='btn btn-light btn-custom' style=" background-color:rgb(97, 196, 229); /* Bleu clair */
    color: white;
  
  
    ">Voir Bon</button>`;
                    } 

                    var validationButton = '';
                    $.ajax({
                        url: '../../controlleur/controlleur.php',
                        method: 'POST',
                        data: { option: 7, idbon_cmd: ventes.id_BC },
                        dataType: 'json',
                        async: false,
                        success: function (response) {
                          if (response.length > 0 && ventes.Etat_commander == 2) {
                                validationButton = `<button onclick="location.href='Consulter_BC.php?idbon=${ventes.id_BC}&nomBC=${ventes.nomBC}'" class="btn btn-secondary btn-custom">Apperçu</button>`;
                            }
                        }
                    });


                    tableBody.append(`
                        <tr>
                            <td>${ventes.nomBC}</td>
                            <td></td>
                            <td>${ventes.date}</td>
                            <td>${ventes.nom_status_cmd}</td>
                            <td>${actionButton}</td>
                            <td>${validationButton}</td>
                          
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