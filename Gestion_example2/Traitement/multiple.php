<?php
include "../../Formulaire/config/db.php";

// Vérifier si le formulaire a été soumis
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["ajouter"])) {
    $data = [];

    // Récupérer les données du formulaire
    foreach ($_POST as $key => $value) {
        if (strpos($key, "input") === 0) {
            $produitId = str_replace("input", "", $key);
            $data[] = [
                "idP" => $produitId,
                "quantite" => $value
            ];
        }
    }
    var_dump($data);
    // Préparer la requête SQL
    $sql = "update product set Stock_actuel = Stock_actuel + ? , Total = Total + ? where idP = ?";
    $stmt = $connexion->prepare($sql);
    // Exécuter la requête pour chaque ligne de données
    foreach ($data as $row) {
        $stmt->bindParam(3, $row["idP"], PDO::PARAM_INT);
        $stmt->bindParam(1, $row["quantite"], PDO::PARAM_INT);
        $stmt->bindParam(2, $row["quantite"], PDO::PARAM_INT);
        $stmt->execute();
    }
    // Rediriger l'utilisateur vers une page de succès ou de confirmation
   // header("Location: ../ajout_multiple.php");
   // exit;
}
?>
