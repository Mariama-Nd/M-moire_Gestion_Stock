<?php

if (isset($_POST["modifier"])) {
    include '../../Formulaire/config/db.php';
    $idv = $_GET["idV"];
    $produit = $_POST["nomP"];
    $fournisseur = $_POST["idF"];
    $prix = $_POST["prix_produit"];
    $r = "Update product set nomproduit='$produit' , idF=$fournisseur, prix_produit='$prix' where idP='$idv'";
    $connexion->exec($r);
    if ($r) {
        header("Location:../index.php");
    } else {
        echo "
        <script>
            alert('Impossible de modifier ce contenu')
        </script>
        ";
    }
}


?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* CSS Styles */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }

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
    </style>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <title>Page de Modification</title>
</head>

<body>
    <div class="container">
        <a href="../index.php" class="btn btn-success"><i class="bi bi-arrow-left"></i> Liste</a>
        <h1>Gestion de l'Université</h1>

        <h2>Modification</h2>

        <form id="add-sale-form" method="post" action="" >
            <label for="quantity">Nom du Produit</label>
            <input type="text" id="quantity" name="nomP" min="1" required>
            <label for="quantity">Prix du Produit</label>
            <input type="number" id="quantity" name="prix_produit" min="1" required>
            
            <label for="product-name">Nom du Fournisseur:</label>
            <select class="form-select" id="product-name" name="idF" aria-label="Default select example">
                <?php
                include "../../Formulaire/config/db.php";
                $r = "Select * from  fournisseur";
                $requette = $connexion->prepare($r);
                $requette->execute();
                $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                foreach ($reponse as $ventes) {


                ?>
                    <option selected value="<?= $ventes["idF"] ?>"><?= $ventes["nom_fournisseur"] ?></option>

                <?php
                }
                ?>
            </select>
           <br>
            <button type="submit" class="btn btn-success" name="modifier">Modifier</button>
        </form>


    </div>
</body>

</html>