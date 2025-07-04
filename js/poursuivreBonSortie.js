document.addEventListener('DOMContentLoaded', function () {
    const idBS = new URLSearchParams(window.location.search).get('idBon');
    const idEB = new URLSearchParams(window.location.search).get('expID');

    // Récupération des produits déjà livrés ou en cours
    fetch(`../../controlleur/controlleur.php?option=74&idBS=${idBS}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const productList = document.getElementById('productListScrollable');
                data.products.forEach(product => {
                    const productItem = document.createElement('div');
                    productItem.className = 'product-item card mb-3 shadow-sm';
                    productItem.dataset.idp = product.idP;
                    productItem.dataset.quantiteTotal = product.quantite_eb ?? 0;

                    productItem.innerHTML = `
                        <div class="card-body d-flex align-items-center justify-content-between flex-wrap gap-4 p-3 border rounded bg-light">
                            <div class="form-check me-2">
                                <input class="form-check-input" type="checkbox" name="products[]" id="prod${product.idP}" value="${product.idP}">
                            </div>

                            <div class="product-info flex-grow-1">
                                <div class="product-name h5 fw-semibold mb-1">${product.nomproduit}</div>
                                <div class="d-flex gap-4 flex-wrap fs-6">
                                    <span class="text-danger" id="reste${product.idP}">Reste : <strong>${product.reste}</strong></span>
                                    <span class="text-purple">Stock actuel : <strong>${product.Stock_actuel}</strong></span>
                                </div>
                            </div>

                            <div class="form-group d-flex flex-column">
                                <label class="form-label mb-1 fw-semibold">Quantité</label>
                                <input type="number" name="quantity[]" min="0" id="quantity${product.idP}" class="form-control" disabled>
                            </div>

                            <div class="form-group d-flex flex-column">
                                <label class="form-label mb-1 fw-semibold">Unité</label>
                                <select name="unite[]" id="unite${product.idP}" class="form-select" disabled>
                                    <option value="pièce" ${product.unite === 'pièce' ? 'selected' : ''}>pièce</option>
                                    <option value="boîte" ${product.unite === 'boîte' ? 'selected' : ''}>boîte</option>
                                    <option value="carton" ${product.unite === 'carton' ? 'selected' : ''}>carton</option>
                                </select>
                            </div>

                            <div class="d-flex gap-2 align-items-end">
                                <button type="button" class="btn ${product.reste > 0 ? 'btn-success' : 'btn-primary'} px-3 action-btn"
                                    data-idp="${product.idP}" data-reste="${product.reste}">
                                    <i class="bi ${product.reste > 0 ? 'bi-plus-circle' : 'bi-pencil-square'} me-1"></i>
                                    ${product.reste > 0 ? 'Enregistrer' : 'Modifier'}
                                </button>
                                <button type="button" class="btn btn-danger px-3 delete" data-idp="${product.idP}">x Retirer</button>
                            </div>
                        </div>
                    `;
                    productList.appendChild(productItem);
                });
                addEventListeners();
            }
        });

    // ✅ Ajout de la gestion checkbox + bouton EnregistrerTout
    function addEventListeners() {
        document.querySelectorAll('input[name="products[]"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const container = checkbox.closest('.product-item');
                const quantityInput = container.querySelector('input[type="number"]');
                const uniteInput = container.querySelector('select');
                quantityInput.disabled = !checkbox.checked;
                uniteInput.disabled = !checkbox.checked;
            });
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idP = btn.getAttribute('data-idp');
                const reste = parseFloat(btn.getAttribute('data-reste'));
                if (reste > 0) {
                    saveProduct(idP);
                } else {
                    modifyProduct(idP);
                }
            });
        });

        document.querySelectorAll('.delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const container = btn.closest('.product-item');
                const idP = container.getAttribute('data-idp');
                const qte = container.querySelector('input[type="number"]').value || 0;
                const unite = container.querySelector('select').value || 'pièce';
                deleteProduct(idP, qte, unite);
            });
        });        

        document.getElementById('enregistrerTout').addEventListener('click', () => {
            const selectedProducts = [];
            const quantities = [];
            const unites = [];
            const invalid = [];

            document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
                const container = checkbox.closest('.product-item');
                const idP = checkbox.value;
                const quantityInput = container.querySelector('input[type="number"]');
                const uniteInput = container.querySelector('select');

                const quantity = quantityInput.value.trim();
                const unite = uniteInput.value.trim();
                const name = container.querySelector('.product-name').textContent;

                if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
                    invalid.push(name);
                } else {
                    selectedProducts.push(idP);
                    quantities.push(parseFloat(quantity));
                    unites.push(unite);
                }
            });

            if (invalid.length > 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Champs invalides',
                    text: 'Veuillez corriger les produits suivants :\n' + invalid.join(', ')
                });
                return;
            }

            if (selectedProducts.length === 0) {
                Swal.fire({
                    icon: 'info',
                    title: 'Aucun produit sélectionné',
                    text: 'Veuillez cocher au moins un produit.'
                });
                return;
            }

            const formData = new FormData();
            formData.append('option', 76);
            formData.append('products', JSON.stringify(selectedProducts));
            formData.append('quantity', JSON.stringify(quantities));
            formData.append('unite', JSON.stringify(unites));
            formData.append('idBS', idBS);
            formData.append('idEB', idEB);
            formData.append('enregistrerTout', true);

            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: data.message,
                    }).then(() => location.reload());
                } else {
                    let msg = data.message;
                    if (data.produitsIncoherents) {
                        msg += '\n' + data.produitsIncoherents.map(p =>
                            `${p.nomProduit} (${p.message}, Saisi: ${p.quantiteSaisie}, Limite: ${p.reste})`
                        ).join('\n');
                    }
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: msg
                    });
                }
            })
            .catch(err => {
                console.error(err);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur serveur',
                    text: 'Une erreur est survenue.'
                });
            });
        });
    }

    // Fonction pour enregistrer un produit partiellement
    function saveProduct(idP) {
        const container = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const qte = container.querySelector('input[type="number"]').value;
        const unite = container.querySelector('select').value;

        const formData = new FormData();
        formData.append('option', 73);
        formData.append('idBS', idBS);
        formData.append('idP', idP);
        formData.append('quantity', qte);
        formData.append('unite', unite);

        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Succès', text: data.message }).then(() => location.reload());
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
            }
        });
    }    

    
    function modifyProduct(idP) {
        const container = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const qte = container.querySelector('input[type="number"]').value;
        const unite = container.querySelector('select').value;

        const formData = new FormData();
        formData.append('option', 79);
        formData.append('idBS', idBS);
        formData.append('idP', idP);
        formData.append('quantity', qte);
        formData.append('unite', unite);

        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        }).then(res => res.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Succès', text: data.message }).then(() => location.reload());
            } else {
                Swal.fire({ icon: 'error', title: 'Erreur', text: data.message });
            }
        });
    }    
    
   
    document.getElementById('bonForm').addEventListener('submit', function (event) {
        event.preventDefault(); 
    });

 
    function deleteProduct(idP, quantity, unite) {
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Vous allez retirer ce produit de la sortie.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, retirer',
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
                    text: 'Le retrait a été annulé.',
                });
            }
        });
    }
    

  
    function get_reste(params1, param2) {
        let input_check = document.getElementById('prod' + params1);
        let input_qte = document.getElementById(params1);
        if (input_check.checked) {
            xhr = new XMLHttpRequest();
            xhr.open('GET', `../../controlleur/controlleur.php?option=32&idP=${params1}&idEB=${param2}`, true);
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