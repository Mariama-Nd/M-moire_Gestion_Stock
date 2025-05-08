<?php
session_start();

if (isset($_SESSION["reponse"])) {
  if ($_SESSION["reponse"] == "OK") {
      echo "<script>alert('Modification reussie');</script>";
  } elseif ($_SESSION["reponse"] == "stock_insuffisant") {
      echo "<script>alert('Stock insuffisant pour cette quantité');</script>";
  } elseif ($_SESSION["reponse"] == "non") {
    echo "<script>alert('Échec de l\'opération');</script>";
  }
     
  unset($_SESSION["reponse"]);
}
if (isset($_SESSION["message"]) && $_SESSION["message"] == "Fait") {
  echo "<script>alert('Quantités des Produits Sélectionnés Mis à Jour avec success')</script>";
  unset($_SESSION["message"]);
}
if (isset($_SESSION["message"]) && $_SESSION["message"] == "stock_insuffisant") {
  echo "<script>alert('Stock insuffisant pour cette quantité')</script>";
  unset($_SESSION["message"]);
}
if(isset($_SESSION["id"])){
  include '../../Categorie/Categorie/config/db.php';
  $r = $connexion->prepare("SELECT Stock_actuel FROM product WHERE idP = :idproduit");
$r->bindParam(':idproduit', $_SESSION["id"], PDO::PARAM_INT);
$r->execute();
$result = $r->fetch(PDO::FETCH_ASSOC);
  if($result['Stock_actuel'] == 0){
    $update = "UPDATE product SET id_statut = 2 WHERE idP = :idproduit";
      $stmt = $connexion->prepare($update);
      $stmt->bindParam(':idproduit', $_SESSION["id"], PDO::PARAM_INT);
      $stmt->execute();
      echo "<script>alert('Stock du produit epuisées ')</script>";
  }
   
    unset($_SESSION["id"]);
  }
  
?>

<!doctype html>
<html lang="en">

