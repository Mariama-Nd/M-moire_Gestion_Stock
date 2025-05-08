<?php
session_start();

if (isset($_SESSION["reponse"]) && $_SESSION["reponse"] == "OK") {
    echo "
  <script>
    alert('Produits Ajouter avec success')
  </script>";
  unset($_SESSION["reponse"]);
  } else {
    echo "
    <script>
      alert('Impossible d'ajouter ce produit. Veuillez entrez de nouvelles inforation puis réessayer ')
    </script>";
  }

?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestion de Produits</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
            background-color: white;
            margin: 15% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            border-radius: 5px;
        }
        .close {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close:hover,
        .close:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .product-form {
            border: 1px solid #ccc;
            padding: 20px;
            margin-bottom: 10px;
            border-radius: 5px;
        }
        .product-form h4 {
            margin-top: 0;
        }
        .buttons {
            margin-top: 10px;
        }
        .add-button, .remove-button {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            margin-right: 10px;
        }
        .remove-button {
            background-color: #f44336;
        }
        .add-button:hover, .remove-button:hover {
            opacity: 0.8;
        }
        .submit-button {
            background-color: #008CBA;
            color: white;
            padding: 15px 20px;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .submit-button:hover {
            opacity: 0.8;
        }
        #openModalButton {
            margin-left:  40%;
            margin-top:  15%;
            width: 200px;
            height: 80px;
    background-color: green;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
    </style>
</head>
<body>
<button id="openModalButton">Ajouter des Produits</button>

<script >
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
</script>

</body>
</html>