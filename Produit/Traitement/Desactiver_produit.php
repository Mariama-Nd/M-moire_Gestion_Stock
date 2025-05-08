<?php

  include '../../Categorie/Categorie/config/db.php';

  // Récupération des données envoyées en POST
  $idP = $_GET["idP"];
  $etats = '2';

  // Création de la requête SQL
  $sql = "UPDATE product SET id_statut = :etats WHERE idP = :idP";
  $stmt = $connexion->prepare($sql);
  $stmt->bindParam(':etats', $etats);
  $stmt->bindParam(':idP', $idP);

  // Exécution de la requête
  if ($stmt->execute()) {
   echo json_encode(true);
  } else {
    echo json_encode(false) ;
    }

?>