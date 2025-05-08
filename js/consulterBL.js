document.addEventListener('DOMContentLoaded', function () {
    const idBL = new URLSearchParams(window.location.search).get('idBL');
    fetch(`../../controlleur/controlleur.php?option=28&idBL=${idBL}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('productList');
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item mb-3 p-3 border rounded bg-light shadow-sm'; // Ajout de styles Bootstrap pour un rendu élégant
                    productItem.innerHTML = `
                        <div class="row">
                            <h4 class="mb-3 text-primary fw-bold">${product.nomproduit}</h4>
                            
                            <div class="col-md-6">
                                <label for="prod${product.idP}" class="form-label fw-semibold">Quantité</label>
                                <input type="number" class="form-control" name="quantity[]" min="0" disabled value="${product.quantite}">
                            </div>
                
                            <div class="col-md-6">
                                <label for="prod${product.idP}" class="form-label fw-semibold">Unité</label>
                                <input type="text" class="form-control" name="unite[]" disabled value="${product.unite}">
                            </div>
                        </div>
                    `;
                    productList.appendChild(productItem);
                });
                
            } else {
                const productList = document.getElementById('productList');
                productList.innerHTML = `<p>${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des produits :', error);
        });
            
        document.querySelector('.close').onclick = function() {
            window.location.href = 'Liste_BL.php';
        };

        window.onclick = function(event) {
            if (event.target == document.querySelector('.modal')) {
                window.location.href = 'Liste_BL.php';
            }
        };
    
          
          
});