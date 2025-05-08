<?php
session_start();
try {
    include "../../Categorie/Categorie/config/db.php";

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $idP = $_POST['idP'];
        $quantite = $_POST['quantite'];
        $date = date("Y-m-d");
        $type = $_POST['types'];

        for ($i = 0; $i < count($idP); $i++) {
            if ($type[$i] == "Ajout") {
                $sql = "UPDATE product SET Stock_actuel = Stock_actuel + ?, Total = Total + ? WHERE idP = ?";
                $stmt = $connexion->prepare($sql);
                $stmt->execute([$quantite[$i], $quantite[$i], $idP[$i]]);

                $sql = "INSERT INTO historisation (idP, idtypes, datemodif, stock) VALUES (?, ?, ?, ?)";
                $stmt = $connexion->prepare($sql);
                $stmt->execute([$idP[$i], 1, $date, $quantite[$i]]);

                $_SESSION["message"] = "Fait";
                 header("Location:index.php");
            } elseif ($type[$i] == "Retrait") {
                // Récupérer le stock actuel du produit
                $sql = "SELECT Stock_actuel FROM product WHERE idP = ?";
                $stmt = $connexion->prepare($sql);
                $stmt->execute([$idP[$i]]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
                if ($result && $result['Stock_actuel'] >= $quantite[$i]) {
                    // Mettre à jour le stock et ajouter à l'historisation
                    $sql = "UPDATE product SET Stock_actuel = Stock_actuel - ?, retrait = retrait + ? WHERE idP = ?";
                    $stmt = $connexion->prepare($sql);
                    $stmt->execute([$quantite[$i], $quantite[$i], $idP[$i]]);
        
                    $sql = "INSERT INTO historisation (idP, idtypes, datemodif, stock) VALUES (?, ?, ?, ?)";
                    $stmt = $connexion->prepare($sql);
                    $stmt->execute([$idP[$i], 2, $date, $quantite[$i]]);
        
                    $_SESSION["message"] = "Fait";
                } else {
                    // Stock insuffisant
                    $_SESSION["message"] = "stock_insuffisant";
                }
                header("Location:index.php");
        }
    }
}
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>