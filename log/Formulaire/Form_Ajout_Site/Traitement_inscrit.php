<?php
session_start();
try {
	include "../config/db.php";
	$nom = htmlspecialchars($_POST["nom"]);
	$prenom = htmlspecialchars($_POST["prenom"]);
	$email = htmlspecialchars($_POST["email"]);
	$types = htmlspecialchars($_POST["types_gestion"]);
	$pass = password_hash($_POST["pass"],PASSWORD_DEFAULT);
	$telephone = htmlspecialchars($_POST["telephone"]);
	$requette = "select mail_admin,pass_admin from administrateur";
	$prepare = $connexion->prepare($requette);
	$prepare->execute();
	$reponse = $prepare->fetchAll(PDO::FETCH_ASSOC);
	foreach ($reponse as $seydou) {
		if ($email == $seydou["mail_admin"]) {
			$_SESSION["etat"]="existant";
			header("Location:index.php");
			exit();
		}

	}
	$r = ("insert into administrateur (nom_admin,prenom_admin,mail_admin,telephone_admin,type_gestion ,pass_admin)
		values ('$nom','$prenom','$email','$telephone',$types,'$pass')");
	$connexion->exec($r);
	if ($r) {
		header("Location:Connection.php");
	} else {
		echo '<script>alert("Erreur")</script>';
	}
} catch (PDOException $e) {
	// Affichage des erreurs PDO
	echo '<script>alert("Erreur: ' . $e->getMessage() . '");</script>';
}