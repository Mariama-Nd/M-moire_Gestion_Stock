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
                    productItem.className = 'product-item card mb-3 shadow-sm';
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
                            <select name="unite[]" id="unite${product.idP}" class="form-control">
                                <option value="">-- unité --</option>
                                <option value="pièce" ${product.unite === 'pièce' ? 'selected' : ''}>pièce</option>
                                <option value="carton" ${product.unite === 'carton' ? 'selected' : ''}>carton</option>
                                <option value="boîte" ${product.unite === 'boîte' ? 'selected' : ''}>boîte</option>
                            </select>
                        </div>

                        <div class="d-flex justify-content-between">
                            <button type="button" class="btn ${product.reste > 0 ? 'btn-success' : 'btn-warning'} ${product.reste > 0 ? 'add' : 'modify'}">
                                ${product.reste > 0 ? 'Enregistrer' : 'Modifier'}
                            </button>
                            <button type="button" class="btn btn-danger delete">Retirer</button>
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

    function addEventListeners() {
        document.querySelectorAll('.modify').forEach(button => {
            button.addEventListener('click', function () {
                const productItem = button.closest('.product-item');
                const idP = productItem.getAttribute('data-idp');
                replaceProduct(idP);
            });
        });

        document.querySelectorAll('.add').forEach(button => {
            button.addEventListener('click', function () {
                const productItem = button.closest('.product-item');
                const idP = productItem.getAttribute('data-idp');
                addProduct(idP);
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function () {
                const productItem = button.closest('.product-item');
                const idP = productItem.getAttribute('data-idp');
                const quantity = document.getElementById('quantity' + idP).value;
                const unite = document.getElementById('unite' + idP).value;
                deleteProduct(idP, quantity, unite);
            });
        });
    }

    document.getElementById('enregistrerTout').addEventListener('click', function () {
        const selectedProducts = [];
        const quantities = [];
        const prices = [];
        const unites = [];
        const invalidProducts = [];
    
        document.querySelectorAll('.product-item').forEach(item => {
            const idP = item.dataset.idp;
            const quantityInput = document.getElementById('quantity' + idP);
            const prixInput = document.getElementById('prix' + idP);
            const uniteInput = document.getElementById('unite' + idP);
    
            const quantity = parseFloat(quantityInput.value);
            const prix = parseFloat(prixInput.value);
            const unite = uniteInput.value;
    
            // Valeurs initiales
            const initialQuantite = parseFloat(item.querySelector('#quantite_product' + idP)?.textContent || 0);
            const initialPrix = parseFloat(item.querySelector('#prix_product' + idP)?.textContent || 0);
            const initialUnite = item.querySelector('#unite_product' + idP)?.textContent || "";
    
            // Vérifier si une modification a été faite
            const hasChanged = (
                quantity !== initialQuantite ||
                prix !== initialPrix ||
                unite !== initialUnite
            );
    
            if (hasChanged) {
                if (isNaN(quantity) || quantity <= 0 || isNaN(prix) || prix <= 0 || !unite) {
                    const nomProduit = item.querySelector('.card-title')?.textContent || 'Produit';
                    invalidProducts.push(nomProduit);
                } else {
                    selectedProducts.push(idP);
                    quantities.push(quantity);
                    prices.push(prix);
                    unites.push(unite);
                }
            }
        });
    
        if (invalidProducts.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs invalides',
                html: `Veuillez corriger les champs suivants :<br><b>${invalidProducts.join(', ')}</b>`,
            });
            return;
        }
    
        if (selectedProducts.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Aucune modification détectée',
                text: "Aucun produit n'a été modifié.",
            });
            return;
        }
    
        const formData = new FormData();
        formData.append('option', 33);
        formData.append('products', JSON.stringify(selectedProducts));
        formData.append('quantity', JSON.stringify(quantities));
        formData.append('prix', JSON.stringify(prices));
        formData.append('unite', JSON.stringify(unites));
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
                    text: 'Produits modifiés avec succès.',
                }).then(() => {
                    location.reload();
                });
            } else {
                if (data.produitsIncoherents && data.produitsIncoherents.length > 0) {
                    let message = "Incohérence de quantités pour les produits suivants :\n";
                    data.produitsIncoherents.forEach(prod => {
                        message += `${prod.nomProduit} (Quantité saisie: ${prod.quantiteSaisie}, Reste à livrer: ${prod.reste})\n`;
                    });
                    Swal.fire({ icon: 'warning', title: 'Attention', text: message });
                } else {
                    Swal.fire({ icon: 'error', title: 'Erreur', text: data.message || "Échec de l'enregistrement." });
                }
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
            Swal.fire({ icon: 'error', title: 'Erreur serveur', text: 'Erreur de connexion au serveur.' });
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

    function addProduct(idP) {
        const quantity = parseFloat(document.getElementById("quantity" + idP).value);
        const prix = parseFloat(document.getElementById("prix" + idP).value);
        const unite = document.getElementById("unite" + idP).value;

        if (isNaN(quantity) || quantity <= 0 || isNaN(prix) || prix <= 0 || unite === '') {
            Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'Veuillez remplir correctement les champs.' });
            return;
        }

        const formData = new FormData();
        formData.append('option', 25);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('prix', prix);
        formData.append('unite', unite);

        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Succès', text: 'Quantité mise à jour.' }).then(() => location.reload());
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Erreur serveur', text: 'Impossible de traiter la requête.' });
        });
    }

    function replaceProduct(idP) {
        const quantity = parseFloat(document.getElementById("quantity" + idP).value);
        const prix = parseFloat(document.getElementById("prix" + idP).value);
        const unite = document.getElementById("unite" + idP).value;

        if (isNaN(quantity) || quantity <= 0 || isNaN(prix) || prix <= 0 || unite === '') {
            Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'Veuillez remplir correctement les champs.' });
            return;
        }

        const formData = new FormData();
        formData.append('option', 25);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('prix', prix);
        formData.append('unite', unite);
        formData.append('mode', 'remplacement'); // pour indiquer au PHP que c’est une logique remplacement

        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Modification', text: 'Mise à jour réussie.' }).then(() => location.reload());
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
            }
        })
        .catch(err => {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Erreur serveur', text: 'Impossible de traiter la requête.' });
        });
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
