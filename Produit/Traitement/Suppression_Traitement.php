<?php

    include "../../log/Formulaire/config/db.php";
$idv = $_GET["idV"];
    $r = "Delete from ventes where idvente ='$idv'";
    $connexion->exec($r);
    if($r){
header("Location:../index.php");
    }
?>
