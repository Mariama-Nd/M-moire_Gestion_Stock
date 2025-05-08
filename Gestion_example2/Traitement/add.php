<?php
session_start();
include '../../Categorie/Categorie/config/db.php';
try{
$_SESSION["reponse"] = "" ;
  $nomproduit = htmlspecialchars($_POST["nomP"]);
  $stock = 0;
  $total = 0 ;
  $fournisseur = htmlspecialchars($_POST["idF"]);
  $idSC = htmlspecialchars($_POST["idSC"]);
  $seuil = htmlspecialchars($_POST["seuil"]);
  $retrait=  $total-$stock;

  $r = "insert into product(nomproduit,Stock_actuel,Seuil_limite,Total,id_Sous_categorie,retrait,id_statut) values('$nomproduit',$stock,$seuil,$total,$idSC,$retrait,2)";
  $connexion->query($r);
  if ($r) {
    $_SESSION["reponse"] = "OK";
    header("Location:../nouveau_product.php");
  } else {
    $_SESSION["reponse"] = "non";
    header("Location:../nouveau_product.php");
  }
}catch (PDOException $e) {
  echo "Erreur : " . $e->getMessage();
}
?>
