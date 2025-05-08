<?php
session_start();
$erruer = "";
if (isset($_POST["connection"])) {
	include '../../../Categorie/Categorie/config/db.php';
	$email = htmlspecialchars($_POST["email"]);
	$pass = $_POST["pass"];
	$requette = "select nom_admin,mail_admin,pass_admin from administrateur";
	$prepare = $connexion->prepare($requette);
	$prepare->execute();
	$reponse = $prepare->fetchAll(PDO::FETCH_ASSOC);
	foreach ($reponse as $seydou) {
		if ($email == $seydou["mail_admin"] && password_verify($pass, $seydou["pass_admin"])) { {
			$_SESSION["nom_admin"] = $seydou["nom_admin"];
				header("Location:../../../accueil.php");
			}
		}
	}
	$erruer = "Information Incorrect";
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="utf-8">
	<title>Formulaire Ajout de Produit</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
		integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
	<style>
		body {
			background-color: #f8f9fa;
			/* Light background */
			font-family: 'Arial', sans-serif;
		}

		.form-container {
			max-width: 400px;
			margin: auto;
			padding: 20px;
			background-color: #fff;
			border-radius: 10px;
			box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
			margin-top: 50px;
		}

		.form-row {
			margin-bottom: 15px;
		}

		.input-text {
			width: 100%;
			padding: 10px;
			border: 1px solid #ced4da;
			border-radius: 5px;
			font-size: 14px;
		}

		.input-text:focus {
			border-color: #80bdff;
			box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
		}

		.label {
			display: block;
			margin-bottom: 5px;
			font-weight: bold;
		}

		.register {
			background-color: #007bff;
			color: #fff;
			border: none;
			border-radius: 5px;
			padding: 10px;
			font-size: 16px;
			cursor: pointer;
			transition: background-color 0.3s;
		}

		.register:hover {
			background-color: #0056b3;
		}
		.btn-success {
			width: 100%;
			margin-top: 10px;
			background-color: green;
		}
	</style>
</head>

<body>
	<div class="form-container">
		<h2 class="text-center">Connexion</h2>
		<form class="form-detail" method="post" action="">
			<span style="color:red;margin-left:30%;"><?php
			echo $erruer;
			?></span>
			<div class="form-row">
				<label class="label" for="full_name">E-Mail</label>
				<input type="text" name="email" id="full_name" class="input-text" required>
			</div>
			<div class="form-row">
				<label class="label" for="prenom">Mots de Pass</label>
				<input type="password" name="pass" id="pass" class="input-text" required><br>
				<input type="checkbox" id="voir_pass" onclick="show()"><b> Afficher le Mots de Pass</b>
			</div>

			<div class="form-row">
				<input type="submit" name="connection" class="register btn btn-success" value="Connexion">
			</div>
			<div class="form-row">
				<a href="index.php" class="btn btn-primary">Inscription</a>
			</div>
		</form>
	</div>
	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
<script>
	function show() {
		let voir_pass = document.getElementById("voir_pass")
		let pass = document.getElementById("pass")
		if (voir_pass.checked && pass.type == "password") {
			pass.type = "text"
		} else {
			pass.type = "password"
		}
	}

</script>
</html>