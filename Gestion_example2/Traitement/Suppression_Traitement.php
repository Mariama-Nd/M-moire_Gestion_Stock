<?php

    include "../../Formulaire/config/db.php";
$idv = $_GET["idV"];
    $r = "Delete from product where idP ='$idv'";
    $connexion->exec($r);
    if($r){
header("Location:../index.php");
    }
?>
