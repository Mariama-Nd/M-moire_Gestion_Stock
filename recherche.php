
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
        <title>Recherche</title>
    </head>
    <body>
         <!-- Search Start -->

         <div class="col-md-2" style="margin-top:20px">
            <a class="btn btn-dark border-0 w-100"  href="Produit/Liste_Produit.php">Retour</a>
        </div>
    <form action="" method="post">
     <div class="container-fluid bg-primary mb-5 wow fadeIn" data-wow-delay="0.1s" style="padding: 35px;">
            <div class="container">
                <div class="row g-2">
                    <div class="col-md-10">
                        <div class="row g-2">
                            <div class="col-md-4">
                                <input type="text" class="form-control border-0" placeholder="mot" name="mot" required/>
                            </div>
                            <div class="col-md-4">
                                <select class="form-select border-0" name="categorie">
                                <?php
                                  include "log/Formulaire/config/db.php";
                                  $r = "Select * from categorie ";
                                  $requette = $connexion->prepare($r);
                                  $requette->execute();
                                  $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                  foreach ($reponse as $categ) {
                                  ?>
                                  <option selected value="<?= $categ["id_categorie"] ?>"><?= $categ["nom_categorie"] ?></option>

                                <?php
                                }
        ?>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-dark border-0 w-100" type="submet" name="Rechercher" >Rechercher</button>
                    </div>
                </div>
            </div>
        </div>
        </form>
        <!-- Search End -->

    </body>
    </html>


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

  <?php if (isset($_POST["Rechercher"])) {
    $mot = $_POST["mot"];
    $categorie = $_POST["categorie"];
    include 'log/Formulaire/config/db.php';
 
    $r = "select * from product p, sousCategorie sc, fournisseur f where p.id_Sous_categorie = sc.idSC and f.idF=p.idF and p.id_categorie = ".$categorie." or p.nomproduit like '".$mot."%'";
    $requett = $connexion->prepare($r);
    $requett->execute();
    $reponse = $requett->fetchAll(PDO::FETCH_ASSOC);

    if(count($reponse) == 0){
      echo "<h1>Aucun Produit conrespondant Trouver ! Veuillez réessayer en utilisant les bon mots clés</h1>";
    }else{
  ?>

  <script>
      // let tableBody=document.getElementById('tb')
      let tableBody = document.querySelector("#sales-table tbody");
                
      function name() {
          if (tableBody) {
              tableBody.innerHTML=""
          }
      }

  </script>
    <table id="sales-table">
      <thead>
        <tr class="bg-success">
          <th>Identifiant</th>
          <th>Nom</th>
          <th>Prix</th>
          <th>Categorie</th>
          <th>Stock actuel</th>
          <th>Total</th>
          <th>prenom Fournisseur</th>
          <th>nom Fournisseur</th>
          <th colspan="2" style="text-align: center;">Action</th>
        </tr>
      </thead>
      <tbody id="tb">
        <?php
         foreach ($reponse as $mariama) {?>

          <tr>
            <td> <?= $mariama["idP"] ?> </td>
            <td><?= $mariama["nomproduit"] ?></td>
            <td><?= $mariama["prix_produit"] ?></td>
            <td><?= $mariama["nom_categorie"] ?></td>
            <td><?= $mariama["Stock_actuel"] ?></td>
            <td><?= $mariama["Total"] ?></td>
            <td><?= $mariama["prenomF"] ?></td>
            <td><?= $mariama["nomF"] ?></td>
            <td><a href="Traitement/Modification_traitement.php?idV=<?= $mariama["idP"] ?>" class="btn btn-warning">Modifier</a></td>
            <td><a href="Traitement/Suppression_Traitement.php?idV=<?= $mariama["idP"] ?>" class="btn btn-danger" name="idV" onclick="return confirm('Vous êtes sur le point de supprimer , vous voulez vraiment supprimer');">Supprimer</a></td>
          </tr>

        <?php } ?>
      </tbody>
    </table>

    <?php }} ?>