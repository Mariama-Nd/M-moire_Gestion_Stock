<?php
$response = file_get_contents('http://localhost/University_Gestion/controlleur/controlleur.php', false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-type: application/x-www-form-urlencoded",
        'content' => http_build_query(['option' => 104, 'id' => 43])
    ]
]));
echo $response;