document.addEventListener('DOMContentLoaded', function() {
   let idBon = new URLSearchParams(window.location.search).get('idBon');
    fetchExpression(idBon);
    fetchCategories();
    updating = 1;
  
    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];
    
    if (closeButton) {
        closeButton.onclick = function() {
            modal.style.display = "none";
            location.href = "Liste_EB.php";
        }
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});



let idBon = new URLSearchParams(window.location.search).get('idBon');

function retour() {
    alert("Commande Sauvegardée !!!");
    location.href = "Liste_EB.php";
}
function filterProducts(count, idP) {
    const selectSubCategory = document.getElementById(`sous-categorie${count}`);
    const selectedSubCatId = selectSubCategory.value;
    const productSelect = document.getElementById(`select${idP}`);
    let stock = document.getElementById("stock" + idP);

    fetch('../../controlleur/controlleur.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 49,
            'id_sous_categorie': selectedSubCatId
        })
    })
    .then(response => response.json())
    .then(data => {
        productSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>';
        data.forEach(produit => {
            var option = document.createElement('option');
            option.value = produit.idP;
            option.text = produit.nomproduit;
            quantite = produit.Stock_actuel;
            productSelect.append(option);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des produits :', error));

    productSelect.addEventListener('change', function() {
        idP = productSelect.value;
        fetch('stock_actuel.php?id_produit=' + idP)
            .then(response => response.json())
            .then(data => {
                stock.innerText = data.Stock_actuel;
            })
            .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    });

    productSelect.value = ""; // Réinitialiser la sélection du produit
}

function fetchExpression(idBon) {
    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 38,
            'idBon': idBon
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const bonsSortie = data.data;
            const products = data.products;
            const container = document.querySelector('#productsContainer');
            container.innerHTML = ''; // Clear existing content

            let count = 1;
            bonsSortie.forEach(bon => {
                const productOptions = products.map(product => 
                    `<option value="${product.idP}" ${product.idP === bon.idP ? 'selected' : ''}>${product.nomproduit}</option>`
                ).join('');

                const productForm = `
                <div class="border p-3 rounded shadow-sm mb-4">
                    <h4 class="mb-3 text-primary">Produit ${count}</h4>
            
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="sous-categorie${count}" class="form-label">Sous Catégorie</label>
                            <select class="form-select" id="sous-categorie${count}" name="idSC"
                                aria-label="Sélectionnez une catégorie"
                                onchange="filterProducts(${count},${bon.idP})">
                                <option value="" selected>${bon.nom}</option>
                            </select>
                        </div>
            
                        <div class="col-md-6">
                            <label for="select${bon.idP}" class="form-label">Nom du produit</label>
                            <select class="form-select" id="select${bon.idP}" name="idP[]" required>
                                ${productOptions}
                            </select>
                        </div>
                    </div>
            
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Stock actuel du Produit :</label>
                            <b class="text-success" id="stock${bon.idP}">${bon.Stock_actuel}</b>
                        </div>
                    </div>
            
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="quantity${bon.idP}" class="form-label">Quantité</label>
                            <input type="number" class="form-control" id="quantity${bon.idP}" name="quantite[]" min="1"
                                value="${bon.quantite}" required>
                        </div>
            
                        <div class="col-md-6">
                            <label for="unite${bon.idP}" class="form-label">Unité</label>
                            <input type="text" class="form-control" id="unite${bon.idP}" name="unite[]" 
                                value="${bon.unite}" required>
                        </div>
                    </div>
            
                    <div class="error-message text-danger" id="errorMessage0"></div>
            
                    <div class="text-end">
                        <button type="button" class="btn btn-danger me-2" id="supp${bon.idP}"
                            onclick="Supprimer(${bon.idP},${idBon},${bon.quantite})">Supprimer</button>
                        <button type="button" class="btn btn-warning"
                            onclick="Modifier(${idBon},${bon.idP},${bon.quantite})">Modifier</button>
                    </div>
                </div>
            `;
            
                container.insertAdjacentHTML('beforeend', productForm);
                count++;
            });
        } else {
            console.error('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
    });
}
const modal = document.getElementById("productModal");
    const openModalButton = document.getElementById("openModalButton");
    const closeButton = document.getElementsByClassName("close")[0];

    if (openModalButton) {
        openModalButton.onclick = function() {
            modal.style.display = "block";
            loadCategories(); 
        }
    }

   
    let productCount = 1;
    let compteur = 1;
function addProduct() {
    productCount++;
    compteur++;
    if (productCount <= 10) {
        const productContainer = document.getElementById('productsContainer');
        const newProductForm = document.createElement('div');
        newProductForm.className = 'product-form';
        newProductForm.innerHTML = `
            <div class="border p-3 rounded shadow-sm mb-4">
                <h4 class="mb-3 text-primary">Produit ${productCount}</h4>
        
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="sousCategorie${compteur}" class="form-label">Sous Catégorie</label>
                        <select class="form-select" id="sousCategorie${compteur}" name="idSC"
                            aria-label="Sélectionnez une catégorie" 
                            onchange="filtreur(sousCategorie${compteur},${compteur})">
                            <option value="" selected>Sélectionnez une sous catégorie</option>
                        </select>
                    </div>
        
                    <div class="col-md-6">
                        <label for="produit${compteur}" class="form-label">Nom du produit</label>
                        <select class="form-select" name="idP[]" id="produit${compteur}" required 
                            onchange="checkQuantity(${compteur},${compteur})">
                            <option value="" selected>Sélectionnez un produit</option>
                        </select>
                    </div>
                </div>
        
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Stock actuel du Produit :</label>
                        <b class="text-success" id="stock${compteur}"></b>
                    </div>
                </div>
        
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label for="quantiteInput${compteur}" class="form-label">Quantité</label>
                        <input type="number" class="form-control" name="quantite[]" min="1" id="quantiteInput${compteur}"
                            oninput="checkQuantity(${compteur},${compteur})" required>
                    </div>
        
                    <div class="col-md-6">
                        <label for="uniteInput${compteur}" class="form-label">Unité</label>
                        <input type="text" class="form-control" name="unite[]" id="uniteInput${compteur}" required>
                    </div>
                </div>
        
                <div class="error-message text-danger" id="errorMessage${compteur}"></div>
        
                <div class="text-end">
                    <button type="button" class="btn btn-success" 
                        onclick="partielle_Add(this,${idBon})" id=boutton_partielle${compteur}>Enregistrer</button>
                </div>
            </div>
        `;
        
        productContainer.appendChild(newProductForm);
        fetchCategories(); // Fetch categories for the new product form
    } else {
        alert("Nombre d'ajout maximum atteint");
    }
}

function checkQuantity(compteur, id) {
    const quantityInput = document.getElementById(`quantiteInput${compteur}`);
    const errorMessage = document.getElementById(`errorMessage${compteur}`);
    const btn_add = document.getElementById(`boutton_partielle${compteur}`);
    const selectedProductId = document.getElementById(`produit${id}`);
    const plus = document.getElementById(`plus`);
    const productForm = quantityInput.closest('.border');
    const updateButtonExists = productForm.querySelector('.boutton_partielle') !== null;

    if (updateButtonExists) {
        if (btn_add) btn_add.hidden = true;
        if (plus) plus.hidden = true;
        
        if (quantityInput.value > document.getElementById("stock" + compteur).textContent || 
            quantityInput.value <= 0 || 
            isNaN(parseFloat(quantityInput.value))) {
            errorMessage.textContent = "Quantité saisie supérieure à la quantité disponible!";
            quantityInput.setCustomValidity("Quantité saisie supérieure à la quantité disponible!");
        } else {
            errorMessage.textContent = "";
            quantityInput.setCustomValidity("");
        }
        return;
    }

  
    if (quantityInput.value > document.getElementById("stock" + compteur).textContent || 
        quantityInput.value <= 0 || 
        isNaN(parseFloat(quantityInput.value))) {
        btn_add.hidden = true;
        plus.hidden = true;
        errorMessage.textContent = "Quantité saisie supérieure à la quantité disponible!";
        quantityInput.setCustomValidity("Quantité saisie supérieure à la quantité disponible!");
    } else {
        plus.hidden = false;
        btn_add.hidden = false;
        errorMessage.textContent = "";
        quantityInput.setCustomValidity("");
    }
}

function filtreur(idEB, idP) {
    var idSousCategorie = idEB.value;
    var produitSelect = document.getElementById('produit' + idP);
    let stock = document.getElementById("stock" + idP);
    produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>'; // Réinitialiser le select

    if (idSousCategorie) {
        // Construire l'URL avec les paramètres
        const url = `../../controlleur/controlleur.php?option=49&id_sous_categorie=${encodeURIComponent(idSousCategorie)}`;
        
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(produit => {
                var option = document.createElement('option');
                option.value = produit.idP;
                option.text = produit.nomproduit;
                produitSelect.append(option);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));

        produitSelect.addEventListener('change', function() {
            idP = produitSelect.value;
            fetch('../../controlleur/controlleur.php?option=48&id_produit=' + encodeURIComponent(idP), {
                method: 'GET', // Méthode explicitement spécifiée
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => {
                stock.innerText = data.Stock_actuel; // Mettre à jour l'affichage du stock
            })
            .catch(error => console.error('Erreur lors de la récupération du stock :', error));
        });            
    } else {
        console.log('Aucune sous-catégorie sélectionnée.');
    }
}

// function Supprimer(idP, idBon, quantite, unite) {
//     Swal.fire({
//         title: 'Êtes-vous sûr ?',
//         text: "Vous allez supprimer ce produit de la commande.",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Oui, supprimer',
//         cancelButtonText: 'Annuler',
//         reverseButtons: true
//     }).then((result) => {
//         if (result.isConfirmed) {
//             fetch('../../controlleur/controlleur.php', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//                 body: new URLSearchParams({
//                     'option': 41,
//                     'idP': idP,
//                     'idBon': idBon,
//                     'quantite': quantite,
//                     'unite': unite
//                 })
//             })
//             .then(response => response.json())
//             .then(success => {
//                 if (success) {
//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Produit supprimé',
//                         text: 'Le produit a été supprimé de la commande.',
//                     }).then(() => {
//                         location.reload();
//                     });
//                 } else {
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Erreur',
//                         text: 'Erreur lors de la suppression du produit',
//                     });
//                 }
//             })
//             .catch(error => {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Erreur de connexion',
//                     text: 'Une erreur est survenue lors de la connexion au serveur.',
//                 });
//                 console.error('Erreur de connexion au serveur :', error);
//             });
//         } else {
//             Swal.fire({
//                 icon: 'info',
//                 title: 'Action interrompue',
//                 text: 'L\'action a été annulée.',
//             });
//         }
//     });
// }



function Modifier(idBon, exIdP, quantity, unity) {
    ex = document.getElementById("select" + exIdP).textContent;
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Vous allez effectuer des modifications sur ce produit.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            let quantite = document.getElementById("quantity" + exIdP).value;
            let unite = document.getElementById("unite" + exIdP).value;
            let newIdP = document.getElementById("select" + exIdP).value;

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '../../controlleur/controlleur.php', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(`option=51&idP=${newIdP}&quantite=${quantite}&idBon=${idBon}&id=${exIdP}&unite=${unite}`);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response === true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Modification accomplie',
                            text: 'Le produit a été modifié avec succès.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Erreur lors de l\'enregistrement du produit : ' + response.message,
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'enregistrement du produit',
                    });
                }
            };
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Action interrompue',
                text: 'Aucune modification effectuée.',
            });
            document.getElementById("supp" + exIdP).inert = false;
        }
    });
}

