<?php

  include '../../log/Formulaire/config/db.php';
  $idproduit = $_POST["idproduit"];
  $quantité = $_POST["quantite"];
  $r = "insert into ventes(idproduit, quantité) values('$idproduit','$quantité')";
  $connexion->exec($r);
  if ($r) {
    $reponse = "ok";
    header("Location:../index.php?reponse=$reponse");
  } else {
    $reponse = "non";
    header("Location:../index.php?reponse=$reponse");
  }

?>
