$(document).ready(function () {
    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];
    let productCount = 1;
    let products = [];



  

    document.addEventListener('DOMContentLoaded', function () {
        modal.style.display = "block";
    });

    closeButton.onclick = function () {
        modal.style.display = "none";
        location.href = "Liste_bon_cmd.php";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.href = "Liste_bon_cmd.php";
        }
    }

    const idbon = new URLSearchParams(window.location.search).get('idbon');
    const nomBC = new URLSearchParams(window.location.search).get('nomBC');

    if (idbon) {
        $.ajax({
            url: '../../controlleur/controlleur.php',
            method: 'POST',
            data: { option: 9, idbon: idbon },
            dataType: 'json',
            success: function (data) {
                $('#productsContainer').empty();
                $('#productsContainer').append(`
                    <h2 class="text-center my-3">Bon de Commande : ${nomBC}</h2>
                `);
        
                let count = 1;
                data.forEach(function (ventes) {
                    $('#productsContainer').append(`
                        <div class="card mb-3 p-3 shadow-sm">
                            <h4 class="mb-3">Produit ${count}</h4>
                            
                            <div class="mb-3">
                                <label class="form-label">Nom du produit:</label>
                                <select class="form-select" name="idP[]" >
                                    <option value="${ventes.idP}">${ventes.nomproduit}</option>
                                </select>
                            </div>
        
                          <div class="row">
    <div class="col-md-6 mb-3">
        <label for="quantity" class="form-label">Quantité:</label>
        <input type="number" class="form-control" id="quantity" name="quantite[]" min="1" value="${ventes.quantite}"  readonly >
    </div>

    <div class="col-md-6 mb-3">
        <label for="unite" class="form-label">Unité:</label>
        <input type="text" class="form-control" id="unite" name="unite[]" value="${ventes.unite}"  readonly>
    </div>
</div>

                        </div>
                    `);
                    count++;
                });
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        });
        
    }

   
    $.ajax({
        url: '../../controlleur/controlleur.php',
        method: 'POST',
        data: { option: 10 },
        dataType: 'json',
        success: function (data) {
            products = data;
        },
        error: function (xhr, status, error) {
            console.error('Erreur lors de la récupération des produits:', error);
        }
    });

    window.addProduct = addProduct;
});