$(document).ready(function () {
    const addSaleForm = document.getElementById('add-sale-form');
    const productForm = document.getElementById('productForm');
    const submitButtonAjout = document.getElementById('btnAjout'); 
    const submitButtonAjoutMultiple = document.getElementById('btnAjoutMultiple');

    function validateForm1() {
        let isValid = true;
        const seuilInputs = document.querySelectorAll('input[name="seuil"]');
        seuilInputs.forEach(input => {
            if (input.value <= 0 || input.value == "") {
                isValid = false;
            } else {
                input.setCustomValidity('');
            }
        });
        return isValid;
    }

    function validateForm2() {
        let isValid = true;
        const seuilInputs = document.querySelectorAll('input[name="seuil[]"]');
        seuilInputs.forEach(input => {
            if (input.value <= 0 || input.value == "") {
                isValid = false;
                
            } else {
                input.setCustomValidity('');
            }
        });
        return isValid;
    }

    function toggleSubmitButton1() {
        if (validateForm1()) {
            submitButtonAjout.classList.remove('d-none');
            submitButtonAjout.classList.add('d-block');
        } else {
            submitButtonAjout.classList.remove('d-block');
            submitButtonAjout.classList.add('d-none');
        }
    }

    function toggleSubmitButton2() {
        if (validateForm2()) {
            submitButtonAjoutMultiple.classList.remove('d-none');
            submitButtonAjoutMultiple.classList.add('d-block');
        } else {
            submitButtonAjoutMultiple.classList.remove('d-block');
            submitButtonAjoutMultiple.classList.add('d-none');
        }
    }

    if (addSaleForm) {
        addSaleForm.addEventListener("keydown", function (e) { 
            if (e.keyCode == 13) e.preventDefault();
        });

        addSaleForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateForm1()) {
                return;
            }
            const formData = $(this).serialize() + '&option=3';

            $.ajax({
                type: 'post',
                url: '../controlleur/controlleur.php',
                data: formData,
                success: function (data) {
                    if (data == "OK") {
                        addSaleForm.reset();
                        toggleSubmitButton1(); 
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Produit ajouté avec succès',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Ajout du produit échoué',
                        }).then(() => {
                            location.reload();
                        });
                    }
                },
                error: function (resultat, statut, erreur) {
                    console.error('Erreur AJAX:', erreur);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'ajout du produit',
                    });
                }
            });
        });

        addSaleForm.addEventListener('input', toggleSubmitButton1);
    }

    if (productForm) {
        productForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!validateForm2()) {
                return;
            }
            const formData = $(this).serialize() + '&option=4';

            $.ajax({
                type: 'post',
                url: '../controlleur/controlleur.php',
                data: formData,
                success: function (data) {
                    if (data == "OK") {
                        productForm.reset();
                        toggleSubmitButton2(); 
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Produits ajoutés avec succès',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Ajout des produits échoué',
                        });
                    }
                },
                error: function (resultat, statut, erreur) {
                    console.error('Erreur AJAX:', erreur);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'ajout des produits',
                    });
                }
            });
        });

        productForm.addEventListener('input', toggleSubmitButton2);
    }

     function loadCategories() {
        $.ajax({
            type: 'post',
            url: '../controlleur/controlleur.php',
            data: { option: 1 },
            success: function (data) {
                console.log(data); 
                if (data == "pasConnexion") {
                    window.location.href = "page-de-connexion";
                } else if (data == "Erreur") {
                    window.location.href = "/erreur";
                } else {
                    const categories = JSON.parse(data);
                    const selectElements = $('#product-name, #productModal #product-name');
                    
                    selectElements.empty(); // Clear existing options
    
                    categories.forEach(item => {
                        if (item.type === 'optgroup_start') {
                            selectElements.append(`<optgroup label="${item.label}">`);
                        } else if (item.type === 'option') {
                            selectElements.append(`<option value="${item.value}">${item.text}</option>`);
                        } else if (item.type === 'optgroup_end') {
                            selectElements.append(`</optgroup>`);
                        }
                    });
                }
            },
            error: function (resultat, statut, erreur) {
                console.error('Erreur AJAX:', erreur);
                window.location.href = "/erreur";
            }
        });
    }

    loadCategories();

    const modal = document.getElementById("productModal");
    const openModalButton = document.getElementById("openModalButton");
    const closeButton = document.getElementsByClassName("close")[0];

    if (openModalButton) {
        openModalButton.onclick = function() {
            modal.style.display = "block";
            loadCategories(); 
        }
    }

    if (closeButton) {
        closeButton.onclick = function() {
            modal.style.display = "none";
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

let productCount = 1;

function addProduct() {
    productCount++;
    if (productCount <= 5) {
        const productContainer = document.getElementById('productsContainer');
        const newProductForm = document.createElement('div');
        newProductForm.className = 'product-form';
        newProductForm.innerHTML = `
            <h4>Produit ${productCount}</h4>
            <label>Categorie:</label>
            <select class="form-select" name="idSC" aria-label="Sélectionnez une catégorie">
                <option value="">Sélectionnez une catégorie</option>
                ${$('#product-name').html()}
            </select>
            <label>Nom du produit:</label>
            <input type="text" name="productName[]" required>
            <label for="seuil">Seuil Limite</label>
            <input type="number" name="seuil[]" min="1" required>
            <button type="button" class="remove-button" onclick="removeProduct(this)">Supprimer</button>
        `;
        productContainer.appendChild(newProductForm);
        newProductForm.querySelector('input[name="seuil[]"]').addEventListener('input', toggleSubmitButton2());
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Limite atteinte',
            text: 'Nombre d\'ajout maximum atteint',
        });
    }
}

function removeProduct(button) {
    productCount--;
    const productForm = button.parentElement;
    productForm.remove();
    toggleSubmitButton2();
}