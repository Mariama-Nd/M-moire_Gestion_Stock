document.addEventListener('DOMContentLoaded', function () {
    const idBon = new URLSearchParams(window.location.search).get('idBon');
    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];
    
    if (modal) {
        modal.style.display = "block";
    }
    
    if (closeButton) {
        closeButton.onclick = function () {
            modal.style.display = "none";
            location.href = "Liste_bon_sortie.php";
        }
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.href = "Liste_bon_sortie.php";
        }
    }

    fetchBonSortie(idBon);
});

function fetchBonSortie(idBon) {
    $.ajax({
        url: '../../controlleur/controlleur.php',
        method: 'POST',
        data: {
            option: 77,
            idBon: idBon
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                const bonsSortie = response.data;
                const productsContainer = $('#productsContainer');
                productsContainer.empty();

                let count = 1;
                bonsSortie.forEach(bon => {
                                      const productForm = `
                        <div class="card mb-4 shadow-sm">
                            <div class="card-header  ">
                                <h4 class="mb-0">Produit ${count}</h4>
                            </div>
                            <div class="card-body">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <label class="form-label fw-bold">Nom du produit :</label>
                                        <select class="form-select" name="idP[]" required disabled>
                                            <option value="${bon.idP}">${bon.nomproduit}</option>
                                        </select>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label for="quantity${count}" class="form-label fw-bold">Quantité :</label>
                                        <div class="input-group">
                                            <input type="number" 
                                                   id="quantity${count}" 
                                                   class="form-control" 
                                                   name="quantite[]" 
                                                   min="1" 
                                                   value="${bon.quantite}" 
                                                   disabled 
                                                   required>
                                        </div>
                                    </div>
                    
                                    <div class="col-md-6">
                                        <label for="unite${count}" class="form-label fw-bold">Unité :</label>
                                        <input type="text" 
                                               id="unite${count}" 
                                               class="form-control" 
                                               name="unite[]" 
                                               value="${bon.unite}" 
                                               disabled 
                                               required>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    productsContainer.append(productForm);
                    count++;
                });
            } else {
                alert(response.message);
            }
        },
        error: function(error) {
            console.error('Erreur de connexion au serveur :', error);
            alert('Erreur de connexion au serveur');
        }
    });
}