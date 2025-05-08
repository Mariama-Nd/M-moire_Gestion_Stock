<?php
session_start();
$date = date('Y-m-d H:i:s');
include '../../Categorie/Categorie/config/db.php';
$_SESSION["reponse"] = "" ;
$action = htmlspecialchars($_POST["types"]);
if($action == 1){
  $idproduit = htmlspecialchars($_POST["idproduit"]);
  $quantité = htmlspecialchars($_POST["quantite"]);
  if ($quantité>0) {
    $statut=1;
  }else{
    $statut=2;
  }
  $r = "update product set Stock_actuel=Stock_actuel+$quantité , Total=Total+$quantité,id_statut=$statut where idP =$idproduit";
  $connexion->exec($r);

  $add = "insert into historisation(idP,idtypes,datemodif,stock) values($idproduit,1,'$date',$quantité)";
  $connexion->query($add);
  if ($r) {
    $_SESSION["reponse"] = "OK";
    $r = $connexion->prepare("SELECT id_statut FROM product WHERE idP = :idproduit");
    $r->bindParam(':idproduit', $idproduit, PDO::PARAM_INT);
    $r->execute();
    $result = $r->fetch(PDO::FETCH_ASSOC);
    if ( $result['id_statut'] ==2) {
        // Mettre à jour le stock et ajouter à l'historisation
        $update = "UPDATE product SET id_statut=1 WHERE idP = :idproduit";
        $stmt = $connexion->prepare($update);
        $stmt->bindParam(':idproduit', $idproduit, PDO::PARAM_INT);
        $stmt->execute();
      }
      header("Location:../modal-05/index.php"); 

}else {
  $_SESSION["reponse"] = "non";
  header("Location:../modal-05/index.php");
}

}elseif($action == 2){
  $idproduit = $_POST["idproduit"];
  $quantite = $_POST["quantite"];
  // Récupérer le stock actuel du produit
$r = $connexion->prepare("SELECT Stock_actuel FROM product WHERE idP = :idproduit");
$r->bindParam(':idproduit', $idproduit, PDO::PARAM_INT);
$r->execute();
$result = $r->fetch(PDO::FETCH_ASSOC);
if ($result && $result['Stock_actuel'] >= $quantite) {
    // Mettre à jour le stock et ajouter à l'historisation
    $update = "UPDATE product SET Stock_actuel = Stock_actuel - :quantite, retrait = retrait + :quantite WHERE idP = :idproduit";
    $stmt = $connexion->prepare($update);
    $stmt->bindParam(':quantite', $quantite, PDO::PARAM_INT);
    $stmt->bindParam(':idproduit', $idproduit, PDO::PARAM_INT);
    $stmt->execute();

    $date = date('Y-m-d H:i:s'); // Assurez-vous que $date est correctement défini
    $add = "INSERT INTO historisation(idP, idtypes, datemodif, stock) VALUES(:idproduit, 2, :datemodif, :stock)";
    $stmt = $connexion->prepare($add);
    $stmt->bindParam(':idproduit', $idproduit, PDO::PARAM_INT);
    $stmt->bindParam(':datemodif', $date);
    $stmt->bindParam(':stock', $quantite, PDO::PARAM_INT);
    $stmt->execute();
    

    if ($stmt) {
        $_SESSION["reponse"] = "OK";
        $_SESSION["id"] = $idproduit;
    } else {
        $_SESSION["reponse"] = "non";
    }
} else {
    $_SESSION["reponse"] = "stock_insuffisant";
}
header("Location:../modal-05/index.php");
}
  
?>
