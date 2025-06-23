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
                
                    const quantiteLivree = parseFloat(product.quantite_livree ?? 0);
                    const resteALivrer = parseFloat(product.quantite) - quantiteLivree;
                
                    let boutons = '';
                    if (quantiteLivree > 0) {
                        boutons = `
                            <button type="button" class="modify" data-idp="${product.idP}" style="background-color: orange;" disabled>Modifier</button>
                            <button type="button" class="delete" data-idp="${product.idP}" style="background-color: red;" disabled>Retirer</button>
                        `;
                    } else {
                        boutons = `<button type="button" class="partielle-save" data-idp="${product.idP}" disabled>Enregistrer</button>`;
                    }
                
                    productItem.innerHTML = `
                        <input type="checkbox" id="prod-${product.idP}" name="products[]" value="${product.idP}">
                        <label for="prod-${product.idP}" class="product-name"><b>${product.nomproduit} <br>
                            (Commandé: ${product.quantite})</b></label>
                        <div><small>Déjà livré : ${quantiteLivree} / Reste : ${resteALivrer}</small></div>
                
                        <span id="quantite_cmd${product.idP}" hidden="true">${product.quantite}</span>
                        <input type="number" name="quantity[]" min="0" id="${product.idP}" value="${quantiteLivree > 0 ? quantiteLivree : ''}" disabled placeholder="Quantité Reçue">
                
                        <label for="prod${product.idP}"><b>Unité</b></label>
                        <select name="unite[]" class="product-unite" id="unite${product.idP}" disabled>
                            <option value="">-- unité --</option>
                            <option value="pièce" ${product.unite === 'pièce' ? 'selected' : ''}>pièce</option>
                            <option value="carton" ${product.unite === 'carton' ? 'selected' : ''}>carton</option>
                            <option value="boîte" ${product.unite === 'boîte' ? 'selected' : ''}>boîte</option>
                        </select>
                
                        <input type="hidden" name="idBL" value="${idBL}">
                        ${boutons}
                    `;
                    productList.appendChild(productItem);
                });                

                // Gestion de l'activation des champs quand on coche
                document.querySelectorAll('.product-item input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', function () {
                        const productId = this.value;
                        const quantityInput = document.getElementById(productId);
                        const uniteInput = document.getElementById('unite' + productId);
                        const saveBtn = this.parentElement.querySelector('.partielle-save');
                        const modifyBtn = this.parentElement.querySelector('.modify');
                        const deleteBtn = this.parentElement.querySelector('.delete');

                        const isChecked = this.checked;

                        quantityInput.disabled = !isChecked;
                        uniteInput.disabled = !isChecked;
                        if (saveBtn) saveBtn.disabled = !isChecked;
                        if (modifyBtn) modifyBtn.disabled = !isChecked;
                        if (deleteBtn) deleteBtn.disabled = !isChecked;
                    });
                });

                // Rattacher les événements aux boutons
                document.querySelectorAll('.partielle-save').forEach(button => {
                    button.addEventListener('click', function () {
                        const productId = this.getAttribute('data-idp');
                        saveProduct(productId);
                    });
                });
                document.querySelectorAll('.modify').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.getAttribute('data-idp');
                        modifyProduct(id, idBL);
                    });
                });
                document.querySelectorAll('.delete').forEach(button => {
                    button.addEventListener('click', function () {
                        const id = this.getAttribute('data-idp');
                        deleteProduct(id);
                    });
                });
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));

    function saveProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        if (!productItem) return;

        const checkbox = productItem.querySelector('input[type="checkbox"]');
        const quantityInput = productItem.querySelector('input[type="number"]');
        const uniteInput = productItem.querySelector('select.product-unite');

        if (!checkbox.checked) {
            alert("Veuillez sélectionner le produit avant d'entrer une quantité.");
            return;
        }

        const quantity = quantityInput.value.trim();
        const unite = uniteInput.value.trim();
        const qte_cmd = parseFloat(document.getElementById('quantite_cmd' + idP).innerText || 0);
        const qte_livree = parseFloat(productItem.querySelector('small')?.innerText.match(/Déjà livré\s*:\s*(\d+(\.\d+)?)/)?.[1] || 0);
        const reste = qte_cmd - qte_livree;

        if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0 || parseFloat(quantity) > reste) {
            alert("Veuillez entrer une quantité valide.");
            return;
        }

        const mode = "remplacement";

        const formData = new FormData();
        formData.append('option', 23);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('unite', unite);
        formData.append('mode', mode);

        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Succès', text: data.message });

                const modifyButton = document.createElement('button');
                modifyButton.textContent = 'Modifier';
                modifyButton.className = 'modify';
                modifyButton.style.backgroundColor = 'orange';
                modifyButton.addEventListener('click', function () {
                    modifyProduct(idP, idBL);
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Retirer';
                deleteButton.className = 'delete';
                deleteButton.style.backgroundColor = 'red';
                deleteButton.addEventListener('click', function () {
                    deleteProduct(idP, quantity);
                });

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

    function modifyProduct(idP, idBL) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const quantityInput = productItem.querySelector('input[type="number"]');
        const uniteInput = productItem.querySelector('select.product-unite');
    
        const quantity = quantityInput.value.trim();
        const unite = uniteInput.value.trim();
        const qte_cmd = parseFloat(document.getElementById('quantite_cmd' + idP).innerText || 0);
        const qte_livree = parseFloat(quantity); // quantité mise à jour
        const mode = "remplacement";
    
        if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0 || parseFloat(quantity) > qte_cmd) {
            Swal.fire({ icon: 'warning', title: 'Quantité invalide', text: 'Veuillez entrer une valeur correcte.' });
            return;
        }
    
        const formData = new FormData();
        formData.append('option', 25);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
        formData.append('unite', unite);
        formData.append('mode', mode);
    
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Produit modifié.' });
    
                const infoText = productItem.querySelector('small');
                if (infoText) {
                    infoText.innerText = `Déjà livré : ${quantity} / Reste : ${qte_cmd - quantity}`;
                }
    
                // ✅ Ne pas supprimer ou recréer les boutons — ils sont déjà présents
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
            }
        })
        .catch(error => {
            Swal.fire({ icon: 'error', title: 'Erreur serveur', text: 'Erreur de connexion.' });
        });
    }    

    function deleteProduct(idP, quantity) {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Vous allez retirer ce produit.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, retirer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`../../controlleur/controlleur.php?option=26&idBL=${idBL}&idP=${idP}&quantity=${quantity}`, {
                    method: 'GET',
                    dataType: 'json'
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Produit retiré.' }).then(() => {
                            const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
                            productItem.parentElement.removeChild(productItem);
                            location.reload();
                        });
                    } else {
                        Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
                    }
                })
                .catch(error => {
                    Swal.fire({ icon: 'error', title: 'Erreur de connexion', text: 'Une erreur est survenue.' });
                });
            }
        });
    }

    document.getElementById('enregistrerTout').addEventListener('click', function () {
        const promises = [];
        const invalidProducts = [];
    
        document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
            const productItem = checkbox.closest('.product-item');
            const productId = checkbox.value;
            const quantityInput = productItem.querySelector('input[type="number"]');
            const uniteInput = productItem.querySelector('.product-unite');
            const infoText = productItem.querySelector('small');
            const quantity = quantityInput.value.trim();
            const unite = uniteInput.value.trim();
            const productName = productItem.querySelector('.product-name').textContent;
    
            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
                invalidProducts.push(productName);
                return;
            }
    
            const qte_cmd = parseFloat(document.getElementById('quantite_cmd' + productId).innerText || 0);
            const deja_livree = parseFloat(infoText?.innerText.match(/Déjà livré\s*:\s*(\d+(\.\d+)?)/)?.[1] || 0);
            const mode = "remplacement";
    
            const formData = new FormData();
            formData.append('idBL', idBL);
            formData.append('idBC', idBC);
            formData.append('idP', productId);
            formData.append('quantity', quantity);
            formData.append('unite', unite);
            formData.append('mode', mode);
    
            if (deja_livree > 0) {
                formData.append('option', 25); // Modifier
            } else {
                formData.append('option', 23); // Ajouter
            }
    
            const req = fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                body: formData
            }).then(res => res.json());
    
            promises.push(req);
        });
    
        if (invalidProducts.length > 0) {
            alert("Veuillez entrer une Quantité valide pour les produits suivants :\n" + invalidProducts.join(', '));
            return;
        }
    
        if (promises.length === 0) {
            alert("Aucun produit sélectionné.");
            return;
        }
    
        Promise.all(promises)
            .then(results => {
                const erreurs = results.filter(r => !r.success);
                if (erreurs.length > 0) {
                    alert("Certaines opérations ont échoué.");
                    console.warn(erreurs);
                } else {
                    Swal.fire({ icon: 'success', title: 'Succès', text: 'Tous les produits ont été enregistrés.' })
                        .then(() => window.location.href = "Liste_BL.php");
                }
            })
            .catch(error => {
                alert("Erreur lors de l’enregistrement.");
                console.error(error);
            });
    });    

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
});