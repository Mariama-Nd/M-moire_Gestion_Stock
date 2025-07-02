<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once '../../Categorie/Categorie/config/db.php';

$db = new DB();
$connexion = $db->connect();
$postData = http_build_query([
    'option' => 106,
    'date' => '2025-07-02',
    'mode' => 'global'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-type: application/x-www-form-urlencoded",
        'content' => $postData,
    ]
]);

$response = file_get_contents("http://localhost/University_Gestion/controlleur/controlleur.php", false, $context);
echo $response;
