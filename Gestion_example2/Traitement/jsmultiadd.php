<?php
// accepter toutes requêtes
header("Access-Control-Allow-Origin: *" );
header("Access-Control-Allow-Headers: *" );
header('Access-Control-Allow-Credentials: true' );
header("Access-Control-Allow-Methods: *" );
// connexion de la base de données
$connexion = new
PDO("mysql:host=localhost;port=3306;dbname=BD_Automobile;" ,"root","");
// récupération des données à partir de la base de données
$agent = $connexion ->query("select * from voiture " )
->fetchAll(PDO::FETCH_ASSOC);
//Envoyer la réponse sous format JSON
echo json_encode ($agent);