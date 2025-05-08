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
            location.href = "liste_EB.php";
        }
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.href = "liste_EB.php";
        }
    }

    fetchBonSortie(idBon);
});

function fetchBonSortie(idBon) {
    $.ajax({
        url: '../../controlleur/controlleur.php',
        method: 'POST',
        data: {
            option: 59,
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
                        <div>
                            <h4>Produit ${count}</h4>
                            <label>Nom du produit:</label>
                            <select class="form-select" name="idP[]" required>
                                <option value="${bon.idP}">${bon.nomproduit}</option>
                            </select>
                            <br><br>
                            <label for="quantity">Quantité:</label>
                            <input type="number" id="quantity" name="quantite[]" min="1" value="${bon.quantite}" inert required>
                            <br><br>
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