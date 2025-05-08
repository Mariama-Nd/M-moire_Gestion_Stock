<?php
include_once( "../../Categorie/Categorie/config/db.php");

$id_sous_categorie = $_GET['id_sous_categorie'];
//echo($id_sous_categorie." aloo");
//var_dump($id_sous_categorie);
$r = "SELECT p.idP, p.nomproduit 
     FROM product p
     JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
     WHERE  p.id_Sous_categorie = :id_sous_categorie
     ORDER BY p.nomproduit";

$requette = $connexion->prepare($r);
$requette->bindParam(':id_sous_categorie', $id_sous_categorie);
$requette->execute();
$reponse = $requette->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($reponse);
