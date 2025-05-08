document.addEventListener('DOMContentLoaded', function () {
    const idBC = new URLSearchParams(window.location.search).get('idBC');
    const idBL = new URLSearchParams(window.location.search).get('idBL');
    const nomBL = new URLSearchParams(window.location.search).get('nomBL');

    fetch(`../../controlleur/controlleur.php?option=24&idBC=${idBC}&idBL=${idBL}`)
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
                    productItem.innerHTML = `
                        <input type="checkbox" id="prod-${product.idP}" name="products[]" value="${product.idP}">
                        <label for="prod-${product.idP}" class="product-name"><b>${product.nomproduit} <br>
                            (Commander: ${product.quantite})</b></label>
                            
                        <span id="quantite_cmd${product.idP}" hidden="true">${product.quantite}</span>
                        <input type="number" name="quantity[]" min="0" id="${product.idP}" disabled placeholder="Quantite Recus">
                        <label for="prod-${product.idP}"><b>Prix Unitaire (CFA)</b></label>
                        <input type="number" name="prix[]" class="product-price" min="0" id="prix${product.idP}" disabled placeholder="Prix Produit">

 <label for="prod${product.idP}"><b>unité</b></label>
                        <input type="text" name="unite[]" class="product-unite" id="unite${product.idP}" disabled placeholder="(piece,caroton,boîte)">

                        
                        <input type="hidden" name="idBL" value="${idBL}">
                        <button type="button" class="partielle-save" data-idp="${product.idP}">Enregistrer</button>
                    `;
                    productList.appendChild(productItem);
                });

                // Activer/désactiver les champs de quantité et de prix en fonction de la sélection du produit
                document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', function () {
                        const productId = this.value;
                        const quantityInput = document.getElementById(productId);
                        const priceInput = document.getElementById('prix' + productId);
                        const uniteInput = document.getElementById('unite' + productId);

                        if (this.checked) {
                            quantityInput.disabled = false;
                            priceInput.disabled = false;
                            uniteInput.disabled = false;
                        } else {
                            quantityInput.disabled = true;
                            priceInput.disabled = true;
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
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));

    function saveProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        if (!productItem) {
            console.error("Produit non trouvé pour l'ID: " + idP);
            return;
        }
        const checkbox = productItem.querySelector('input[type="checkbox"]');
        const quantityInput = productItem.querySelector('input[type="number"]');
        const uniteInput = productItem.querySelector('input[type="text"]');
        const prix = document.getElementById('prix' + idP).value;
        let coherance_avec_Q_cmd = document.getElementById('quantite_cmd' + idP).innerText;

        if (!checkbox.checked) {
            alert("Veuillez sélectionner le produit avant d'entrer une quantité.");
            return;
        }

        const quantity = quantityInput.value.trim();
        const unite = uniteInput.value.trim();
        if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0 || quantity > coherance_avec_Q_cmd) {
            alert("Veuillez entrer une quantité valide.");
            return;
        }

        if (prix.trim() <= 0) {
            alert("Veuillez entrer un Prix valide.");
            return;
        }

        const formData = new FormData();
        formData.append('option', 23);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('unite', unite);
        formData.append('prix', prix);

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
                    text: data.message,
                });

                // Créer les boutons "Modifier" et "Supprimer"
                const modifyButton = document.createElement('button');
                modifyButton.textContent = 'Modifier';
                modifyButton.className = 'modify';
                modifyButton.style.backgroundColor = 'orange';
                modifyButton.addEventListener('click', function () {
                    modifyProduct(idP, idBL, quantity, prix,unite);
                });
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Supprimer';
                deleteButton.className = 'delete';
                deleteButton.style.backgroundColor = 'red';
                deleteButton.addEventListener('click', function () {
                    deleteProduct(idP, quantity,unite);
                });
                // Remplacer le bouton "Enregistrer" par les nouveaux boutons
                const saveButton = productItem.querySelector('.partielle-save');
                productItem.removeChild(saveButton);
                productItem.appendChild(modifyButton);
                productItem.appendChild(deleteButton);
            } else if (data.reste) {
                alert("Erreur : La quantité dépasse la quantité restante (" + data.reste + ").");
            } else {
                alert("Erreur : " + (data.message || "Échec de l'enregistrement."));
            }
        })
        .catch(error => {
            alert("Erreur de connexion au serveur.");
            console.error('Erreur lors de la soumission du formulaire :', error);
        });
    }

   
    document.getElementById('enregistrerTout').addEventListener('click', function () {
        const selectedProducts = [];
        const quantities = [];
        const price = [];
        const unites = [];
        const invalidProducts = [];
        const invalidProducts_price = [];

        document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
            const productId = checkbox.value;
            const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');
          
            const quantity = quantityInput.value.trim();
            
            const productName = checkbox.parentElement.querySelector('.product-name').textContent;
            const prix = checkbox.parentElement.querySelector('.product-price').value;
            const unitee= checkbox.parentElement.querySelector('.product-unite').textContent;

            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
                invalidProducts.push(productName);
            } else {
                selectedProducts.push(productId);
                quantities.push(quantity);
                price.push(prix);
                unites.push(unitee);
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

        const data = {
            products: selectedProducts,
            quantity: quantities,
            unite: unites,
            prix: price,
            nomBL: nomBL,
            idBC: idBC,
            idBL: idBL,
            enregistrerTout: true,
        };

        console.log("Données envoyées : ", JSON.stringify(data)); 

      
    fetch('../../controlleur/controlleur.php?option=27', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Enregistrement réussi.");
                window.location.href = "Liste_BL.php";
            } else {
                if (data.produitsIncoherents && data.produitsIncoherents.length > 0) {
                    let message = "Incohérence de quantités pour les produits suivants :\n";
                    data.produitsIncoherents.forEach(prod => {
                        message += `${prod.nomProduit} (Quantité saisie: ${prod.quantiteSaisie}, Reste à livrer: ${prod.reste})\n`;
                    });
                    alert(message);
                } else {
                    alert("Erreur : " + (data.message || "Échec de l'enregistrement."));
                }
            }
        })
        .catch(error => {
            console.error("Erreur de connexion au serveur.");
            alert("Erreur de connexion au serveur.");
        });
    });

    function modifyProduct(idP, idBL) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const quantityInput = productItem.querySelector('input[type="number"]');
        const uniteInput = productItem.querySelector('input[type="text"]');
        const currentQuantity = quantityInput.value;
        const currentUnite = uniteInput.value;
        const current_price = document.getElementById("prix" + idP).value;
        let coherance_avec_Q_cmd = document.getElementById('quantite_cmd' + idP).innerText;
    
        if (currentQuantity === null || current_price == null) {
            return;
        } else if (currentQuantity.trim() === "" || current_price.trim() == '') {
            Swal.fire({
                icon: 'warning',
                title: 'Entrée invalide',
                text: 'L\'entrée est vide. Veuillez entrer une valeur.',
            });
        } else if (isNaN(currentQuantity) || parseFloat(currentQuantity) < 0 || isNaN(current_price) || parseFloat(current_price) < 0 || currentQuantity > coherance_avec_Q_cmd) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité invalide',
                text: 'Veuillez entrer un nombre valide supérieur à 0.',
            });
        } else {
            const formData = new FormData();
            formData.append('option', 25);
            formData.append('idBL', idBL);
            formData.append('idP', idP);
            formData.append('quantity', currentQuantity);
            formData.append('prix', current_price);
            formData.append('unite', currentUnite);
    
            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Modification réussie',
                        text: 'Les modifications ont été enregistrées avec succès.',
                    }).then(() => {
                        quantityInput.value = currentQuantity;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur : ' + data.message,
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur serveur',
                    text: 'Erreur de connexion avec le serveur.',
                });
                console.error('Erreur lors de la modification du produit :', error);
            });
        }
    }
    

    function deleteProduct(idP, quantity) {
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
                fetch(`../../controlleur/controlleur.php?option=26&idBL=${idBL}&idP=${idP}&quantity=${quantity}&unite=${unite}`, {
                    method: 'GET',
                    dataType: 'json'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
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
                            text: "Erreur : " + data.message,
                        });
                    }
                })
                .catch(error => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur de connexion',
                        text: 'Une erreur est survenue lors de la requête.',
                    });
                    console.error('Erreur lors de la suppression du produit :', error);
                });
            }
        });
    }
    

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
});