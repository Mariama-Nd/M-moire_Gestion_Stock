let idBC; 
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const auto_gen = urlParams.get('auto_gen');
    const nomBC = urlParams.get('nomBC');

    if (auto_gen && nomBC) {
        fetch(`../../controlleur/controlleur.php?option=15&auto_gen=${auto_gen}&nomBC=${nomBC}`)
            .then(response => response.json()) 
            .then(data => {
                if (data.error) {
                    console.error('Erreur lors de la récupération du bon de commande :', data.error);
                } else {
                    document.getElementById('bonCommandeName').textContent = data.nomBC;
                    idBC = data.id_BC; 
                   
                    
                }
            })
            .catch(error => console.error('Erreur lors de la récupération du bon de commande :', error));
    } else {
        console.error('Paramètres auto_gen ou nomBC manquants dans l\'URL.');
    }
    //PRODUIT 
    document.getElementById('sousCategorie').addEventListener('change', function () {
        var idSousCategorie = this.value;
        fetch(`../../controlleur/controlleur.php?option=17&id_sous_categorie=${idSousCategorie}`)
            .then(response => response.json())
            .then(data => {
                var produitSelect = document.getElementById('produit');
                produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>';
                data.forEach(produit => {
                    var option = document.createElement('option');
                    option.value = produit.idP;
                    option.text = produit.nomproduit;
                    produitSelect.add(option);
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    });

    // Categorie
    fetch(`../../controlleur/controlleur.php?option=1`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Erreur lors de la récupération des sous-catégories :', data.error);
            } else {
                const sousCategorieSelect = document.getElementById('sousCategorie');
                sousCategorieSelect.innerHTML = '';
                data.forEach(item => {
                    if (item.type === "optgroup_start") {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = item.label;
                        sousCategorieSelect.appendChild(optgroup);
                    } else if (item.type === "option") {
                        const option = document.createElement('option');
                        option.value = item.value;
                        option.text = item.text;
                        sousCategorieSelect.appendChild(option);
                    } else if (item.type === "optgroup_end") {
                      
                    }
                });
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des sous-catégories :', error));


    // ajout element au bc
    document.getElementById('productForm').addEventListener('submit', function (event) {
        event.preventDefault(); 
        const productForm = document.getElementById('productForm');

        const formData = $(productForm).serialize() + '&option=19';
     

             $.ajax({
            type: 'post',
            url: '../../controlleur/controlleur.php',
            data: formData,
            dataType: 'json',
            success: function (data) {
                if (data.status == "success") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Succès',
                        text: 'commande ajoutée avec succès',
                    }).then(() => {
                        location.href = "Liste_bon_cmd.php";
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Ajout de la commande échoué',
                    }).then(() => {
                        location.href = "Liste_bon_cmd.php";
                    });
                }
            },
            error: function (resultat, statut, erreur) {
                console.error('Erreur AJAX:', erreur);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de l\'ajout de la Sous_categorie',
                }).then(() => {
                    location.href = "Liste_bon_cmd.php";
                });
            }
        });
    });

    id = [];
    updating = 1;
    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];
    let productCount = 1;
    let compteur = 1;

    function addProduct() {
        productCount++;
        compteur++;
        if (productCount <= 10) {
            const productContainer = document.getElementById('productsContainer');
            const newProductForm = document.createElement('div');
            newProductForm.className = 'product-form';
    
            getCategoriesOptions().then(categoryOptions => {
                newProductForm.innerHTML = `
                <div class="card mt-3">
                    <div class="card-body">
                        <h4 class="card-title text-primary">Produit ${productCount}</h4>
            
                        <!-- Sélection de la sous-catégorie -->
                        <div class="row">
  <div class="col-md-6">
                            <label for="sousCategorie${compteur}" class="form-label">Sous Catégorie</label>
                            <select class="form-select" id="sousCategorie${compteur}" name="idSC"
                                aria-label="Sélectionnez une catégorie" onchange="filtreur(this, ${compteur})">
                                <option value="" selected>Sélectionnez une sous-catégorie</option>
                                ${categoryOptions}
                            </select>
                        </div>
            
                        <!-- Sélection du produit -->
                        <div class="col-md-6">
                            <label for="produit${compteur}" class="form-label">Nom du produit</label>
                            <select class="form-select" name="idP[]" id="produit${compteur}" required>
                                <option value="" selected>Sélectionnez un produit</option>
                            </select>
                        </div>
            
                        </div>
                      
                        <!-- Quantité et Unité en ligne -->
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="quantity" class="form-label">Quantité</label>
                                <input type="number" class="form-control" name="quantite[]" min="1" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="unite" class="form-label">Unité</label>
                                <input type="text" class="form-control" name="unite[]" placeholder="pièce, carton, boîte" required>
                            </div>
                        </div>
            
                        <!-- Bouton Enregistrer -->
                        <div class="text-end">
                            <button type="button" class="btn btn-success" onclick="partielle_Add(this, ${idBC})">
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            
                productContainer.appendChild(newProductForm);
            }).catch(error => {
                console.error('Erreur lors du chargement des catégories:', error);
                alert('Une erreur est survenue lors du chargement des catégories');
            });
        } else {
            alert("Nombre d'ajout maximum atteint");
        }
    }
    

    function filtreur(selectElement, compteur) {
        var idSousCategorie = selectElement.value;
        var produitSelect = document.getElementById('produit' + compteur);
        console.log('idqo', idSousCategorie)
        produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>'; // Réinitialiser le select

        if (idSousCategorie) {
            fetch(`../../controlleur/controlleur.php?option=17&id_sous_categorie=${idSousCategorie}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur réseau : ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                  
                    data.forEach(produit => {
                        var option = document.createElement('option');
                        option.value = produit.idP;
                        option.text = produit.nomproduit;
                        produitSelect.add(option);
                    });
                })
                .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        } else {
            console.log('Aucune sous-catégorie sélectionnée.');
        }
    }
