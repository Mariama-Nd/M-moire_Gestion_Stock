<?php
session_start();
include '../../Categorie/Categorie/config/db.php';
$date = date('Y-m-d');
try {

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $selectedProducts = [];
        if (isset($_POST['products']) && is_array($_POST['products'])) {
            foreach ($_POST['products'] as $productId) {
                $quantityKey = 'quantity_' . $productId;
                if (isset($_POST[$quantityKey]) && !empty($_POST[$quantityKey])) {
                    $selectedProducts[] = [
                        'id' => $productId,
                        'quantity' => $_POST[$quantityKey]
                    ];
                }
            }
        }

        // Mettre à jour les produits sélectionnés dans la base de données
        if (!empty($selectedProducts)) {
            $stmt = $connexion->prepare("UPDATE product SET Stock_actuel = Stock_actuel + :quantity ,Total=Total+:quantity WHERE idP = :id");


            foreach ($selectedProducts as $product) {
                $stmt->bindParam(':quantity', $product['quantity'], PDO::PARAM_INT);
                $stmt->bindParam(':id', $product['id'], PDO::PARAM_INT);
                $stmt->execute();
            }
            
            $add =$connexion->prepare( "insert into historisation(idP,idtypes,datemodif,stock) values(:id,1,'$date',:quantity)");
            foreach ($selectedProducts as $product) {
                $add->bindParam(':id', $product['id'], PDO::PARAM_INT);
                $add->bindParam(':quantity', $product['quantity'], PDO::PARAM_INT);
                $add->execute();
            }
            
            if ($stmt && $add) {
                echo "<script>alert('Quantités des Produits Sélectionnés Mis à Jour')</script>";
                $_SESSION["reponse"]= "OK";
                header('Location:index.php');

                //Afficher l'id du produit et la quantité saisie pour chaque produit
                echo '<ul>';
                foreach ($selectedProducts as $product) {
                    echo '<li>Produit ID: ' . htmlspecialchars($product['id']) . ' - Quantité: ' . htmlspecialchars($product['quantity']) . '</li>';
                }
                echo '</ul>';
                //

            }else{
                echo "<script> alert('Erreur de la mise à jour.')</script>";
            }
           
        }else {
            echo "<script>alert('Aucun produit sélectionné.')</script>";
            header('Location:index.php');
        }
    }
} catch (PDOException $e) {
    echo "Erreur : " . $e->getMessage();
}
?>