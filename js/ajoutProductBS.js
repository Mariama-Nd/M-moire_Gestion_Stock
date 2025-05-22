document.addEventListener('DOMContentLoaded', function () {
    const idBS = new URLSearchParams(window.location.search).get('idBon');
    const idEB = new URLSearchParams(window.location.search).get('expID');

    // Récupérer les produits de l'expression de besoin
    fetch(`../../controlleur/controlleur.php?option=72&idEB=${idEB}&idBS=${idBS}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {

                console.error('Erreur lors de la récupération des produits :', data.message);
            } else {
                const productList = document.getElementById('productList');
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item';
                    productItem.dataset.idp = product.idP;
                    const defaultUnite = (product.unite || "pièce").toLowerCase();
                    productItem.innerHTML = `
                        <div class="card mb-3 shadow-sm">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-12 col-md-4 mb-3">
                                        <div class="d-flex align-items-center">
                                            <input type="checkbox" 
                                                id="prod-${product.idP}" 
                                                name="products[]" 
                                                value="${product.idP}"
                                                class="form-check-input me-2">
                                            <label for="prod-${product.idP}" 
                                                class="product-name form-check-label">
                                                <b>${product.nomproduit}</b><br>
                                                <small class="text-muted">(Demandé: ${product.quantite})</small>
                                                <strong class="" style="color:red">(Stock: ${product.Stock_actuel})</strong>
                                            </label>
                                        </div>
                                    </div>
                    
                                    <div class="col-12 col-md-3 ">
                                        <span id="quantite_demande${product.idP}" hidden>${product.quantite}</span>
                                        <div class="form-group">
                                            <label class="form-label"><b>Quantité</b></label>
                                            <input type="number" 
                                                name="quantity[]" 
                                                min="0" 
                                                id="${product.idP}" 
                                                class="form-control"
                                                disabled 
                                                placeholder="Quantité à sortir">
                                        </div>
                                    </div>
                    
                                    <div class="col-12 col-md-3 ">
                                        <div class="form-group">
                                            <label class="form-label"><b>Unité</b></label>
                                            <select name="unite[]" 
                                                class="form-control product-unite" 
                                                id="unite${product.idP}" 
                                                disabled>
                                                <option value="pièce" ${defaultUnite === 'pièce' ? 'selected' : ''}>pièce</option>
                                                <option value="boîte" ${defaultUnite === 'boîte' ? 'selected' : ''}>boîte</option>
                                                <option value="carton" ${defaultUnite === 'carton' ? 'selected' : ''}>carton</option>
                                            </select>

                                        </div>
                                    </div>
                    
                                    <div class="col-12 col-md-2 ">
                                        <input type="hidden" name="idBS" value="${idBS}">
                                        <button type="button" 
                                            class="btn btn-primary partielle-save" 
                                            data-idp="${product.idP}">
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;                    
                    productList.appendChild(productItem);
                });

                // Gestion des checkboxes
                document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', function () {
                        const productId = this.value;
                        const quantityInput = document.getElementById(productId);
                        const uniteInput = document.getElementById('unite' + productId);

                        if (this.checked) {
                            quantityInput.disabled = false;
                            uniteInput.disabled = false;
                        } else {
                            quantityInput.disabled = true;
                            uniteInput.disabled = true;
                        }
                    });
                });

                // Enregistrer partiellement un produit
                document.querySelectorAll('.partielle-save').forEach(button => {
                    button.addEventListener('click', function () {
                        const productId = this.getAttribute('data-idp');
                        saveProduct(productId);
                    });
                });
            }
        })
        .catch(error => console.error('Erreur:', error));
        function validateProductInput(quantity, unite, quantiteDemandee) {
            // Vérification de la quantité
            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Veuillez entrer une quantité valide supérieure à 0.'
                });
                return false;
            }
        
            // Vérification par rapport à la quantité demandée
            if (parseFloat(quantity) > parseFloat(quantiteDemandee)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: `La quantité ne peut pas dépasser la quantité demandée (${quantiteDemandee}).`
                });
                return false;
            }
        
            // Vérification de l'unité
            if (!unite || unite.trim() === '') {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Veuillez spécifier une unité.'
                });
                return false;
            }
        
            // Si toutes les validations sont passées
            return true;
        }
    function saveProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        if (!productItem) return;

        const quantityInput = productItem.querySelector('input[type="number"]');
        const uniteInput = productItem.querySelector('select[name="unite[]"]');
        const quantity = quantityInput.value.trim();
        const unite = uniteInput.value;
        const quantiteDemandee = document.getElementById(`quantite_demande${idP}`).innerText;

        if (!validateProductInput(quantity, unite, quantiteDemandee)) return;

        const formData = new FormData();
        formData.append('option', 73);
        formData.append('idBS', idBS);
        formData.append('idEB', idEB);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('unite', unite);

        sendProductData(formData, productItem);
    }

   

    function sendProductData(formData, productItem) {
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => handleProductResponse(data, productItem))
        .catch(error => handleError(error));
    }

      function handleProductResponse(data, productItem) {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Produit enregistré avec succès'
            });

            // Créer les boutons Modifier et Supprimer
            const modifyButton = document.createElement('button');
            modifyButton.textContent = 'Modifier';
            modifyButton.className = 'modify-button';
            modifyButton.style.backgroundColor = 'orange';
            modifyButton.style.margin = '5px';
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Supprimer';
            deleteButton.className = 'delete-button';
            deleteButton.style.backgroundColor = 'red';
            deleteButton.style.margin = '5px';

            // Ajouter les événements aux boutons
            const idP = productItem.dataset.idp;
            modifyButton.addEventListener('click', () => modifyProduct(idP));
            deleteButton.addEventListener('click', () => deleteProduct(idP));

            // Remplacer le bouton Enregistrer par les nouveaux boutons
            const saveButton = productItem.querySelector('.partielle-save');
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';
            buttonContainer.appendChild(modifyButton);
            buttonContainer.appendChild(deleteButton);
            saveButton.replaceWith(buttonContainer);

            // Désactiver les inputs
            const inputs = productItem.querySelectorAll('input');
            inputs.forEach(input => input.disabled = true);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: data.message || 'Une erreur est survenue'
            });
        }
    }

    function handleError(error) {
        console.error('Erreur:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur est survenue lors de la communication avec le serveur'
        });
    }

    function modifyProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const quantityInput = productItem.querySelector('input[name="quantity[]"]');
        const uniteInput = productItem.querySelector('[name="unite[]"]');
        const quantiteDemandee = document.getElementById(`quantite_demande${idP}`).innerText;

        // Réactiver les inputs pour modification
        quantityInput.disabled = false;
        uniteInput.disabled = false;

        Swal.fire({
            title: 'Modifier le produit',
            showCancelButton: true,
            confirmButtonText: 'Enregistrer',
            cancelButtonText: 'Annuler',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                const newQuantity = quantityInput.value.trim();
                const newUnite = uniteInput.value.trim();

                if (!validateProductInput(newQuantity, newUnite, quantiteDemandee)) {
                    return false;
                }

                const formData = new FormData();
                formData.append('option', 72);
                formData.append('idBS', idBS);
                formData.append('idEB', idEB);
                formData.append('idP', idP);
                formData.append('quantity', newQuantity);
                formData.append('unite', newUnite);

                return fetch('../../controlleur/controlleur.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.success) throw new Error(data.message || 'Erreur de modification');
                    return data;
                });
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Modification réussie',
                    text: 'Les modifications ont été enregistrées'
                });
                quantityInput.disabled = true;
                uniteInput.disabled = true;
            } else {
                // Annulation - rétablir les inputs désactivés
                quantityInput.disabled = true;
                uniteInput.disabled = true;
            }
        });
    }

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
                    `../../controlleur/controlleur.php?option=80&idBS=${idBS}&idP=${idP}&quantity=${quantity}&unite=${unite}`,
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
    

     document.getElementById('enregistrerTout').addEventListener('click', function () {
        const selectedProducts = [];
        const quantities = [];
        const unites = [];
        const invalidProducts = [];
    
        // Sélectionner tous les produits cochés
        document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
            const productItem = checkbox.closest('.card'); // Remonter jusqu'à la carte parent
            const productId = checkbox.value;
            
            // Sélectionner les éléments dans le contexte de la carte
            const quantityInput = productItem.querySelector('input[name="quantity[]"]');
            const uniteInput = productItem.querySelector('select[name="unite[]"]');
            const productName = productItem.querySelector('.product-name').textContent;
            
            const quantity = quantityInput.value.trim();
            const unite = uniteInput.value.trim();
    
            // Validation de la quantité
            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
                invalidProducts.push(productName);
            } else {
                selectedProducts.push(productId);
                quantities.push(quantity);
                unites.push(unite);
            }
        });
    
        // Vérifications
        if (invalidProducts.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur de saisie',
                text: "Veuillez entrer une quantité valide pour les produits suivants :\n" + invalidProducts.join(', ')
            });
            return;
        }
    
        if (selectedProducts.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Attention',
                text: "Aucun produit sélectionné."
            });
            return;
        }
    
        // Préparation des données
        const data = {
            products: selectedProducts,
            quantity: quantities,
            unite: unites,
            idBS: idBS,
            idEB: idEB,
            enregistrerTout: true
        };
    
        // Envoi des données
        fetch('../../controlleur/controlleur.php?option=78', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Enregistrement réussi',
                    timer: 1500
                }).then(() => {
                    window.location.href = "Liste_bon_sortie.php";
                });
            } else {
                if (data.produitsIncoherents && data.produitsIncoherents.length > 0) {
                    let message = "Incohérence de quantités pour les produits suivants :\n";
                    data.produitsIncoherents.forEach(prod => {
                        message += `${prod.nomProduit} (Quantité saisie: ${prod.quantiteSaisie}, Stock disponible: ${prod.reste})\n`;
                    });
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: message
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: data.message || "Échec de l'enregistrement"
                    });
                }
            }
        })
        .catch(error => {
            console.error("Erreur:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur de connexion au serveur'
            });
        });
    });
});