function del(button, idbc) {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Voulez-vous supprimer ce produit de la commande ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            const productForm = button.parentElement.parentElement;
            const productId = productForm.querySelector('select[name="idP[]"]').value;
            const quantity = productForm.querySelector('input[name="quantite[]"]').value;
            const unite = productForm.querySelector('input[name="unite[]"]').value;

            fetch('../../controlleur/controlleur.php?option=64', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `idP=${productId}&quantite=${quantity}&idbc=${idbc}&unite=${unite}`
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Supprimé !',
                        text: 'Le produit a été supprimé de la commande.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        productForm.remove();
                        productCount--;
                    });
                } else {
                    Swal.fire({
                        title: 'Erreur',
                        text: data.error || 'Une erreur est survenue lors de la suppression',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Erreur',
                    text: 'Erreur de connexion au serveur',
                    icon: 'error'
                });
            });
        }
    });
}

      function update(button, idbc, id) {
        const productForm = button.parentElement.parentElement;
        const productId = productForm.querySelector('select[name="idP[]"]').value;
        const quantity = productForm.querySelector('input[name="quantite[]"]').value;
        const unite = productForm.querySelector('input[name="unite[]"]').value;
    
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez-vous effectuer ces modifications ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, modifier',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Modification en cours...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
    
                fetch('../../controlleur/controlleur.php?option=12', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `idP=${productId}&quantite=${quantity}&idbc=${idbc}&id=${id}&unite=${unite}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data === true) {
                        Swal.fire({
                            title: 'Succès!',
                            text: 'Produit mis à jour avec succès',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            title: 'Erreur',
                            text: 'Erreur lors de la mise à jour du produit',
                            icon: 'error'
                        });
                    }
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    Swal.fire({
                        title: 'Erreur',
                        text: 'Erreur de connexion au serveur',
                        icon: 'error'
                    });
                });
            }
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        modal.style.display = "block";
    });

    closeButton.onclick = function () {
        modal.style.display = "none";
        location.href = "Liste_bon_cmd.php";
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.href = "Liste_bon_cmd.php";
        }
    };

    function partielle_Add(button) {
        const productForm = button.parentElement.parentElement;
        const productId = productForm.querySelector('select[name="idP[]"]').value;
        const quantity = productForm.querySelector('input[name="quantite[]"]').value;
        const unite = productForm.querySelector('input[name="unite[]"]').value;
        if (productId == "" || quantity == "" || quantity == 0 || unite == "") {
            alert("Veuillez Renseigner de bonne information");
        } else {
            fetch('../../controlleur/controlleur.php?option=18', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `idP=${productId}&quantite=${quantity}&idbc=${idBC}&unite=${unite}`
            })
            .then(response => response.json())
            .then(data => {
                if (data === true) {
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
                    updateButton.onclick = function () {
                        update(this, idBC, productId, delButton, quantity,unite);
                    };
                    productForm.querySelector('select[name="idP[]"]').addEventListener('change', function () {
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
                    delButton.onclick = function () {
                        del(this, idBC);
                    };
                    delButton.textContent = 'Supprimer';
                    const buttonContainer = document.createElement('div');
                    buttonContainer.className = 'boutton_partielle';
                    buttonContainer.appendChild(updateButton);
                    buttonContainer.appendChild(delButton);

                    productForm.appendChild(buttonContainer);
                } else {
                    alert('Erreur lors de l\'enregistrement du produitTTT');
                }
            })
            .catch(error => console.error('Erreur lors de l\'enregistrement du produit :', error));
        }
    }

    function getCategoriesOptions() {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'post',
                url: '../../controlleur/controlleur.php',
                data: { option: 1 },
                dataType: 'json',
                success: function (data) {
                    if (data == "pasConnexion") {
                        window.location.href = "page-de-connexion";
                    } else if (data == "Erreur") {
                        window.location.href = "/erreur";
                    } else {
                        let categoryOptions = '';
                        data.forEach(item => {
                            if (item.type === "optgroup_start") {
                                categoryOptions += `<optgroup label="${item.label}">`;
                            } else if (item.type === "option") {
                                categoryOptions += `<option value="${item.value}">${item.text}</option>`;
                            } else if (item.type === "optgroup_end") {
                                categoryOptions += '</optgroup>';
                            }
                        });
                        resolve(categoryOptions); 
                    }
                },
                error: function (resultat, statut, erreur) {
                    console.error('Erreur AJAX:', erreur);
                    window.location.href = "/erreur";
                    reject(erreur); 
                }
            });
        });
    }
function partielle_Add(button) {
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

    // Show loading state
    Swal.fire({
        title: 'Enregistrement en cours...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('../../controlleur/controlleur.php?option=18', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `idP=${productId}&quantite=${quantity}&idbc=${idBC}&unite=${unite}`
    })
    .then(response => response.json())
    .then(data => {
        if (data === true) {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: 'Produit enregistré avec succès',
                timer: 1500,
                showConfirmButton: false
            });

            button.hidden = true;

            // Create Update button with Bootstrap classes
            const updateButton = document.createElement('button');
            updateButton.type = 'button';
            updateButton.className = 'btn btn-warning';
            updateButton.textContent = 'Modifier';
            updateButton.onclick = function() {
                update(this, idBC, productId, delButton, quantity, unite);
                delButton.inert = true;
            };

            // Create Delete button with Bootstrap classes
            const delButton = document.createElement('button');
            delButton.type = 'button';
            delButton.className = 'btn btn-danger ms-2';
            delButton.textContent = 'Supprimer';
            delButton.onclick = function() {
                del(this, idBC);
            };

            // Create button container with flex layout
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'boutton_partielle d-flex justify-content-end gap-2 mt-3';
            buttonContainer.appendChild(updateButton);
            buttonContainer.appendChild(delButton);

            productForm.appendChild(buttonContainer);

            // Add change event listener
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
    window.addProduct = addProduct;
    window.filtreur = filtreur;
    window.del = del;
    window.update = update;
    window.partielle_Add = partielle_Add;
});