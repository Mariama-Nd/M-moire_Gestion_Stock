document.addEventListener('DOMContentLoaded', function () {
    const idBS = new URLSearchParams(window.location.search).get('idBon');
    const idEB = new URLSearchParams(window.location.search).get('expID');

    fetch(`../../controlleur/controlleur.php?option=74&idBS=${idBS}`)
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
                        <span id="idBSproduit${product.idP}" hidden="true">${idBS}</span>
                        <span id="quantite_product${product.idP}" hidden="true">${product.quantite}</span>
                        <span id="unite_product${product.idP}" hidden="true">${product.unite}</span>
                       
                        <span id="reste${product.idP}" hidden="true">${product.reste}</span>
                
                        <div class="card-header">
                            <h5 class="card-title">${product.nomproduit} <span class="text-muted">(Reste: ${product.reste})</span></h5>
                            <h5 class="card-title ">${product.nomproduit} <span class="" style="color:red">( Stock actuel : ${product.Stock_actuel})</span></h5>
                        </div>
                
                        <div class="card-body">
                        <div class="row">
                         <div class="col-md-12">
                                <label for="prod${product.idP}" class="form-label"><b>Quantité</b></label>
                                <input type="number" name="quantity[]" min="0" id="quantity${product.idP}" class="form-control" value="${product.quantite}">
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
    fetch(`../../controlleur/controlleur.php?option=75&idBS=${idBS}`)
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

                        
                         <label for="prod${product.idP}"><b>unité(piece,caroton,boîte)</b></label>
                        <input type="text" name="unite[]" class="product-unite" id="unite${product.idP}" >

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
                const uniteInput = productItem.querySelector('input[name="unite[]"]');
                const isChecked = checkbox.checked;
                quantityInput.disabled = !isChecked;
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
        const invalidProducts = [];
    
        document.querySelectorAll('input[name="products[]"]:checked').forEach(checkbox => {
            const productId = checkbox.value;
            const quantityInput = checkbox.parentElement.querySelector('input[type="number"]');
            const quantity = quantityInput.value.trim();
            const productName = checkbox.parentElement.querySelector('.product-name').textContent;
    
            if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0 ) {
                invalidProducts.push(productName);
            } else {
                selectedProducts.push(productId);
                quantities.push(quantity);
            }
    
          
        });
    
        if (invalidProducts.length > 0) {
            alert("Veuillez entrer une Quantité valide pour les produits suivants :\n" + invalidProducts.join(', '));
            return;
        }
    
      
    
        if (selectedProducts.length === 0) {
            alert("Aucun produit sélectionné.");
            return;
        }
    
        const formData = new FormData();
        formData.append('option', 76);
        formData.append('products', JSON.stringify(selectedProducts));
        formData.append('quantity', JSON.stringify(quantities));
       
        formData.append('idEB', idEB);
        formData.append('idBS', idBS);
        formData.append('enregistrerTout', true);
    
    
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur : ", data); 
        
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
                        message += `${prod.nomProduit} (Quantité saisie: ${prod.quantiteSaisie}, Reste à sortir: ${prod.reste})\n`;
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

    // Fonction pour enregistrer un produit partiellement
       function saveProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        if (!productItem) {
            console.error("Produit non trouvé pour l'ID: " + idP);
            return;
        }
    
        const quantityInput = productItem.querySelector('input[type="number"]');
   
        const unite = document.getElementById("unite" + idP).value.trim();
    
        const quantity = quantityInput.value.trim();
        if (quantityInput.disabled || !quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
            alert("Veuillez entrer une quantité valide.");
            return;
        }
    
        if (prix.trim() <= 0) {
            alert("Veuillez entrer un Prix valide.");
            return;
        }
       
    
        const formData = new FormData();
        formData.append('option', 73);
        formData.append('idBS', idBS);
        formData.append('idEB', idEB);
        formData.append('idP', idP);
        formData.append('quantity', parseFloat(quantity));
        formData.append('unite', unite);
    
        console.log("Données envoyées : ", formData);
    
        fetch(`../../controlleur/controlleur.php`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log("Réponse du serveur : ", data); 
        
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Enregistrement réussi.',
                }).then(() => {
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: data.message || "Échec de l'enregistrement.",
                });
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
        
    }
    function modifyProduct(idP) {
        const productItem = document.querySelector(`.product-item[data-idp="${idP}"]`);
        const quantityInput = productItem.querySelector('input[type="number"]');
        const currentQuantity = quantityInput.value;
        const current_unite = document.getElementById("unite" + idP).value;
        let reste = document.getElementById("reste" + idP).innerHTML;
    
        if (currentQuantity === null || current_unite == null) {
           
            return;
        } else if (currentQuantity.trim() === "" ||  current_unite.trim() == '') {
          
            Swal.fire({
                icon: 'warning',
                title: 'Entrée vide',
                text: "L'entrée est vide. Veuillez entrer une valeur.",
            });
        } else if (isNaN(currentQuantity) || parseFloat(currentQuantity) < 0 ) {
            Swal.fire({
                icon: 'warning',
                title: 'Valeur invalide',
                text: "Veuillez entrer un nombre valide supérieur à 0.",
            });
        } else if ((quantityInput-currentQuantity) > reste) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité invalide',
                text: "Impossible de poursuivre cette action ! L'intégralité du produit a été sortie.",
            });
        } else {
            const formData = new FormData();
            formData.append('option', 79);
            formData.append('idBS', idBS);
            formData.append('idP', idP);
            formData.append('quantity', currentQuantity);
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
        event.preventDefault(); 
    });

 
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