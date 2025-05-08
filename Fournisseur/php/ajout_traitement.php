<?php
session_start();
include '../../Categorie/Categorie/config/db.php';

try {
    $_SESSION["reponse"] = "";

    // Récupération et sécurisation des données du formulaire
    $nom = htmlspecialchars($_POST["nom"]);
    $prenom = htmlspecialchars($_POST["prenom"]);
    $adresse = htmlspecialchars($_POST["adresse"]);
    $mail = htmlspecialchars($_POST["mail"]);
    $telephone = htmlspecialchars($_POST["telephone"]);

    // Regex pour valider le numéro de téléphone
    $regexTel = "/^(221|00221|\+221)?(77|78|75|70|76)[0-9]{7}$/";
    // Regex pour valider l'email
    $regexEmail = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/";

    // Requête d'insertion
    if (preg_match($regexTel, $telephone) && preg_match($regexEmail, $mail)) {
        $r = "INSERT INTO fournisseur(nomF, prenomF, adresseF, telF, emailF) VALUES(:nom, :prenom, :adresse, :telephone, :mail)";
        // Préparation et exécution de la requête
        $stmt = $connexion->prepare($r);
        $stmt->bindParam(':nom', $nom);
        $stmt->bindParam(':prenom', $prenom);
        $stmt->bindParam(':adresse', $adresse);
        $stmt->bindParam(':telephone', $telephone);
        $stmt->bindParam(':mail', $mail);
        $stmt->execute();

        // Vérification de l'exécution de la requête
        if ($stmt->rowCount() > 0) {
            $_SESSION["reponse"] = "OK";
        } else {
            $_SESSION["reponse"] = "non";
        }
        header("Location: ../ajout.php");
        exit();
    } else {
        $_SESSION["reponse"] = (preg_match($regexTel, $telephone) ? "nonEmail" : "nonTel");
        header("Location: ../ajout.php");
        exit();
    }
} catch (PDOException $e) {
    // En cas d'erreur, affichage du message d'erreur
    echo "Erreur : " . $e->getMessage();
}