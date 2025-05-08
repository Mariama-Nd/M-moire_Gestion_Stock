document.addEventListener('DOMContentLoaded', function () {
    const idBC = new URLSearchParams(window.location.search).get('idBC');
    const idBL = new URLSearchParams(window.location.search).get('idBL');
    const nomBL = new URLSearchParams(window.location.search).get('nomBL');

    // Récupérer les produits enregistrés
    fetch(`../../controlleur/controlleur.php?option=30&idBL=${idBL}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('productList');
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item card mb-3 shadow-sm';  // Utilisation de la carte pour un design propre
                    productItem.dataset.idp = product.idP;
                    productItem.innerHTML = `
                        <span id="idPorduit${product.idP}" hidden="true">${product.idP}</span>
                        <span id="idBLproduit${product.idP}" hidden="true">${idBL}</span>
                        <span id="quantite_product${product.idP}" hidden="true">${product.quantite}</span>
                        <span id="unite_product${product.idP}" hidden="true">${product.unite}</span>
                        <span id="prix_product${product.idP}" hidden="true">${product.prix_unitaire}</span>
                        <span id="reste${product.idP}" hidden="true">${product.reste}</span>
                
                        <div class="card-header">
                            <h5 class="card-title">${product.nomproduit} <span class="text-muted">(Reste: ${product.reste})</span></h5>
                        </div>
                
                        <div class="card-body">
                        <div class="row">
                         <div class="col-md-6">
                                <label for="prod${product.idP}" class="form-label"><b>Quantité</b></label>
                                <input type="number" name="quantity[]" min="0" id="quantity${product.idP}" class="form-control" value="${product.quantite}">
                            </div>
                
                            <div class="col-md-6">
                                <label for="prod${product.idP}" class="form-label"><b>Prix Unitaire (CFA)</b></label>
                                <input type="number" name="prix[]" min="0" id="prix${product.idP}" class="form-control" value="${product.prix_unitaire}">
                            </div>
                </div>
                           
                            <div class="mb-3">
                                <label for="prod${product.idP}" class="form-label"><b>Unité (pièce, boîte, carton)</b></label>
                                <input type="text" name="unite[]" id="unite${product.idP}" class="form-control" value="${product.unite}">
                            </div>
                
                            <div class="d-flex justify-content-between">
                                <button type="button" class="btn btn-warning modify">Modifier</button>
                                <button type="button" class="btn btn-danger delete">Supprimer</button>
                            </div>
                        </div>
                    `;
                    productList.appendChild(productItem);
                });
                
                addEventListeners();
            } else {
                const productList = document.getElementById('productList');
                productList.innerHTML = `<p>${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des produits enregistrés :', error);
        });

    // Récupérer les autres produits du bon de commande
    fetch(`../../controlleur/controlleur.php?option=31&idBL=${idBL}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('productListNE');
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.dataset.idp = product.idP;
                    productItem.innerHTML = `
                        <input type="checkbox" id="prod${product.idP}" name="products[]" value="${product.idP}">

                        <label for="prod${product.idP}" class="product-name"><b>${product.nomproduit} <br> (Reste:${product.reste})</b></label><br>
                        <input type="number" name="quantity[]" min="0" disabled id="${product.idP}" placeholder="Quantite Recus">

                        <label for="prod${product.idP}"><b>Prix Unitaire (CFA)</b></label>
                        <input type="number" name="prix[]" class="product-price" min="0" id="prix${product.idP}" disabled placeholder="Prix Produit">

                         <label for="prod${product.idP}"><b>unité(piece,caroton,boîte)</b></label>
                        <input type="text" name="unite[]" class="product-price" id="unite${product.idP}" disabled placeholder="Prix Produit">

                        <button type="button" class="partielle-save" data-idp="${product.idP}">Enregistrer</button>
                    `;
                    productList.appendChild(productItem);
                });
                addEventListeners();
            } else {
                const productList = document.getElementById('productList');
                productList.innerHTML = `<p>${data.message}</p>`;
            }
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des autres produits du bon de commande :', error);
        });

    function addEventListeners() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function () {
                const productItem = checkbox.closest('.product-item');
                const quantityInput = productItem.querySelector('input[name="quantity[]"]');
                const priceInput = productItem.querySelector('input[name="prix[]"]');
                const uniteInput = productItem.querySelector('input[name="unite[]"]');
                const isChecked = checkbox.checked;
                quantityInput.disabled = !isChecked;
                priceInput.disabled = !isChecked;
                uniteInput.disabled = !isChecked;
            });
        });

        document.querySelectorAll('input[name="products[]"]').forEach(checkbox => {
            checkbox.checked = false;
            const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');
            quantityInput.disabled = true;
            quantityInput.value = '';
        });

        document.querySelectorAll('.partielle-save').forEach(button => {
            button.addEventListener('click', function () {
                const idP = button.getAttribute('data-idp');
                saveProduct(idP);
            });
        });

        document.querySelectorAll('.modify').forEach(button => {
            button.addEventListener('click', function () {
                const productItem = button.closest('.product-item');
                const idP = productItem.getAttribute('data-idp');
                modifyProduct(idP);
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function () {
                const productItem = button.closest('.product-item');
                const idP = productItem.getAttribute('data-idp');
                const quantity = document.getElementById('quantity' + idP).value;
                deleteProduct(idP, quantity);
            });
        });
    }

       document.getElementById('enregistrerTout').addEventListener('click', function () {
        const selectedProducts = [];
        const quantities = [];
        const price = [];
        const invalidProducts = [];
        const invalidProducts_price = [];
    
        document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
            const productId = checkbox.value;
            const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');
            const quantity = quantityInput.value.trim();
            const productName = checkbox.parentElement.querySelector('.product-name').textContent;
            const prix = checkbox.parentElement.querySelector('.product-price').value;
    
            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0 ) {
                invalidProducts.push(productName);
            } else {
                selectedProducts.push(productId);
                quantities.push(quantity);
                price.push(prix);
            }
    
            if (!prix || isNaN(prix) || parseFloat(prix) <= 0) {
                invalidProducts_price.push(productName);
            }
        });
    
        if (invalidProducts.length > 0) {
            alert("Veuillez entrer une Quantité valide pour les produits suivants :\n" + invalidProducts.join(', '));
            return;
        }
    
        if (invalidProducts_price.length > 0) {
            alert("Veuillez entrer un Prix valide pour les produits suivants :\n" + invalidProducts_price.join(', '));
            return;
        }
    
        if (selectedProducts.length === 0) {
            alert("Aucun produit sélectionné.");
            return;
        }
    
        const formData = new FormData();
        formData.append('option', 33);
        formData.append('products', JSON.stringify(selectedProducts));
        formData.append('quantity', JSON.stringify(quantities));
        formData.append('prix', JSON.stringify(price));
        formData.append('nomBL', nomBL);
        formData.append('idBC', idBC);
        formData.append('idBL', idBL);
        formData.append('enregistrerTout', true);
    
    
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
        
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Enregistrement réussi.',
                }).then(() => {
                    window.location.href = "Liste_BL.php"; 
                });
            } else {
                if (data.produitsIncoherents && data.produitsIncoherents.length > 0) {
                    let message = "Incohérence de quantités pour les produits suivants :\n";
                    data.produitsIncoherents.forEach(prod => {
                        message += `${prod.nomProduit} (Quantité saisie: ${prod.quantiteSaisie}, Reste à livrer: ${prod.reste})\n`;
                    });
        
                    Swal.fire({
                        icon: 'warning',
                        title: 'Attention',
                        text: message,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: data.message || "Échec de l'enregistrement.",
                    });
                }
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur de connexion au serveur.',
            });
            console.error("Erreur :", error);
        });
        
    });

    function saveProduct(idP) {
     
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        if (!productItem) {
            console.error("Produit non trouvé pour l'ID: " + idP);
            return;
        }
    
      
        const quantityInput = productItem.querySelector('input[type="number"]');
        const prix = document.getElementById("prix" + idP).value.trim();
        const unite = document.getElementById("unite" + idP).value.trim();
        const quantity = quantityInput.value.trim();
    
    
        if (!validateInputs(quantityInput, quantity, prix, unite)) {
            return;
        }
    
   
        const formData = prepareFormData(idP, prix, quantity, unite);
    
     
        sendProductData(formData);
    }
    

    function validateInputs(quantityInput, quantity, prix, unite) {
       
        if (quantityInput.disabled || !quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité invalide',
                text: 'Veuillez entrer une quantité valide supérieure à 0.'
            });
            return false;
        }
    
        
        if (!prix || parseFloat(prix) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Prix invalide',
                text: 'Veuillez entrer un prix valide supérieur à 0.'
            });
            return false;
        }
    
    
        if (!unite) {
            Swal.fire({
                icon: 'warning',
                title: 'Unité manquante',
                text: 'Veuillez spécifier une unité.'
            });
            return false;
        }
    
        return true;
    }
    
    function prepareFormData(idP, prix, quantity, unite) {
        const formData = new FormData();
        formData.append('option', 23);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('prix', prix);
        formData.append('quantity', parseFloat(quantity));
        formData.append('unite', unite);
        return formData;
    }
    
    function sendProductData(formData) {
     
        Swal.fire({
            title: 'Enregistrement en cours...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Enregistrement réussi.',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: data.message || "Échec de l'enregistrement."
                });
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur de connexion au serveur.'
            });
        });
    }

    function modifyProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const quantityInput = productItem.querySelector('input[type="number"]');
        const currentQuantity = quantityInput.value;
        const current_price = document.getElementById("prix" + idP).value;
        const current_unite = document.getElementById("unite" + idP).value;
        let reste = document.getElementById("reste" + idP).innerHTML;
    
   
        if (currentQuantity === null || current_price == null || current_unite == null) {
            return;
        } else if (currentQuantity.trim() === "" || current_price.trim() == '' || current_unite.trim() == '') {
          
            Swal.fire({
                icon: 'warning',
                title: 'Entrée vide',
                text: "L'entrée est vide. Veuillez entrer une valeur.",
            });
        } else if (isNaN(currentQuantity) || parseFloat(currentQuantity) < 0 || isNaN(current_price) || parseFloat(current_price) < 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Valeur invalide',
                text: "Veuillez entrer un nombre valide supérieur à 0.",
            });
        } else if (currentQuantity > reste) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité invalide',
                text: "Impossible de poursuivre cette action ! L'intégralité du produit a été livrée.",
            });
        } else {
            const formData = new FormData();
            formData.append('option', 25);
            formData.append('idBL', idBL);
            formData.append('idP', idP);
            formData.append('quantity', currentQuantity);
            formData.append('prix', current_price);
            formData.append('unite', current_unite);
    
            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: 'Modification réussie.',
                    }).then(() => {
                        quantityInput.value = currentQuantity;
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: "Erreur : " + data.message,
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur de connexion avec le serveur.',
                });
                console.error("Erreur :", error);
            });
        }
    }
    
    document.getElementById('bonForm').addEventListener('submit', function (event) {
        event.preventDefault(); // Empêche la soumission du formulaire
    });

    // Fonction pour supprimer un produit
    function deleteProduct(idP, quantity, unite) {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Vous allez supprimer ce produit.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const xhr = new XMLHttpRequest();
                xhr.open(
                    "GET",
                    `../../controlleur/controlleur.php?option=26&idBL=${idBL}&idP=${idP}&quantity=${quantity}&unite=${unite}`,
                    true
                );
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Suppression réussie',
                                text: 'Le produit a été supprimé avec succès.',
                            }).then(() => {
                                const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
                                productItem.parentElement.removeChild(productItem);
                                location.reload();
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Erreur',
                                text: "Erreur : " + response.message,
                            });
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur de requête',
                            text: 'Une erreur est survenue lors de la requête.',
                        });
                    }
                };
                xhr.onerror = function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur de connexion',
                        text: 'Erreur de connexion au serveur.',
                    });
                };
                xhr.send();
            } else {
                Swal.fire({
                    icon: 'info',
                    title: 'Action annulée',
                    text: 'La suppression a été annulée.',
                });
            }
        });
    }
    

    // Fonction pour récupérer la quantité restante
    function get_reste(params1, param2) {
        let input_check = document.getElementById('prod' + params1);
        let input_qte = document.getElementById(params1);
        if (input_check.checked) {
            xhr = new XMLHttpRequest();
            xhr.open('GET', `../../controlleur/controlleur.php?option=32&idP=${params1}&idbc=${param2}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    if (data.success) {
                        input_qte.value = data.reste;
                    } else {
                        alert('Erreur : ' + data.message);
                    }
                } else {
                    alert('Erreur');
                }
            };
            xhr.send();
            xhr.onerror = function () {
                alert("Erreur de connexion au serveur.");
            };
        } else {
            input_qte.value = '';
        }
    }
});