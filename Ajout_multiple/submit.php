<?php
session_start();
try {
    include "../Categorie/Categorie/config/db.php";

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idsC = $_POST['idSC'];
        $productNames = $_POST['productName'];
        $seuil = $_POST['seuil'];
        // Préparer la requête SQL d'insertion
        $sql = "INSERT INTO product (nomproduit, Stock_actuel,Seuil_limite, Total, id_Sous_categorie,retrait,id_statut) VALUES (?, ?, ?,?, ?,?,?)";
        $stmt = $connexion->prepare($sql);
        // Utiliser foreach pour parcourir les produits et les insérer dans la base de données
        foreach ($productNames as $index => $productName) {
            $stmt->execute([
                $productName,
                0,
                $seuil[$index],
                0, // Utiliser $stocks[$index] pour le total si c'est la même valeur
                $idsC,
                0,
                2
            ]);
        }
    }
    $_SESSION["reponse"] = "OK";
    header("Location:../Gestion_example2/nouveau_product.php");
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
