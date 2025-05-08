$(document).ready(function () {
    const modal = document.getElementById("productModal");
    const closeButton = document.getElementsByClassName("close")[0];
    let compteur = 2;
    let productCount = 1;
    let products = [];
    let allProducts = [];
    let categories = [];
    document.addEventListener('DOMContentLoaded', function () {
        modal.style.display = "block";
    });

    closeButton.onclick = function () {
        modal.style.display = "none";
        location.href = "Liste_bon_cmd.php";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            location.href = "Liste_bon_cmd.php";
        }
    }
    function addProduct() {
        productCount++;
        compteur++;
    
        if (productCount <= 10) {
            const productContainer = document.getElementById('productsContainer');
            const newProductForm = document.createElement('div');
            newProductForm.className = 'card mb-3 p-3 shadow-sm';
    
            let categoryOptions = '';
            let currentCategory = null;
    
            categories.forEach(category => {
                if (currentCategory != category.id_categorie) {
                    if (currentCategory !== null) {
                        categoryOptions += "</optgroup>";
                    }
                    categoryOptions += `<optgroup label='${category.nom_categorie}'>`;
                    currentCategory = category.id_categorie;
                }
                categoryOptions += `<option value='${category.idSC}'>${category.nom}</option>`;
            });
    
            if (currentCategory !== null) {
                categoryOptions += "</optgroup>";
            }
    
            newProductForm.innerHTML = `
                <div class="card-body">
                    <h4 class="mb-3">Produit ${productCount}</h4>
    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Sous Catégorie :</label>
                            <select class="form-select" id="souscategorie${compteur}" name="idSC" aria-label="Sélectionnez une catégorie" onchange="filtreur(souscategorie${compteur}, ${compteur})">
                                <option value="" selected>Sélectionnez une sous catégorie</option>
                                ${categoryOptions}
                            </select>
                        </div>
    
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nom du produit :</label>
                            <select class="form-select" name="idP[]" id="produit${compteur}" required>
                                <option value="" selected>Sélectionnez un produit</option>
                            </select>
                        </div>
                    </div>
    
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Quantité :</label>
                            <input type="number" class="form-control" name="quantite[]" min="1" required>
                        </div>
    
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Unité :</label>
                            <input type="text" class="form-control" name="unite[]" placeholder="Pièce, carton, boîte" required>
                        </div>
                    </div>
    
                    <div class="d-flex justify-content-end">
                        <button type="button" class="btn btn-success" onclick="partielle_add(this, ${idbon})">
                            Enregistrer
                        </button>
                    </div>
                </div>
            `;
    
            productContainer.appendChild(newProductForm);
        } else {
            alert("Nombre d'ajout maximum atteint");
        }
    }
    
    function filtreur(idS, idP) {
        var idSousCategorie = idS.value;
        var produitSelect = document.getElementById('produit' + idP);
        produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>'; 
        if (idSousCategorie) {
          
            fetch('../../controlleur/controlleur.php?option=13&id_sous_categorie=' + idSousCategorie)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.error) {
                        console.error('Erreur lors de la récupération des produits :', data.error);
                    } else {
                        
                        data.forEach(produit => {
                            var option = document.createElement('option');
                            option.value = produit.idP;
                            option.text = produit.nomproduit;
                            produitSelect.append(option);
                        });
                    }
                })
                .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        } else {
            console.log('Aucune sous-catégorie sélectionnée.');
        }
    }

    function retour() {
        
        alert("Commande Sauvegarder !!!")
        location.href = "Liste_bon_cmd.php"
    }
    
    function filterProducts(count, idP) {
        const selectSubCategory = document.getElementById(`souscategorie${count}`);
        const selectedSubCatId = selectSubCategory.value;
        const productSelect = document.getElementById(`produit${idP}`);

     
        fetch('../../controlleur/controlleur.php?option=13&id_sous_categorie=' + selectedSubCatId)
            .then(response => response.json())
            .then(data => {
                productSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>';
             
                data.forEach(produit => {
                    var option = document.createElement('option');
                    option.value = produit.idP;
                    option.text = produit.nomproduit;
                    productSelect.append(option);
                });
            })
            .catch(error => console.error('Erreur lors de la récupération des produits :', error));
        productSelect.value = ""; // Réinitialiser la sélection du produit
    }

    function Supprimer(idP, idbc) {
        productName = document.getElementById("produit" + idP).textContent;
       
        Swal.fire({
            title: 'Êtes-vous certain?',
            text: "Voulez-vous vraiment supprimer ce produit?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '../../controlleur/controlleur.php', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(`option=64&idP=${idP}&idbc=${idbc}`);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        Swal.fire(
                            'Supprimé!',
                            'Le produit a été supprimé de la commande.',
                            'success'
                        ).then(() => {
                            location.reload();
                            
                        });
                    } else {
                        Swal.fire(
                            'Erreur!',
                            'Erreur lors de l\'enregistrement du produit.',
                            'error'
                        );
                    }
                };
            } else {
                Swal.fire(
                    'Action Interrompue',
                    'La suppression du produit a été annulée.',
                    'info'
                );
            }
        });
    }
    

     function Modifier(idbc, exIdP) {
        const selectElement = document.getElementById("produit" + exIdP);
        
        if (!selectElement) {
            console.error("Élément non trouvé pour l'ID : " + "produit" + exIdP);
            return;
        }
        
        let quantite = document.getElementById("quantity" + exIdP).value;
        let unitee = document.getElementById("unite" + exIdP).value;
        let newIdP = selectElement.value;
    
        if (!newIdP || !quantite || !unitee || quantite <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Données invalides',
                text: 'Veuillez remplir tous les champs correctement. La quantité doit être supérieure à 0.',
            });
            return;
        }
    
        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Voulez-vous effectuer ces modifications sur ce produit ?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, modifier!',
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
    
                const data = new URLSearchParams();
                data.append('option', 12);
                data.append('idP', newIdP);
                data.append('quantite', quantite);
                data.append('unite', unitee);
                data.append('idbc', idbc);
                data.append('id', exIdP);
    
                fetch('../../controlleur/controlleur.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: data.toString()
                })
                .then(response => response.json())
                .then(data => {
                    if (data) {
                        Swal.fire({
                            title: 'Succès!',
                            text: 'Modification accomplie.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur!',
                            text: 'Erreur lors de la modification du produit. Veuillez réessayer.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Erreur :', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur!',
                        text: 'Erreur de connexion au serveur.'
                    });
                });
            }
        });
    }
    function del(button, idP,idbc) {
        productName = document.getElementById("produit" + idP).textContent;
       
        Swal.fire({
            title: 'Êtes-vous certain?',
            text: "Voulez-vous vraiment supprimer ce produit?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer!',
            cancelButtonText: 'Annuler'
        }).then((result) => {
            if (result.isConfirmed) {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '../../controlleur/controlleur.php', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send(`option=64&idP=${idP}&idbc=${idbc}`);
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        Swal.fire(
                            'Supprimé!',
                            'Le produit a été supprimé de la commande.',
                            'success'
                        ).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire(
                            'Erreur!',
                            'Erreur lors de l\'enregistrement du produit.',
                            'error'
                        );
                    }
                };
            } else {
                Swal.fire(
                    'Action Interrompue',
                    'La suppression du produit a été annulée.',
                    'info'
                );
            }
        });
    }

    // function update(button, idbc, id, delButton, quantite, unite) {
    //     const productForm = button.parentElement.parentElement;
    //     const productId = productForm.querySelector('select[name="idP[]"]').value;
    //     const quantity = productForm.querySelector('input[name="quantite[]"]').value;
    //     const unitee = productForm.querySelector('input[name="unite[]"]').value;
    //     if (confirm("Etes vous sure de vouloir effectuer des modification ?")) {
    //         const xhr = new XMLHttpRequest();
    //         xhr.open('POST', '../../controlleur/controlleur.php', true);
    //         xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    //         xhr.send(`option=12&idP=${productId}&quantite=${quantity}&idbc=${idbc}&id=${id}&unite=${unitee}`);
    //         xhr.onload = function () {
    //             if (xhr.status === 200) {
    //                 alert("Modification Accomplie")
    //                 updating = 1
    //                 delButton.inert = false
    //             } else {
    //                 alert('Erreur lors de l\'enregistrement du produit');
    //             }
    //         };
    //     } else {
    //         alert("Action Interrompue")
    //         delButton.inert = false
    //     }
    // }

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

      function partielle_add(button, idbc) {
        const productForm = button.parentElement.parentElement;
        const productId = productForm.querySelector('select[name="idP[]"]').value;
        const quantity = productForm.querySelector('input[name="quantite[]"]').value;
        const unite = productForm.querySelector('input[name="unite[]"]').value;
    
        // Validation complète des champs
        if (!productId || !quantity || !unite) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }
    
        if (quantity <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Quantité invalide',
                text: 'La quantité doit être supérieure à 0'
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
    
        
        fetch('../../controlleur/controlleur.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `option=18&idP=${productId}&quantite=${quantity}&idbc=${idbc}&unite=${unite}`
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Produit ajouté avec succès',
                    timer: 1500,
                    showConfirmButton: false
                });
    
                // Hide the current button
                button.hidden = true;
    
                
                const updateButton = document.createElement('button');
                updateButton.type = 'button';
                updateButton.className = 'btn btn-warning me-2';
                updateButton.textContent = 'Modifier';
                updateButton.onclick = function() {
                    update(this, idbc, productId, delButton, quantity, unite);
                    delButton.inert = true;
                };
    
                
                const delButton = document.createElement('button');
                delButton.type = 'button';
                delButton.className = 'btn btn-danger';
                delButton.textContent = 'Supprimer';
                delButton.onclick = function() {
                    del(this, productId, idbc);
                };
    
                const buttonContainer = document.createElement('div');
                buttonContainer.className = 'd-flex justify-content-end gap-2 mt-3';
                buttonContainer.appendChild(updateButton);
                buttonContainer.appendChild(delButton);
    
                productForm.appendChild(buttonContainer);
    
                productForm.querySelector('select[name="idP[]"]').addEventListener('change', function() {
                    updateButton.inert = false;
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de l\'enregistrement du produit'
            });
        });
    }

    const idbon = new URLSearchParams(window.location.search).get('idbon');
    const nomBC = new URLSearchParams(window.location.search).get('nomBC');

    if (idbon) {
        $.ajax({
            url: '../../controlleur/controlleur.php',
            method: 'POST',
            data: { option: 11, idbon: idbon },
            dataType: 'json',
            success: function (data) {
                products = data.produits;
                allProducts = data.allProducts;
                categories = data.categories;
    
                $('#productsContainer').empty();
                $('#productsContainer').append(`<h2 class="mb-4">Bon de Commande : ${nomBC}</h2>`);
                let count = 1;
    
                products.forEach(function (ventes) {
                    let categoryOptions = '';
                    let currentCategory = null;
    
                    categories.forEach(category => {
                        if (currentCategory != category.id_categorie) {
                            if (currentCategory !== null) {
                                categoryOptions += "</optgroup>";
                            }
                            categoryOptions += `<optgroup label='${category.nom_categorie}'>`;
                            currentCategory = category.id_categorie;
                        }
                        categoryOptions += `<option value='${category.idSC}'>${category.nom}</option>`;
                    });
    
                    if (currentCategory !== null) {
                        categoryOptions += "</optgroup>";
                    }
    
                    let productOptions = `<option selected disabled id='produit${ventes.idP}' value='${ventes.idP}'>${ventes.nomproduit}</option>`;
                    allProducts.forEach(product => {
                        productOptions += `<option value='${product.idP}'>${product.nomproduit}</option>`;
                    });
    
                    $('#productsContainer').append(`
                        <div class="card mb-3 shadow-sm p-3">
                            <div class="card-body">
                                <h4 class="mb-3">Produit ${count}</h4>
    
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Sous Catégorie :</label>
                                        <select class="form-select" id="souscategorie${count}" name="idSC" aria-label="Sélectionnez une catégorie" onchange="filterProducts(${count},${ventes.idP})">
                                            <option value="" selected>${ventes.nom}</option>
                                            ${categoryOptions}
                                        </select>
                                    </div>
    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Nom du produit :</label>
                                        <select class="form-select" id="produit${ventes.idP}" name="idP[]" required>
                                            ${productOptions}
                                        </select>
                                    </div>
                                </div>
    
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Quantité :</label>
                                        <input type="number" class="form-control" id="quantity${ventes.idP}" name="quantite[]" min="1" value="${ventes.quantite}" required>
                                    </div>
    
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Unité :</label>
                                        <input type="text" class="form-control" id="unite${ventes.idP}" name="unite[]" value="${ventes.unite}" required>
                                    </div>
                                </div>
    
                                <div class="d-flex justify-content-end">
                                    <button type="button" class="btn btn-danger me-2" onclick="Supprimer(${ventes.idP}, ${idbon})">
                                        Supprimer
                                    </button>
                                    <button type="button" class="btn btn-warning" onclick="Modifier(${idbon}, ${ventes.idP})">
                                        Modifier
                                    </button>
                                </div>
                            </div>
                        </div>
                    `);
    
                    count++;
                });
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de la récupération des données:', error);
            }
        });
    }
    
    
    window.addProduct = addProduct;
    window.filtreur = filtreur;
    window.retour = retour;
    window.filterProducts = filterProducts;
    window.Supprimer = Supprimer;
    window.Modifier = Modifier;
    window.del = del;
    // window.update = update;
    window.removeProduct = removeProduct;
    window.remove = remove;
    window.partielle_add = partielle_add;
});