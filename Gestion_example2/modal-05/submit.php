<?php
session_start();
try {
    include "../Categorie/Categorie/config/db.php";

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idsC = $_POST['idSC'];
        $idsF = $_POST['idF'];
        $productNames = $_POST['productName'];
        $prices = $_POST['price'];
        $stocks = $_POST['stock'];
        
        // Préparer la requête SQL d'insertion
        $sql = "INSERT INTO product (nomproduit, idF, prix_produit, Stock_actuel, Total, id_Sous_categorie) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $connexion->prepare($sql);

        // Utiliser foreach pour parcourir les produits et les insérer dans la base de données
        foreach ($productNames as $index => $productName) {
            $stmt->execute([
                $productName,
                $idsF[$index],
                $prices[$index],
                $stocks[$index],
                $stocks[$index], // Utiliser $stocks[$index] pour le total si c'est la même valeur
                $idsC
            ]);
        }

        
    }
    $_SESSION["reponse"] = "OK";
    header("Location:index.php");
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>