function del(button, idBon) {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Vous allez supprimer ce produit de la commande.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            const productForm = button.parentElement.parentElement;
            const productId = productForm.querySelector('select[name="idP[]"]').value;
            const quantity = productForm.querySelector('input[name="quantite[]"]').value;
            const unite = productForm.querySelector('input[name="unite[]"]').value;

            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'option': 41,
                    'idP': productId,
                    'idBon': idBon,
                    'quantite': quantity,
                    'unite': unite
                })
            })
            .then(response => response.json())
            .then(success => {
                if (success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Produit supprimé',
                        text: 'Le produit a été supprimé de la commande.',
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de la suppression du produit',
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur de connexion',
                    text: 'Une erreur est survenue lors de la connexion au serveur.',
                });
                console.error('Erreur de connexion au serveur :', error);
            });
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Action interrompue',
                text: 'L\'action a été annulée.',
            });
        }
    });
}

function update(button, idBon, id, delButton, quantite, unite) {
    const productForm = button.parentElement.parentElement;
    const productId = productForm.querySelector('select[name="idP[]"]').value;
    const quantityInput = productForm.querySelector('input[name="quantite[]"]');
    const quantity = quantityInput.value;
    const unity = productForm.querySelector('input[name="unite[]"]').value;
    const stockActuel = parseFloat(document.getElementById("stock" + id).textContent);

  
    if (!quantity || quantity <= 0 || quantity > stockActuel) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur de quantité',
            text: 'La quantité doit être supérieure à 0 et inférieure ou égale au stock disponible.',
        });
        return;
    }

    
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Vous allez effectuer des modifications sur ce produit.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '../../controlleur/controlleur.php?option=51', true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(`idP=${productId}&quantite=${quantity}&idBon=${idBon}&id=${id}&unite=${unity}`);
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response === true) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Modification réussie',
                                text: 'Les informations du produit ont été mises à jour.',
                            }).then(() => {
                                delButton.inert = false;
                                if (delButton) delButton.disabled = false;
                            });
                        } else {
                            throw new Error('Réponse invalide du serveur');
                        }
                    } catch (e) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Erreur lors de la modification du produit',
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'enregistrement du produit',
                    });
                }
            };

            xhr.onerror = function() {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur réseau',
                    text: 'Erreur de connexion au serveur',
                });
            };
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Action interrompue',
                text: 'Aucune modification effectuée.',
            });
            delButton.inert = false;
        }
    });
}


