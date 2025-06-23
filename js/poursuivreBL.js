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
                const dejaLivre = product.quantite_deja_livree > 0;
                const productItem = document.createElement('div');
                productItem.className = 'product-item card mb-3 shadow-sm';
                productItem.dataset.idp = product.idP;

                productItem.innerHTML = `
                    <span id="reste${product.idP}" hidden>${product.reste}</span>

                    <div class="product-card-body p-3">
                        <div class="product-info mb-2">
                            <div class="fw-bold fs-5 product-name">${product.nomproduit}</div>
                            <div class="text-muted">
                                Commandé : ${product.quantite_commandee} | 
                                Déjà livré : ${product.quantite_deja_livree} | 
                                Reste : ${product.reste}
                            </div>
                            <div class="fst-italic">Stock actuel : ${product.Stock_actuel ?? 'N/A'}</div>
                        </div>

                        <div class="product-fields row g-3 mb-2">
                            <div class="col-md-6">
                                <label>Quantité</label>
                                <input type="number" 
                                    class="form-control" 
                                    id="quantity${product.idP}" 
                                    value="${dejaLivre ? product.quantite_deja_livree : ''}" 
                                    data-quantite-initiale="${dejaLivre ? product.quantite_deja_livree : ''}" />
                            </div>
                            <div class="col-md-6">
                                <label>Unité</label>
                                <select id="unite${product.idP}" 
                                        class="form-select" 
                                        data-unite-initiale="${product.unite ?? ''}">
                                    <option value="">-- unité --</option>
                                    <option value="pièce" ${product.unite === 'pièce' ? 'selected' : ''}>pièce</option>
                                    <option value="boîte" ${product.unite === 'boîte' ? 'selected' : ''}>boîte</option>
                                    <option value="carton" ${product.unite === 'carton' ? 'selected' : ''}>carton</option>
                                </select>
                            </div>
                        </div>

                        <div class="product-actions">
                            <button type="button" class="btn btn-sm ${dejaLivre ? 'btn-primary modify' : 'btn-success add'}">
                                ${dejaLivre ? '✏️ Modifier' : '➕ Enregistrer'}
                            </button>
                            <button type="button" class="btn btn-sm btn-danger delete">Retirer</button>
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

    document.getElementById('enregistrerTout').addEventListener('click', function () {
        const idBL = new URLSearchParams(window.location.search).get('idBL');
        const idBC = new URLSearchParams(window.location.search).get('idBC');
    
        const selectedProducts = [], quantities = [], unites = [], invalidProducts = [];
    
        document.querySelectorAll('.product-item').forEach(item => {
            const idP = item.dataset.idp;
            const quantityInput = document.getElementById('quantity' + idP);
            const uniteInput = document.getElementById('unite' + idP);
    
            const quantity = parseFloat(quantityInput.value);
            const unite = uniteInput.value;
    
            const quantiteInitiale = parseFloat(quantityInput.dataset.quantiteInitiale);
            const uniteInitiale = uniteInput.dataset.uniteInitiale ?? '';
    
            const nomProduit = item.querySelector('.product-name')?.textContent || 'Produit';
    
            // Vérifier si une modification a été faite
            const quantiteChange = !isNaN(quantity) && quantity !== quantiteInitiale;
            const uniteChange = unite !== uniteInitiale;
    
            if (!quantiteChange && !uniteChange) return;
    
            let erreur = '';
    
            if (isNaN(quantity) || quantity <= 0) {
                erreur += 'Quantité invalide';
            }
    
            if ((!unite || unite === '') && uniteChange) {
                erreur += (erreur ? ' et ' : '') + 'Unité non sélectionnée';
            }
    
            if (erreur) {
                invalidProducts.push(`<strong>${nomProduit}</strong> : ${erreur}`);
            } else {
                selectedProducts.push(idP);
                quantities.push(quantity);
                unites.push(unite);
            }
        });
    
        if (invalidProducts.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs invalides détectés',
                html: invalidProducts.join('<br>')
            });
            return;
        }
    
        if (selectedProducts.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Aucune modification',
                text: 'Aucune donnée modifiée à enregistrer.'
            });
            return;
        }
    
        // Envoyer les données modifiées
        fetch('../../controlleur/controlleur.php?option=33', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idBL, idBC,
                produits: selectedProducts,
                quantites: quantities,
                unites: unites
            })
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Les modifications ont été enregistrées.'
                }).then(() => location.reload());
            } else if (res.erreurs && Array.isArray(res.erreurs)) {
                const html = res.erreurs.map(err =>
                    `<strong>${err.produit}</strong> - ${err.champ} : ${err.erreur}`
                ).join('<br>');
    
                Swal.fire({
                    icon: 'warning',
                    title: 'Incohérences détectées',
                    html
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: res.message || 'Une erreur est survenue.'
                });
            }
        })
        .catch(error => {
            console.error('Erreur fetch :', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de requête',
                text: 'Impossible d’enregistrer les données.'
            });
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
        const unite = document.getElementById("unite" + idP).value;
    
        if (isNaN(quantity) || quantity <= 0 || unite === '') {
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
        formData.append('mode', 'remplacement'); // mode remplacement
    
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