<head>
  
  <title>Accueill</title>
  <style>
    /* CSS Styles */
    body {
      font-family: 'Poppins', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h1, h2 {
      text-align: center;
      color: #333;
    }

    form {
      background-color: #fff;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    select, input[type="number"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 3px;
      margin-bottom: 10px;
    }

    button {
      background-color: #007bff;
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 3px;
      cursor: pointer;
      width: 100%;
    }

    button:hover {
      background-color: #0056b3;
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
      background-color: rgba(0, 0, 0, 0.4);
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

    .add-button {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 10px;
      cursor: pointer;
      margin-top: 10px;
    }

    .add-button:hover {
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
  </style>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <link href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700,800,900" rel="stylesheet">
</head>

<body>
  <div class="container">
    <a href="../../accueil.php" class="btn btn-success mb-3"><i class="bi bi-arrow-left"></i> Accueil</a>
    <button id="openModalButton" class="btn btn-success float-end mb-3" hidden="true">MultiAdd</button>

    <h1>Gestion de l'Université</h1>
    <h2>Gestion du Stock</h2>
    <form id="add-sale-form" method="post" action="../Traitement/Ajout_Traitement.php">
      <label for="sous-categorie">Sous Catégorie</label>
      <select class="form-select" id="sous-categorie" name="id_sous_categorie">
        <option selected disabled>Sélectionnez une sous-catégorie</option>
        <?php
        include "../../Categorie/Categorie/config/db.php";
        $r = "SELECT * FROM sousCategorie ORDER BY nom";
        $requette = $connexion->prepare($r);
        $requette->execute();
        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
        foreach ($reponse as $ventes) {
          echo "<option value='" . $ventes["idSC"] . "'>" . $ventes["nom"] . "</option>";
        }
        ?>
      </select>

      <label for="produit">Nom du Produit</label>
      <select class="form-select" id="produit" name="idproduit"></select>

      <label for="types">Action</label>
      <select class="form-select" id="types" name="types">
        <option value="">Sélectionner une action</option>
        <?php
        $r = "SELECT * FROM types WHERE idtypes = 2";
        $requette = $connexion->prepare($r);
        $requette->execute();
        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
        foreach ($reponse as $ventes) {
          echo "<option value='" . $ventes["idtypes"] . "'>" . $ventes["nom_type"] . "</option>";
        }
        ?>
      </select><br>

      <label>Stock Actuel:<span id="stock_actuel"></span></label>
      <span id="operanteur"></span>
      <span id="saisie"></span>
      <span id="egal"></span>
      <span id="resultat"></span>
      <br>

      <label for="stock">Quantite</label>
      <input type="number" class="form-control" id="stock" name="quantite">

      <button type="submit" id="bnt_page" class="btn btn-success mt-3" name="ajouter">Effectuer</button>
    </form>
  </div>

  <div id="productModal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <form id="productForm" action="ajout_stock_multi.php" method="post">
        <div id="productsContainer">
          <div class="product-form">
            <h4>Produit 1</h4>

            <label for="sous-categorie">Sous Catégorie</label>
            <select class="form-select" id="sous-categorie" name="id_sous_categorie">
              <option selected disabled>Sélectionnez une sous-catégorie</option>
              <?php
              $r = "SELECT * FROM sousCategorie ORDER BY nom";
              $requette = $connexion->prepare($r);
              $requette->execute();
              $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
              foreach ($reponse as $ventes) {
                echo "<option value='" . $ventes["idSC"] . "'>" . $ventes["nom"] . "</option>";
              }
              ?>
            </select>

            <label>Nom du produit:</label>
            <select class="form-select" name="idP[]" required>
              <?php
              $r = "SELECT * FROM product ORDER BY nomproduit";
              $requette = $connexion->prepare($r);
              $requette->execute();
              $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
              foreach ($reponse as $ventes) {
                echo "<option value='" . $ventes["idP"] . "'>" . $ventes["nomproduit"] . "</option>";
              }
              ?>
            </select>

            <label for="product-name">Types d'action :</label>
            <select class="form-select" id="product-name" name="types[]">
              <?php
              $r = "SELECT * FROM types WHERE idtypes = 2";
              $requette = $connexion->prepare($r);
              $requette->execute();
              $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
              foreach ($reponse as $ventes) {
                echo "<option value='" . $ventes["nom_type"] . "'>" . $ventes["nom_type"] . "</option>";
              }
              ?>
            </select>

            <label for="quantity">Quantité:</label>
            <input type="number" id="quantity" name="quantite[]" min="1" required>
          </div>
        </div>
        <div class="buttons">
          <button type="button" class="add-button" onclick="addProduct()">Plus</button>
        </div>
        <button type="submit" class="submit-button mt-3" name="soumettre">Soumettre</button>
      </form>
    </div>
  </div>

  <script>
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
      if (event.target == modal){
        modal.style.display = "none";
      }
    }

    let productCount = 1;

    function addProduct() {
      productCount++;
      if(productCount <= 5){
        
            const productContainer = document.getElementById('productsContainer');
            const newProductForm = document.createElement('div');
            newProductForm.className = 'product-form';
            newProductForm.innerHTML = `
            <h4>Produit ${productCount}</h4>
            <label>Nom du produit:</label>
            <select class="form-select" name="idP[]" required>
              <?php
              $r = "SELECT * FROM product";
              $requette = $connexion->prepare($r);
              $requette->execute();
              $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
              foreach ($reponse as $ventes) {
                echo "<option value='" . $ventes["idP"] . "'>" . $ventes["nomproduit"] . "</option>";
              }
              ?>
            </select>
            <label for="">Types d'action :</label>
            <select class="form-select" id="product-name" name="types[]" aria-label="Default select example">
              <?php
              $r = "Select * from  types";
              $requette = $connexion->prepare($r);
              $requette->execute();
              $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
              foreach ($reponse as $ventes) {


              ?>
                <option selected value="<?= $ventes["nom_type"] ?>"><?= $ventes["nom_type"] ?></option>

              <?php
              }
              ?>
            </select>
            <label for="quantity">Quantité:</label>
            <input type="number" id="quantity" name="quantite[]" min="1" required>
          <button type="button" class="remove-button" onclick="removeProduct(this)">Supprimer</button>`;

      productContainer.appendChild(newProductForm);
    }else{
      alert("Nombre d'ajout maximum atteint")
    }
  }
    function removeProduct(button) {
      productCount--;
      const productForm = button.parentElement;
      productForm.remove();
    }

    document.getElementById('sous-categorie').addEventListener('change', function() {
      // Récupérer la valeur de la sous-catégorie sélectionnée
      var idSousCategorie = this.value;

      // Faire une requête AJAX pour récupérer les produits de la sous-catégorie sélectionnée
      fetch('liste_produit.php?id_sous_categorie=' + idSousCategorie)
        .then(response => response.json())
        .then(data => {
          // Vider le select des produits
          var produitSelect = document.getElementById('produit');
          produitSelect.innerHTML = '<option selected disabled>Sélectionnez un produit</option>';

          // Remplir le select des produits avec les données récupérées
          data.forEach(produit => {
            var option = document.createElement('option');
            option.value = produit.idP;
            option.text = produit.nomproduit;
            produitSelect.add(option);
          });
        })
        .catch(error => console.error('Erreur lors de la récupération des produits :', error));
    });
    // Écouter l'événement 'change' sur le select de produit
    document.getElementById('produit').addEventListener('change', function() {
      // Récupérer la valeur du produit sélectionné
      var idProduit = this.value;
      // Faire une requête AJAX pour récupérer le stock du produit sélectionné
      fetch('stock_actuel.php?id_produit=' + idProduit)
        .then(response => response.json())
        .then(data => {
          // Afficher le stock du produit dans l'input
          document.getElementById('stock_actuel').innerHTML = data.Stock_actuel;
          document.getElementById('types').addEventListener('change', function() {
            let bl = document.getElementById('bl');
            let numBL = document.getElementById('numBL');
            let nomF = document.getElementById('nomF');
            let telF = document.getElementById('telF');
            if (document.getElementById('types').value==1) {
              document.getElementById('operanteur').innerHTML = " + " 
              bl.innerHTML=`<label for="stock" >Bon de Livraison</label>
                            <input type="file" class="form-control" name="bl">`;

              numBL.innerHTML=`<label for="numBL">Numero BL</label>
                             <input type="number" class="form-control" id="numBL" name="numBL">`;

              nomF.innerHTML=`<label for="nomF">Nom Fournisseur</label>
                              <input type="text" class="form-control" id="nomF" name="nomF">`;

              telF.innerHTML=`<label for="telF">Téléphone Fournisseur</label>
                              <input type="text" class="form-control" id="telF" name="telF">`;

            }else{
              document.getElementById('operanteur').innerHTML = " - ";
              bl.innerHTML='';
              numBL.innerHTML='';
              nomF.innerHTML='';
              telF.innerHTML='';
             
            }

          })
          document.getElementById('stock').addEventListener('input', function() {
              let quantite=document.getElementById('stock').value;
              document.getElementById('saisie').innerHTML =quantite;
               document.getElementById('egal').innerHTML = " = ";
               let resultat= document.getElementById('resultat');
               
               if (document.getElementById('types').value==1) {
                resultat.innerHTML= parseInt(data.Stock_actuel) + parseInt(quantite)
                
            }else{
              resultat.innerHTML= parseInt(data.Stock_actuel) - parseInt(quantite) 
             
            }
            if (resultat.innerHTML<0) {
              document.getElementById('bnt_page').inert= true;
              resultat.style.color="red";
            }else{
              document.getElementById('bnt_page').inert= false;
              resultat.style.color="green";
            }
          })
        })
        .catch(error => console.error('Erreur lors de la récupération du stock :', error));
    });

  </script>
  <script src="js/jquery.min.js"></script>
  <script src="js/popper.js"></script>
  <script src="js/bootstrap.min.js"></script>
  <script src="js/main.js"></script>
</body>

</html>