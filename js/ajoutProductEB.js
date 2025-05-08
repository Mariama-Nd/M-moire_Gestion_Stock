document.addEventListener('DOMContentLoaded', function() {
    fetchName();
    fetchCategories();
   

});
let idBon = new URLSearchParams(window.location.search).get('idBon');
const modal = document.getElementById('productModal');
    const closeButton = document.querySelector('.close');

let productCount = 1;
let compteur = 1;
document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    formData.append('idBon', new URLSearchParams(window.location.search).get('idBon'));

    // Show loading state
    Swal.fire({
        title: 'Enregistrement en cours...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('../../controlleur/controlleur.php?option=52', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            Swal.fire({
                title: 'Succès!',
                text: data.message,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'liste_EB.php';
            });
        } else {
            Swal.fire({
                title: 'Erreur',
                text: data.error || 'Une erreur est survenue',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Erreur',
            text: 'Erreur de connexion au serveur',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
});

function fetchName() {
    const urlParams = new URLSearchParams(window.location.search);
    const idBon = urlParams.get('idBon');

    fetch(`../../controlleur/controlleur.php?option=44&idBon=${idBon}`)
        .then(response => response.json())
        .then(data => {
            if (data.name) {
                document.getElementById('expression-besoin-name').innerText = data.name;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error:', error));
}

function fetchCategories() {
    fetch('../../controlleur/controlleur.php?option=45')
        .then(response => response.json())
        .then(data => {
            populateCategories(data);
        })
        .catch(error => console.error('Error:', error));
}

function populateCategories(categories) {
    const selectElement = document.getElementById('sous-categorie');
    let currentCategory = null;

    categories.forEach(category => {
        if (currentCategory !== category.id_categorie) {
            if (currentCategory !== null) {
                selectElement.innerHTML += "</optgroup>";
            }
            selectElement.innerHTML += `<optgroup label="${category.nom_categorie}">`;
            currentCategory = category.id_categorie;
        }
        selectElement.innerHTML += `<option value="${category.idSC}">${category.nom}</option>`;
    });

    if (currentCategory !== null) {
        selectElement.innerHTML += "</optgroup>";
    }
}

document.getElementById('sous-categorie').addEventListener('change', function () {
    var idSousCategorie = this.value;
    let input = document.getElementById("quantiteInput0")
    var produitSelect = document.getElementById('produit0');
    let stock = document.getElementById("stock")
    fetch(`../../controlleur/controlleur.php?option=49&id_sous_categorie=${idSousCategorie}`)
        .then(response => response.json())
        .then(data => {
            produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>';
            data.forEach(produit => {
                var option = document.createElement('option');
                option.value = produit.idP;
                option.text = produit.nomproduit;
                produitSelect.append(option);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));

    produitSelect.addEventListener('change', function () {
        idP = produitSelect.value
        fetch(`../../controlleur/controlleur.php?option=48&id_produit=${idP}`)
            .then(response => response.json())
            .then(data => {
                quantite = data.Stock_actuel
              
                stock.innerText = data.Stock_actuel
            })
            .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    })
});

function addProduct() {
    productCount++;
    compteur++;
    if (productCount <= 10) {
        const productContainer = document.getElementById('productsContainer');
        const newProductForm = document.createElement('div');
        newProductForm.className = 'product-form';
        newProductForm.innerHTML = `
        <div class="border p-3 rounded shadow-sm mb-4">
            <h4 class="mb-3">Produit ${productCount}</h4>
    
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="sousCategorie${compteur}" class="form-label">Sous Catégorie</label>
                    <select class="form-select" id="sousCategorie${compteur}" name="idSC"
                        aria-label="Sélectionnez une catégorie" onchange="filtreur(sousCategorie${compteur},${compteur})">
                        <option value="" selected>Sélectionnez une sous catégorie</option>
                    </select>
                </div>
    
                <div class="col-md-6">
                    <label for="produit${compteur}" class="form-label">Nom du produit</label>
                    <select class="form-select" name="idP[]" id="produit${compteur}" required onchange="checkQuantity(${compteur},${compteur})">
                        <option value="" selected>Sélectionnez un produit</option>
                    </select>
                </div>
            </div>
    
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label">Stock actuel du Produit :</label>
                    <b id="stock${compteur}"></b>
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
                <button type="button" class="btn btn-success" id="boutton_partielle${compteur}" onclick="partielle_Add(this,${idBon})">Enregistrer</button>
            </div>
        </div>
    `;
    
        productContainer.appendChild(newProductForm);

        // Fetch categories and populate the select element
        fetch('../../controlleur/controlleur.php?option=47')
            .then(response => response.json())
            .then(data => {
                const selectElement = document.getElementById(`sousCategorie${compteur}`);
                let currentCategory = null;
                data.forEach(category => {
                    if (currentCategory !== category.id_categorie) {
                        if (currentCategory !== null) {
                            selectElement.innerHTML += "</optgroup>";
                        }
                        selectElement.innerHTML += `<optgroup label="${category.nom_categorie}">`;
                        currentCategory = category.id_categorie;
                    }
                    selectElement.innerHTML += `<option value="${category.idSC}">${category.nom}</option>`;
                });
                if (currentCategory !== null) {
                    selectElement.innerHTML += "</optgroup>";
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
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
        
        // On vérifie quand même la quantité pour l'affichage du message d'erreur
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

    // Logique normale pour l'ajout initial
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

function filtreur(idS, idP) {
    var idSousCategorie = idS.value;
   
    var produitSelect = document.getElementById('produit' + idP);
    let input = document.getElementById("quantiteInput" + idP)
    let stock = document.getElementById("stock" + idP)
    produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>'; // Réinitialiser le select
    if (idSousCategorie) {
        fetch(`../../controlleur/controlleur.php?option=46&id_sous_categorie=${idSousCategorie}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(produit => {
                    var option = document.createElement('option');
                    option.value = produit.idP;
                    option.text = produit.nomproduit;
                    quantite = produit.Stock_actuel;
                   
                    produitSelect.append(option);
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        produitSelect.addEventListener('change', function () {
            idP = produitSelect.value
            fetch(`../../controlleur/controlleur.php?option=48&id_produit=${idP}`)
                .then(response => response.json())
                .then(data => {
                   
                    stock.innerText = data.Stock_actuel
                 
                })
                .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        })
    } else {
     
    }
};

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

            const formData = new FormData();
            formData.append('idP', productId);
            formData.append('quantite', quantity);
            formData.append('unite', unite);
            formData.append('idBon', idBon);

            fetch('../../controlleur/controlleur.php?option=41', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Produit supprimé',
                        text: 'Le produit a été supprimé de la commande.',
                    }).then(() => {
                        button.hidden = false;
                        removeProduct(button);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'enregistrement du produit.',
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur serveur',
                    text: 'Une erreur est survenue lors de la requête.',
                });
                console.error('Error:', error);
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
                                // Réactiver le bouton de suppression
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
    const productForm = button.closest('.product-form');
    if (productForm) {
        productForm.remove(); 
    } else {
        console.error("Produit non trouvé dans le DOM.");
    }
}

function remove(button) {
    productCount--;
    const productForm = button.parentElement; 
    if (productForm) {
        productForm.remove(); 
    } else {
        console.error("Produit non trouvé dans le DOM.");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    modal.style.display = "block";
});

closeButton.onclick = function () {
    modal.style.display = "none";
    location.href = "liste_EB.php";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        location.href = "liste_EB.php";
    }
}

function partielle_Add(button, idBon) {
    const productForm = button.parentElement.parentElement;
    const productId = productForm.querySelector('select[name="idP[]"]').value;
    const quantity = productForm.querySelector('input[name="quantite[]"]').value;
    const unite = productForm.querySelector('input[name="unite[]"]').value;

    if (productId == "" || quantity == "" || quantity == 0 || unite == "") {
        Swal.fire({
            icon: 'warning',
            title: 'Données manquantes',
            text: 'Veuillez renseigner toutes les informations requises'
        });
        return;
    }

   
    Swal.fire({
        title: 'Enregistrement en cours...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const formData = new FormData();
    formData.append('idP', productId);
    formData.append('quantite', quantity);
    formData.append('unite', unite);
    formData.append('idBon', idBon);

    fetch('../../controlleur/controlleur.php?option=50', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Produit enregistré avec succès',
                timer: 1500,
                showConfirmButton: false
            });

          
            button.hidden = true;

          
            const updateButton = document.createElement('button');
            updateButton.type = 'button';
            updateButton.className = 'btn btn-warning';
            updateButton.textContent = 'Modifier';
            updateButton.onclick = function() {
                update(this, idBon, productId, delButton, quantity, unite);
                delButton.inert = true;
            };

         
            const delButton = document.createElement('button');
            delButton.type = 'button';
            delButton.className = 'btn btn-danger ms-2';
            delButton.textContent = 'Supprimer';
            delButton.onclick = function() {
                del(this, idBon);
            };

         
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'boutton_partielle d-flex justify-content-end gap-2 mt-3';
            buttonContainer.appendChild(updateButton);
            buttonContainer.appendChild(delButton);

            productForm.appendChild(buttonContainer);

            
            productForm.querySelector('select[name="idP[]"]').addEventListener('change', function() {
                updateButton.inert = false;
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l\'enregistrement du produit'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur de connexion au serveur'
        });
    });
}