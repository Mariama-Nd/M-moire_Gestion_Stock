const modal = document.getElementById("productModal");
const openModalButton = document.getElementById("openModalButton");
const closeButton = document.getElementsByClassName("close")[0];

openModalButton.onclick = function() {
    modal.style.display = "block";
}

closeButton.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

let productCount = 1;

function addProduct() {
    productCount++;
    const productContainer = document.getElementById('productsContainer');
    
    const newProductForm = document.createElement('div');
    newProductForm.className = 'product-form';
    newProductForm.innerHTML = `
    <h4>Produit ${productCount}</h4>
    <label>Nom du Fournisseur</label>
    <select class="form-select" id="product-name" name="idF[]" aria-label="Default select example">
                <?php
                    $r = "Select * from  fournisseur";
                    $requette = $connexion->prepare($r);
                    $requette->execute();
                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($reponse as $ventes) {
                        ?>
                        <option selected value="<?= $ventes["idF"] ?>"><?= $ventes["nomF"] ?></option>

                <?php
                    }
                ?>

            </select><br><br>
             <label>Nom du produit:</label>
    <input type="text" name="productName[]" required><br><br>
             <label>Prix Produit</label>
            <input type="number" name="price[]" required><br><br>
    <label>Stock actuel:</label>
    <input type="number" name="stock[]" min="0" required><br><br>
    <button type="button" class="remove-button" onclick="removeProduct(this)">Supprimer</button>
`;
 
    productContainer.appendChild(newProductForm);
}

function removeProduct(button) {
    const productForm = button.parentElement;
    productForm.remove();
}
/*
document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    // Vous pouvez maintenant envoyer formData à votre serveur ou le traiter comme vous le souhaitez
    console.log(Array.from(formData.entries()));
    alert('Formulaire soumis avec succès!');
    modal.style.display = "none";
});*/