function removeProduct(button) {
    productCount--;
    const productForm = button.parentElement.parentElement;
    productForm.remove();
}

function remove(button) {
    productCount--;
    const productForm = button.parentElement;
    productForm.remove();
}

document.addEventListener('DOMContentLoaded', function() {
    modal.style.display = "block";
});

closeButton.onclick = function() {
    modal.style.display = "none";
    location.href = "Liste_EB.php";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        location.href = "Liste_EB.php";
    }
}

function partielle_Add(button, idBon) {
    const productForm = button.parentElement.parentElement;
    const productId = productForm.querySelector('select[name="idP[]"]').value;
    const quantity = productForm.querySelector('input[name="quantite[]"]').value;
    const unite = productForm.querySelector('input[name="unite[]"]').value;
    if (productId == "" || quantity == "" || quantity == 0 || unite == "") {
        alert("Veuillez renseigner de bonnes informations");
    } else {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '../../controlleur/controlleur.php?option=50', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(`idP=${encodeURIComponent(productId)}&quantite=${encodeURIComponent(quantity)}&idBon=${encodeURIComponent(idBon)}&unite=${encodeURIComponent(unite)}`);
    
        xhr.onload = function() {
            if (xhr.status === 200) {
                button.hidden = true;
                const updateButton = document.createElement('button');
                updateButton.type = 'button';
                updateButton.className = 'btn btn-info';
                updateButton.style.background = 'orange';
                updateButton.style.padding = '10px 20px';
                updateButton.style.cursor = 'pointer';
                updateButton.style.margin = '3px';
                updateButton.style.borderRadius = '5px';
                updateButton.style.border = 'none';
                updateButton.style.float = 'right';
                updateButton.onclick = function() {
                    update(this, idBon, productId, delButton, quantity,unite);
                    delButton.inert = true;
                };
                productForm.querySelector('select[name="idP[]"]').addEventListener('change', function() {
                    updateButton.inert = false;
                });
                updateButton.textContent = 'Modifier';
                const delButton = document.createElement('button');
                delButton.type = 'button';
                delButton.className = 'btn btn-info';
                delButton.style.background = '#FF0000';
                delButton.style.padding = '10px 20px';
                delButton.style.cursor = 'pointer';
                delButton.style.margin = '3px';
                delButton.style.borderRadius = '5px';
                delButton.style.border = 'none';
                delButton.style.float = 'right';
                delButton.onclick = function() {
                    del(this, idBon);
                };
                delButton.textContent = 'Supprimer';
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'boutton_partielle';
                buttonContainer.appendChild(updateButton);
                buttonContainer.appendChild(delButton);

                productForm.appendChild(buttonContainer);
            } else {
                alert('Erreur lors de l\'enregistrement du produit');
            }
        };
    }
}

function fetchCategories() {
    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (!data.error) {
            const selects = document.querySelectorAll('select[name="idSC"]');
            selects.forEach(select => {
         
                data.forEach(item => {
                    if (item.type === 'optgroup_start') {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = item.label;
                        select.appendChild(optgroup);
                    } else if (item.type === 'option') {
                        const option = document.createElement('option');
                        option.value = item.value;
                        option.textContent = item.text;
                        select.appendChild(option);
                    }
                });
            });
        } else {
            console.error('Erreur : ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
    });
}