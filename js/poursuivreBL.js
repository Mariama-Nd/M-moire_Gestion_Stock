document.addEventListener('DOMContentLoaded', function () {
    const idBC = new URLSearchParams(window.location.search).get('idBC');
    const idBL = new URLSearchParams(window.location.search).get('idBL');
    const nomBL = new URLSearchParams(window.location.search).get('nomBL');

    fetch(`../../controlleur/controlleur.php?option=30&idBL=${idBL}`)
        .then(response => response.json())
        .then(data => {
            const productList = document.getElementById('productList');
            if (!data.success || !Array.isArray(data.products)) {
                productList.innerHTML = `<p>${data.message || 'Erreur chargement.'}</p>`;
                return;
            }

            data.products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'product-item card mb-3 shadow-sm';
                productItem.dataset.idp = product.idP;
                productItem.innerHTML = `
                    <span id="idPorduit${product.idP}" hidden="true">${product.idP}</span>
                    <span id="idBLproduit${product.idP}" hidden="true">${idBL}</span>
                    <span id="quantite_product${product.idP}" hidden="true">${product.quantite || 0}</span>
                    <span id="unite_product${product.idP}" hidden="true">${product.unite || ''}</span>
                    <span id="reste${product.idP}" hidden="true">${product.reste}</span>

                    <div class="product-card-body">
                        <div class="product-info">
                            <div class="product-name">${product.nomproduit}</div>
                            <div class="product-meta">Reste : ${product.reste}</div>
                            <div class="product-stock">(Stock actuel : ${product.Stock_actuel || 'N/A'})</div>
                        </div>
                        <div class="product-fields">
                            <div class="form-group">
                                <label>Quantité</label>
                                <input type="number" name="quantity[]" id="quantity${product.idP}" class="form-control" />
                            </div>
                            <div class="form-group">
                                <label>Unité</label>
                                <select name="unite[]" id="unite${product.idP}" class="form-control">
                                    <option value="">-- unité --</option>
                                    <option value="pièce">pièce</option>
                                    <option value="boîte">boîte</option>
                                    <option value="carton">carton</option>
                                </select>
                            </div>
                        </div>
                        <div class="product-actions">
                            <button type="button" class="btn btn-success btn-sm ${product.reste > 0 ? 'add' : 'modify'}">
                                ${product.reste > 0 ? '➕ Enregistrer' : '✏️ Modifier'}
                            </button>
                            <button type="button" class="btn btn-danger btn-sm delete">Supprimer</button>
                        </div>
                    </div>
                `;
                productList.appendChild(productItem);
            });
            addEventListeners();
        })
        .catch(error => {
            console.error('Erreur chargement produits :', error);
        });

    function addEventListeners() {
        document.querySelectorAll('.modify').forEach(button => {
            button.addEventListener('click', () => {
                const idP = button.closest('.product-item').dataset.idp;
                replaceProduct(idP);
            });
        });

        document.querySelectorAll('.add').forEach(button => {
            button.addEventListener('click', () => {
                const idP = button.closest('.product-item').dataset.idp;
                addProduct(idP);
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', () => {
                const idP = button.closest('.product-item').dataset.idp;
                const quantity = document.getElementById('quantity' + idP).value;
                const unite = document.getElementById('unite' + idP).value;
                deleteProduct(idP, quantity, unite);
            });
        });
    }

    document.getElementById('enregistrerTout').addEventListener('click', () => {
        const selectedProducts = [], quantities = [], unites = [], invalidProducts = [];

        document.querySelectorAll('.product-item').forEach(item => {
            const idP = item.dataset.idp;
            const quantity = parseFloat(document.getElementById('quantity' + idP).value);
            const unite = document.getElementById('unite' + idP).value;

            if (!isNaN(quantity) && quantity > 0 && unite) {
                selectedProducts.push(idP);
                quantities.push(quantity);
                unites.push(unite);
            } else {
                const nomProduit = item.querySelector('.product-name')?.textContent || 'Produit';
                invalidProducts.push(nomProduit);
            }
        });

        if (invalidProducts.length > 0) {
            Swal.fire({ icon: 'warning', title: 'Champs invalides', html: invalidProducts.join(', ') });
            return;
        }

        const formData = new FormData();
        formData.append('option', 33);
        formData.append('products', JSON.stringify(selectedProducts));
        formData.append('quantity', JSON.stringify(quantities));
        formData.append('unite', JSON.stringify(unites));
        formData.append('nomBL', nomBL);
        formData.append('idBC', idBC);
        formData.append('idBL', idBL);
        formData.append('enregistrerTout', true);

        fetch('../../controlleur/controlleur.php', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Succès', text: 'Enregistrement réussi' }).then(() => location.reload());
                } else {
                    Swal.fire({ icon: 'error', title: 'Erreur', text: data.message || 'Echec' });
                }
            })
            .catch(err => {
                console.error('Erreur POST :', err);
                Swal.fire({ icon: 'error', title: 'Erreur serveur' });
            });
    });

    function addProduct(idP) {
        const quantity = parseFloat(document.getElementById("quantity" + idP).value);
        const unite = document.getElementById("unite" + idP).value;
    
        if (isNaN(quantity) || quantity <= 0) {
            Swal.fire({ icon: 'warning', title: 'Champs requis', text: 'Veuillez remplir correctement la quantité.' });
            return;
        }
    
        const formData = new FormData();
        formData.append('option', 25);
        formData.append('idBL', idBL);
        formData.append('idBC', idBC);
        formData.append('idP', idP);
        formData.append('quantity', quantity);
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
