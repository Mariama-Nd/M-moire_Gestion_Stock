<?php
session_start();

if (isset($_SESSION["reponse"]) && $_SESSION["reponse"] == "ok") {
  echo "
<script>
  alert('Produit Ajouter avec success')
</script>";
} else {
  echo "
  <script>
    alert('Impossible d'ajouter ce produit. Veuillez entrez de nouvelles inforation puis réessayer ')
  </script>";
}
?>

<!DOCTYPE html>
<html>

<head>
  <title>Gestion des Entrées</title>
  <style>
    /* CSS Styles */
  
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    h1,
    h2 {
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

    input[type="text"],
    input[type="number"] {
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
    }

    button:hover {
      background-color: #0056b3;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    table th,
    table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    table th {
      background-color: #f2f2f2;
    }

    table button {
      background-color: #dc3545;
      color: #fff;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }

    table button:hover {
      background-color: #c82333;
    }
    
  .form-group {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 16px;
    font-weight: bold;
    margin-right: 10px;
  }

  .form-checkbox {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    margin-right: 10px;
    cursor: pointer;
  }

  .form-checkbox:checked {
    background-color: #007bff;
    border-color: #007bff;
  }

  .form-input {
    flex: 1;
    padding: 8px 12px;
    font-size: 16px;
    border: 2px solid #ccc;
    border-radius: 4px;
  }

  .form-input:focus {
    outline: none;
    border-color: #007bff;
  }

  </style>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>
  <div class="container">
    <a href="#" class="btn btn-success"><i class="bi bi-arrow-left"></i> Accueil</a>
    <h1>Gestion de l'Université</h1>
    <h2>Ajout de Produits Multiple</h2>
    <form id="add-sale-form" method="post" action="Traitement/multiple.php">
      <?php
      include "../Formulaire/config/db.php";
      $r = "Select * from  product";
      $requette = $connexion->prepare($r);
      $requette->execute();
      $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
      foreach ($reponse as $ventes) {


      ?><div class="form-group">
          <label for="my-checkbox" class="form-label" ><?= $ventes["nomproduit"] ?></label>
          <input type="checkbox" id="my-checkbox<?= $ventes['idP'] ?>" class="form-checkbox" value="<?= $ventes['idP'] ?>" name="idP" onclick="affiche(<?= $ventes['idP'] ?>)">
          <input type="number" id="input<?= $ventes['idP'] ?>" class="form-input" placeholder="quantite" width="30%" required name="quantite">
        </div>

      <?php
      }
      ?>
      <button type="submit" class="btn btn-success" name="ajouter" onclick="add()">Ajouter</button>
      <a href="nouveau_product.php" class="btn btn-success">Nouveau Produit</a>
    </form>

  </div>

  <script>
    // JavaScript code remains the same as before
  </script>
  <script src="js/gestion_ajout.js"></script>
</body>

</html>