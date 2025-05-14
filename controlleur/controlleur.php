<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once '../Categorie/Categorie/config/db.php';
session_start();
class gestionControlleur extends DB
{
    public $db;

    public function __construct() {
        parent::__construct();
        $this->db = $this->connect();
    }

    public function getDb() {
        return $this->db;
    }
}

$gc = new gestionControlleur();

function isProductInOrder($productId, $gc) {
    $sql = "SELECT COUNT(*) FROM bon_livraison WHERE id_bc = :id_bc";
    $stmt = $gc->prepare($sql);
    $stmt->execute(['id_bc' => $productId]);
    return $stmt->fetchColumn() > 0; 
}

function reste($idP, $idBL, $idbc, $connexion)
{
    // Quantité totale dans le bon de livraison
    $r = "SELECT SUM(quantite) AS somme1 FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idbl";
    $requette = $connexion->prepare($r);
    $requette->execute([':idP' => $idP, ':idbl' => $idBL]);
    $resultat = $requette->fetch(PDO::FETCH_ASSOC);
    $qte_bl = $resultat['somme1'] ?? 0;

    // Quantité totale commandée pour le produit dans le bon de commande
    $q = "SELECT SUM(quantite) AS somme2 FROM bon_commande_produit WHERE idP = :idP AND idbc = :idbc";
    $rqt = $connexion->prepare($q);
    $rqt->execute([':idP' => $idP, ':idbc' => $idbc]);
    $rep = $rqt->fetch(PDO::FETCH_ASSOC);
    $qte_bc = $rep['somme2'] ?? 0;

    // Calcul du reste
    $reste = $qte_bc - $qte_bl;
    return $reste < 0 ? 0 : $reste; // Éviter les valeurs négatives
}

function valid_donnees($donnees)
{
    if (is_array($donnees)) {
        return array_map('valid_donnees', $donnees);
    } else {
        $donnees = trim($donnees);
        $donnees = stripslashes($donnees);
        $donnees = htmlspecialchars($donnees);
        return $donnees;
    }
}

$option = (!empty($_POST['option'])) ? $_POST['option'] : (!empty($_GET['option']) ? $_GET['option'] : '');

switch ($option) {


case 1:
    $sql = "SELECT c.id_categorie, c.nom_categorie, sc.idSC, sc.nom 
    FROM categorie c
    JOIN souscategorie sc ON c.id_categorie = sc.id_categorie
    JOIN product p ON sc.idSC = p.id_Sous_categorie
    WHERE p.Stock_actuel > 0
    GROUP BY c.id_categorie, c.nom_categorie, sc.idSC, sc.nom
    HAVING COUNT(p.idP) > 0
    ORDER BY c.nom_categorie, sc.nom";
$stmt = $gc->getDb()->prepare($sql);
$stmt->execute();
$categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

$result = [];
$currentCategory = null;

// Ajouter l'option de sélection par défaut en tout premier
$result[] = ['type' => 'option', 'value' => '', 'text' => 'Sélectionner une sous-catégorie'];

foreach ($categories as $category) {
if ($currentCategory != $category['id_categorie']) {
    if ($currentCategory !== null) {
        $result[] = ['type' => 'optgroup_end'];
    }
    $result[] = ['type' => 'optgroup_start', 'label' => $category['nom_categorie']];
    $currentCategory = $category['id_categorie'];
}
$result[] = ['type' => 'option', 'value' => $category['idSC'], 'text' => $category['nom']];
}

if ($currentCategory !== null) {
$result[] = ['type' => 'optgroup_end'];
}

echo json_encode($result);

    break;

         case 2:
            if (!empty(valid_donnees($_POST["nomC"])) && !empty(valid_donnees($_POST["duree"]))) {
                try {
                    $nomc = valid_donnees($_POST["nomC"]);
                    $duree = valid_donnees($_POST["duree"]);
        
                   
                 
        
                    $r = "INSERT INTO categorie (nom_categorie,duree_amortissement) VALUES (:nomc,:duree_amortissement)";
                    $stmt = $gc->getDb()->prepare($r);
                    $stmt->bindParam(':nomc', $nomc, PDO::PARAM_STR);
                    $stmt->bindParam(':duree_amortissement', $duree, PDO::PARAM_STR);
                    $stmt->execute();
        
                    if ($stmt) {
                        echo 'OK';
                    } else {
                        echo 'Erreur';
                    }
                } catch (\Throwable $th) {
                    echo 'Erreur : ' . $th->getMessage();
                }
              
            }
            else {
                echo "champObligatoire";
                die;
            }
            break;


            case 3:
                try {
                    if (!empty(valid_donnees($_POST["idSC"])) && !empty(valid_donnees($_POST["nomP"])) && !empty(valid_donnees($_POST["seuil"]))) {
                        $nomproduit = htmlspecialchars($_POST["nomP"]);
                        $stock = 0; // Correction ici
                        $total = 0;
                        $idstatut = 2;
                        $idSC = htmlspecialchars($_POST["idSC"]);
                        $seuil = htmlspecialchars($_POST["seuil"]);
            
                        $r = "INSERT INTO product (nomproduit, Stock_actuel, Seuil_limite, Total, id_Sous_categorie, id_statut) 
                              VALUES (:nomproduit, :stock, :seuil, :total, :idSC, :idstatut)";
                        $stmt = $gc->getDb()->prepare($r);
                        $stmt->bindValue(':nomproduit', $nomproduit);
                        $stmt->bindValue(':stock', $stock); // mis à 0
                        $stmt->bindValue(':seuil', $seuil);
                        $stmt->bindValue(':total', $total);
                        $stmt->bindValue(':idSC', $idSC);
                        $stmt->bindValue(':idstatut', $idstatut);
            
                        if ($stmt->execute()) {
                            echo "OK";
                        } else {
                            echo "non";
                        }
                    } else {
                        echo "champObligatoire";
                        die;
                    }
                } catch (PDOException $e) {
                    echo 'Erreur : ' . $e->getMessage();
                }
                break;
            
 
            case 4:
                if (!empty(valid_donnees($_POST["idSC"])) && !empty(valid_donnees($_POST["productName"])) && !empty(valid_donnees($_POST["seuil"]))) {
                    try {
                        $idsC = valid_donnees($_POST['idSC']);
                        $productNames = $_POST['productName'];
                        $seuil = $_POST['seuil']; 
            
                        $sql = "INSERT INTO product (nomproduit, Stock_actuel, Seuil_limite, Total, id_Sous_categorie, retrait, id_statut) 
                                VALUES (:nomproduit, :stock, :seuil, :total, :idSC, :retrait, :idstatut)";
                        $stmt = $gc->getDb()->prepare($sql);
            
                        foreach ($productNames as $index => $productName) {
                            $stmt->execute([
                                ':nomproduit' => $productName,
                                ':stock' => 0, // Correction ici
                                ':seuil' => $seuil[$index],
                                ':total' => 0,
                                ':idSC' => $idsC,
                                ':retrait' => 0,
                                ':idstatut' => 2
                            ]);
                        }
                        echo 'OK';
                    } catch (PDOException $e) {
                        echo 'Erreur : ' . $e->getMessage();
                    }
                } else {
                    echo "champObligatoire";
                    die;
                }
                break;
            
            case 5:
                if (!empty(valid_donnees($_POST["nom"]) )&& !empty(valid_donnees($_POST["categorie"]) && !empty($_POST["duree"])) )
                {
                    try {
                        
                        $nom = valid_donnees($_POST["nom"]);
                        $duree = valid_donnees($_POST["duree"]);
                        $categorie = valid_donnees($_POST["categorie"]);
                        $r = "INSERT INTO souscategorie (nom, id_categorie,duree_amortissement) VALUES (:nom, :categorie,:duree_amortissement)";
                        $stmt = $gc->getDb()->prepare($r);
                        $stmt->bindParam(':nom', $nom, PDO::PARAM_STR);
                        $stmt->bindParam(':duree_amortissement', $duree, PDO::PARAM_STR);
                        $stmt->bindParam(':categorie', $categorie, PDO::PARAM_INT);
                        $stmt->execute();
        
                        if ($stmt) {
                           echo"OK";
                          
                        } else {
                            echo 'Erreur';
                        }
                    } catch (\Throwable $th) {
                        echo 'Erreur : ' . $th->getMessage();
                    }
                }
                else{
                    echo"champObligatoire";
                    die;
                }
                break;
                case 6:
                    try {
                        $stmt = $gc->getDb()->prepare("SELECT bc.id_BC, bc.nomBC, bc.date, sc.nom_status_cmd, bc.Etat_commander, bc.idBC_gen FROM bon_commande bc JOIN status_commande sc ON sc.id_status_cmd = bc.Etat_commander WHERE bc.Etat_commander != 4 ORDER BY bc.date");
                        $stmt->execute();
                        $listes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                        $data = array();
                        foreach ($listes as $tmp) {
                            $data[] = array(
                                'id_BC' => $tmp["id_BC"],
                                'nomBC' => $tmp["nomBC"],
                                'date' => $tmp["date"],
                                'nom_status_cmd' => $tmp["nom_status_cmd"],
                                'Etat_commander' => $tmp["Etat_commander"],
                                'idBC_gen' => $tmp["idBC_gen"]
                            );
                        }
                        echo json_encode($data);
                        die;
                    } catch (PDOException $e) {
                        echo "erreur";
                        die;
                    }
                    break;
                
                case 7:
                    try {
                        $idbon_cmd = valid_donnees($_POST['idbon_cmd']);
                        $stmt = $gc->getDb()->prepare("SELECT * FROM bon_commande_produit WHERE idbc = :idbon_cmd");
                        $stmt->bindParam(':idbon_cmd', $idbon_cmd, PDO::PARAM_INT);
                        $stmt->execute();
                        $listes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                        echo json_encode($listes);
                        die;
                    } catch (PDOException $e) {
                        echo "erreur";
                        die;
                    }
                    break;
                    case 8:
                        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                            try {
                                $bonCmd = valid_donnees($_POST['idboncmd']);
                
                                if (isProductInOrder($bonCmd, $gc->getDb())) {
                                
                                    echo json_encode(true);
                                } else {
                                 
                                    $etats = 4;
                                    $r = "UPDATE bon_commande SET Etat_commander = :Etat_commander WHERE id_BC = :id_BC";
                                    $requette = $gc->getDb()->prepare($r);
                                    $requette->bindParam(':Etat_commander', $etats, PDO::PARAM_INT);
                                    $requette->bindParam(':id_BC', $bonCmd, PDO::PARAM_INT);
                                    $requette->execute();
                                    
                    if ($requette) {
                        echo json_encode(false);
                    } else {
                        echo json_encode("Erreur lors de la suppression.");
                    }
                }
            } catch (\Throwable $th) {
                echo 'Erreur : ' . $th->getMessage();
            }
        }
        break;
        case 9:
            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                try {
                    $idbon = valid_donnees($_POST['idbon']);
                    $r = "SELECT * FROM bon_commande_produit bcp 
                          JOIN product p ON p.idP = bcp.idP
                          WHERE idbc = :id";
                    $requette = $gc->getDb()->prepare($r);
                    $requette->bindParam(':id', $idbon, PDO::PARAM_INT);
                    $requette->execute();
                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
    
                    echo json_encode($reponse);
                } catch (\Throwable $th) {
                    echo 'Erreur : ' . $th->getMessage();
                }
            }
            break;
            case 10:
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    try {
                        $r = "SELECT * FROM product ORDER BY nomproduit";
                        $requette = $gc->getDb()->prepare($r);
                        $requette->execute();
                        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
        
                        echo json_encode($reponse);
                    } catch (\Throwable $th) {
                        echo 'Erreur : ' . $th->getMessage();
                    }
                }
                break;
                case 11:
                    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                        try {
                            $idbon = valid_donnees($_POST['idbon']);
                            $r = "SELECT * FROM bon_commande_produit bcp 
                                  JOIN product p ON p.idP = bcp.idP
                                  JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
                                  WHERE idbc = :id";
                            $requette = $gc->getDb()->prepare($r);
                            $requette->bindParam(':id', $idbon, PDO::PARAM_INT);
                            $requette->execute();
                            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
            
                            $r1 = "SELECT * FROM product";
                            $requette2 = $gc->getDb()->prepare($r1);
                            $requette2->execute();
                            $reponse2 = $requette2->fetchAll(PDO::FETCH_ASSOC);
            
                            $sql = "SELECT c.id_categorie, c.nom_categorie, sc.idSC, sc.nom 
                                    FROM categorie c
                                    JOIN souscategorie sc ON c.id_categorie = sc.id_categorie
                                    ORDER BY c.nom_categorie, sc.nom";
                             $stmt = $gc->getDb()->prepare($sql);
                             $stmt->execute();
                             $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
             
                             echo json_encode(['produits' => $reponse, 'allProducts' => $reponse2, 'categories' => $categories]);
                         } catch (\Throwable $th) {
                             echo 'Erreur : ' . $th->getMessage();
                         }
                     }
                     break;
                     case 12:
                        if (!empty($_POST['idP']) && !empty($_POST['id']) && !empty($_POST['quantite']) && !empty($_POST['unite']) && !empty($_POST['idbc'])) {
                            try {
                                $idP = valid_donnees($_POST['idP']);
                                $idP_ancien = valid_donnees($_POST['id']);
                                $quantite = valid_donnees($_POST['quantite']);
                                $unite = valid_donnees($_POST['unite']);
                                $bonCmd = valid_donnees($_POST['idbc']);
                                date_default_timezone_set('Africa/Dakar');
                                $dateT = new DateTime();
                                $date = $dateT->format("Y-m-d H:i:s");
                
                                $r = "UPDATE bon_commande_produit SET idP = :idP, dateadd = :dateadd, quantite = :quantite, unite = :unite, reste_a_livrer = :reste_a_livrer WHERE idbc = :idBon AND idP = :id_ancien";
                                $requette = $gc->getDb()->prepare($r);
                                $requette->bindParam(':idBon', $bonCmd, PDO::PARAM_INT);
                                $requette->bindParam(':idP', $idP, PDO::PARAM_INT);
                                $requette->bindParam(':id_ancien', $idP_ancien, PDO::PARAM_INT);
                                $requette->bindParam(':dateadd', $date, PDO::PARAM_STR);
                                $requette->bindParam(':quantite', $quantite, PDO::PARAM_INT);
                                $requette->bindParam(':unite', $unite, PDO::PARAM_STR);
                                $requette->bindParam(':reste_a_livrer', $quantite, PDO::PARAM_INT);
                                $requette->execute();
                
                                if ($requette) {
                                    echo json_encode(true);
                                } 
                                else {
                                    echo json_encode(false);
                                }
                            } catch (\Throwable $th) {
                                echo 'Erreur : ' . $th->getMessage();
                            }
                        }
                        else{
                            echo'champs manquants';
                        }
                        
                        break;
                        
                    case 13:
                            if ($_SERVER['REQUEST_METHOD'] === 'GET') {
                                try {
                                    $id_sous_categorie = valid_donnees($_GET['id_sous_categorie']);
                        
                                    $r = "SELECT p.idP, p.nomproduit 
                                          FROM product p
                                          JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
                                          WHERE p.id_Sous_categorie = :id_sous_categorie
                                          ORDER BY p.nomproduit";
                        
                                    $requette = $gc->getDb()->prepare($r);
                                    $requette->bindParam(':id_sous_categorie', $id_sous_categorie, PDO::PARAM_INT);
                                    $requette->execute();
                                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                        
                                    echo json_encode($reponse);
                                } catch (\Throwable $th) {
                                    echo json_encode(['error' => 'Erreur : ' . $th->getMessage()]);
                                }
                            } else {
                                echo json_encode(['error' => 'Option non valide']);
                            }
                            break;
                           
                            case 14:
                                if (!empty($_POST['nomBC']) && !empty($_POST['modalitePaiement']) && !empty($_POST['modeReglement']) && !empty($_POST['fournisseurs'])) {
                                    try {
                                        date_default_timezone_set('Africa/Dakar');
                                        $dateT = new DateTime();
                                        $date = $dateT->format("Y-m-d H:i:s"); 
                                        
                                        $nomBC = htmlspecialchars($_POST['nomBC']);
                                        $modalitePaiement = htmlspecialchars($_POST['modalitePaiement']);
                                        $modeReglement = htmlspecialchars($_POST['modeReglement']);
                                        
                                        $fournisseurs = json_decode($_POST['fournisseurs'], true);
                                        if (!is_array($fournisseurs) || count($fournisseurs) === 0) {
                                            echo json_encode(['error' => 'Veuillez sélectionner au moins un fournisseur']);
                                            die;
                                        }
                            
                                        if (isset($_SESSION["generation"])) {
                                            $_SESSION["generation"] += 1;
                                        } else {
                                            $_SESSION["generation"] = 1;
                                        }
                                        $auto_gen = "BC" . $_SESSION["generation"] . "_" . str_replace(":", "_", $date);
                            
                                        $r = "INSERT INTO bon_commande(date, idBC_gen, nomBC, modalitePaiement,modeReglement) VALUES (?, ?, ?, ?,?)";
                                        $stmt = $gc->getDb()->prepare($r);
                                        $stmt->execute([$date, $auto_gen, $nomBC, $modalitePaiement,$modeReglement]);
                            
                                        $idBC = $gc->getDb()->lastInsertId();
                            
                                        $r2 = "INSERT INTO commande_fournisseurs(idbc, idF) VALUES (?, ?)";
                                        $stmt2 = $gc->getDb()->prepare($r2);
                                        foreach ($fournisseurs as $fournisseur) {
                                            $stmt2->execute([$idBC, intval($fournisseur)]);
                                        }
                            
                                        echo json_encode(['success' => true]);
                                    } catch (Throwable $th) {
                                        echo json_encode(['error' => $th->getMessage()]);
                                    }
                                } else {
                                    echo json_encode(['error' => 'Champ obligatoire']);
                                }
                                break;
                            
     
    case 15:
        try {
            if (isset($_GET["auto_gen"])) {
                $auto_gen = $_GET["auto_gen"];
                $name = $_GET["nomBC"]; 
              
                $r = "SELECT * FROM bon_commande WHERE id_BC = (SELECT id_BC FROM bon_commande WHERE idBC_gen = :auto_gen)";
                $requette = $gc->getDb()->prepare($r);
                $requette->bindParam(':auto_gen', $auto_gen);
                $requette->execute();
                $reponse = $requette->fetch(PDO::FETCH_ASSOC);
    
                if ($reponse) {
                    $nomBC = $reponse["nomBC"];
                    $_SESSION["date"] = $reponse["date"];
                    $_SESSION["idBC"] = $reponse["id_BC"];
                    $me = $_SESSION['idBC'];
                    echo json_encode($reponse);
                } else {
                    echo json_encode(["error" => "No record found."]);
                }
            } else {
                echo json_encode(["error" => "auto_gen not set."]);
            }
        } catch (\Throwable $th) {
            echo json_encode(["error" => $th->getMessage()]);
        }
        break;

            case 16:
             
                try {
                   
                    $bonCmd = $_GET['idbon'];
                    $etats = 2;
        
                    $r = "SELECT Etat_commander FROM bon_commande WHERE id_BC = :id_BC";
                    $requette = $gc->getDb()->prepare($r);
                    $requette->bindParam(':id_BC', $bonCmd);
                    $requette->execute();
                    $result = $requette->fetch(PDO::FETCH_ASSOC);
        
                    if ($result) {
                        if ($result['Etat_commander'] == 2) {
                            $_SESSION["cmd"] = "Deja_Fait";
                            echo json_encode(["status" => "Deja_Fait"]);
                        }  
                        else {
                            date_default_timezone_set('Africa/Dakar');
                            $dateT = new DateTime();
                            $date_validation = $dateT->format("Y-m-d H:i:s");
                            
                            $updateQuery = "UPDATE bon_commande SET Etat_commander = :Etat_commander WHERE id_BC = :id_BC";
                            $updateRequette = $gc->getDb()->prepare($updateQuery);
                            $updateRequette->bindParam(':Etat_commander', $etats);
                            $updateRequette->bindParam(':id_BC', $bonCmd);
                            $updateRequette->execute();
        
                            $updateQuery = "UPDATE bon_commande SET Date_validation = :date_valide WHERE id_BC = :id_BC";
                            $updateRequette = $gc->getDb()->prepare($updateQuery);
                            $updateRequette->bindParam(':date_valide', $date_validation);
                            $updateRequette->bindParam(':id_BC', $bonCmd);
                            $updateRequette->execute();
        
                            if ($updateRequette) {
                                $_SESSION["cmd"] = "Valider";
                                echo json_encode(["status" => "Valider"]);
                            } else {
                                $_SESSION["cmd"] = "Erreur lors de la validation de la commande.";
                                echo json_encode(["status" => "Erreur lors de la validation de la commande."]);
                            }
                        }
                    } else {
                        $_SESSION["cmd"] = "Commande non trouvée.";
                        echo json_encode(["status" => "Commande non trouvée."]);
                    }
                } catch (\Throwable $th) {
                    echo json_encode(["error" => $th->getMessage()]);
                }
                break;
                case 17:
                try {
                  
                    $id_sous_categorie = $_GET['id_sous_categorie'];
        
                    $r = "SELECT p.idP, p.nomproduit 
                          FROM product p
                          JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
                          WHERE p.id_Sous_categorie = :id_sous_categorie
                          ORDER BY p.nomproduit";
        
                    $requette = $gc->getDb()->prepare($r);
                    $requette->bindParam(':id_sous_categorie', $id_sous_categorie);
                    $requette->execute();
                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
        
                    echo json_encode($reponse);
                } catch (\Throwable $th) {
                    echo json_encode(["error" => $th->getMessage()]);
                }
                break;
                case 18:
                    try {
                       
                        $idP = $_POST['idP'];
                        $quantite = $_POST['quantite'];
                        $unite = $_POST['unite'];
                        $bonCmd = $_POST['idbc'];
                        date_default_timezone_set('Africa/Dakar');
                        $dateT = new DateTime();
                        $date = $dateT->format("Y-m-d H:i:s");
                        
                        $r = "INSERT INTO bon_commande_produit (idbc, idP, dateadd, quantite, unite,reste_a_livrer) VALUES (:idBon, :idP, :dateadd, :quantite, :unite,:reste_a_livrer)";
                        $requette = $gc->getDb()->prepare($r);
                        $requette->bindParam(':idBon', $bonCmd);
                        $requette->bindParam(':idP', $idP);
                        $requette->bindParam(':dateadd', $date);
                        $requette->bindParam(':quantite', $quantite);
                        $requette->bindParam(':unite', $unite);
                        $requette->bindParam(':reste_a_livrer', $quantite);
                        $requette->execute();
                        
                        $updateSql = "UPDATE bon_commande SET Etat_commander = 5 WHERE id_BC = :idBC";
                        $updateStmt =  $gc->getDb()->prepare($updateSql);
                        $updateStmt->bindParam(':idBC', $bonCmd);
                        $updateStmt->execute();
                        
                        
                        if ($requette) {
                            echo json_encode(true);
                        } else {
                            echo json_encode(false);
                        }
                    } catch (\Throwable $th) {
                        echo json_encode(['error' => $th->getMessage()]);
                    }
                    break;
                                                                                                
                    
                    case 19:
                        
                        try {
                            
                            $connexion = $gc->getDb();
                    
                            if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                                // Log the received data
                                error_log("Received POST data: " . print_r($_POST, true));
                                
                                // Log the session data
                                error_log("Session data: " . print_r($_SESSION, true));
                                
                                if (!isset($_SESSION["idBC"])) {
                                    throw new Exception("Session variable 'idBC' is not set.");
                                }
                    
                                $idP = $_POST['idP'];
                                $quantite = $_POST['quantite'];
                                $unite = $_POST['unite'];
                                $idBC = $_SESSION['idBC'];
                                date_default_timezone_set('Africa/Dakar');
                                $dateT = new DateTime();
                                $date = $dateT->format("Y-m-d H:i:s");
                    
                                // Validate input data
                                if (empty($idP) || empty($quantite)) {
                                    throw new Exception("Invalid input data");
                                }
                    
                                // Update the state of the order
                                $updateSql = "UPDATE bon_commande SET Etat_commander = 5 WHERE id_BC = :idBC";
                                $updateStmt = $connexion->prepare($updateSql);
                                $updateStmt->bindParam(':idBC', $idBC);
                                $updateStmt->execute();
                    
                                // Insert data into bon_commande_produit table
                                $sql = "INSERT INTO bon_commande_produit (idbc, idP, dateadd, quantite, unite,reste_a_livrer) VALUES (:idBC, :idP, :date, :quantite,:unite, :reste_a_livrer)";
                                $stmt = $connexion->prepare($sql);
                    
                                foreach ($idP as $i => $id) {
                                    // Check if the product already exists in the table
                                    $checkSql = "SELECT COUNT(*) FROM bon_commande_produit WHERE idbc = :idBC AND idP = :idP";
                                    $checkStmt = $connexion->prepare($checkSql);
                                    $checkStmt->execute([':idBC' => $idBC, ':idP' => $id]);
                                    $exists = $checkStmt->fetchColumn();
                    
                                    if ($exists > 0) {
                                        // Product already exists, skip insertion
                                        continue;
                                    }
                    
                                    // Insert the product if it does not exist
                                    $stmt->execute([
                                        ':idBC' => $idBC,
                                        ':idP' => $id,
                                        ':date' => $date,
                                        ':quantite' => $quantite[$i],
                                        ':unite' => $unite[$i],
                                        ':reste_a_livrer' => $quantite[$i]
                                    ]);
                                }
                    
                                echo json_encode(["status" => "success", "message" => "Fait"]);
                                exit; // Ensure the script stops executing after sending the response
                            }
                        } catch (PDOException $e) {
                            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                        } 
                        break;
                        case 20: // Nouveau case pour récupérer les livraisons
                                try {
                                $connexion = $gc->getDb();
                                $sql = "SELECT distinct bl.*, sc.nom_status_cmd, bc.nomBC FROM bon_livraison bl
                                        join status_commande sc on sc.id_status_cmd = bl.Etat_Livraison
                                        join bon_commande bc on bc.id_BC = bl.id_bc 
                                        where bl.Etat_Livraison <> 4"; // Exemple de requête pour récupérer les livraisons
                                $stmt = $connexion->prepare($sql);
                                $stmt->execute();
                                $livraisons = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                                foreach ($livraisons as &$ventes) {
                                    $idBL = $ventes["idBL"];
                                    $r = "SELECT * FROM bon_livraison_produit WHERE idBL = :idBL";
                                    $requette = $connexion->prepare($r);
                                    $requette->bindParam(':idBL', $idBL, PDO::PARAM_INT);
                                    $requette->execute();
                                    $ventes["nbr_produits"] = $requette->rowCount();
                                }
                    
                                echo json_encode($livraisons);
                            } catch (PDOException $e) {
                                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                            }
                            break;
                    
                            case 21: 
                                try {
                                    $connexion = $gc->getDb();
                                    $sql = "SELECT DISTINCT bc.id_BC, bc.nomBC FROM bon_commande bc
                                            JOIN bon_commande_produit bcp ON bc.id_BC = bcp.idbc
                                            WHERE bc.Etat_commander = 2 ORDER BY nomBC";
                                    $stmt = $connexion->prepare($sql);
                                    $stmt->execute();
                                    $bonsCommande = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                    echo json_encode($bonsCommande);
                                } catch (PDOException $e) {
                                    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                                }
                                break;

                                case 22:
                                    if (!empty($_POST["bc"]) && !empty($_POST["bordereau"]) && !empty($_POST["nomBL"])) {
                                        $idBC = $_POST["bc"];
                                        $numBL = htmlspecialchars($_POST["bordereau"]);
                                        $nomBL = htmlspecialchars($_POST["nomBL"]);
                                        date_default_timezone_set('Africa/Dakar');
                                        $dateT = new DateTime();
                                        $date = $dateT->format("Y-m-d H:i:s");
                                
                                        try {
                                            $r = "INSERT INTO bon_livraison(id_bc, numBL, date, nomBL) VALUES (:id_bc, :numBL, :date, :nomBL)";
                                            $stmt = $gc->getDb()->prepare($r);
                                            $stmt->bindParam(':id_bc', $idBC);
                                            $stmt->bindParam(':numBL', $numBL);
                                            $stmt->bindParam(':date', $date);
                                            $stmt->bindParam(':nomBL', $nomBL);
                                
                                            if ($stmt->execute()) {
                                                echo json_encode(["status" => "success", "message" => "Bon de livraison créé avec succès."]);
                                            } else {
                                                echo json_encode(["status" => "error", "message" => "Échec de la création du bon de livraison."]);
                                            }
                                        } catch (PDOException $e) {
                                            echo json_encode(["status" => "error", "message" => "Erreur : " . $e->getMessage()]);
                                        }
                                    } else {
                                        echo json_encode(["status" => "error", "message" => "Tous les champs sont obligatoires."]);
                                    }
                                    break;
                                
                                    case 23:
                                        // error_log("Données reçues : " . json_encode($_POST));
                                        if (!isset($_POST['idBL'], $_POST['idP'], $_POST['quantity'], $_POST['idBC'], $_POST['prix']  ,$_POST['unite'])) {
                                            echo json_encode(['success' => false, 'message' => 'Les données nécessaires ne sont pas fournies.']);
                                            exit;
                                        }
                                
                                        date_default_timezone_set('Africa/Dakar');
                                        $dateT = new DateTime();
                                        $date = $dateT->format("Y-m-d H:i:s");
                                        $idBL = $_POST['idBL'];
                                        $idBC = $_POST['idBC'];
                                        $idP = $_POST['idP'];
                                        $prix = $_POST['prix'];
                                        $unite = $_POST['unite'];
                                        $quantity = $_POST['quantity'];
                                
                                        // Validation de la quantité
                                        if (!is_numeric($quantity) || $quantity <= 0) {
                                            echo json_encode(['success' => false, 'message' => 'Quantité invalide.']);
                                            exit;
                                        }
                                            // Connexion à la base de données
                                        try {
                                            // Récupérer la quantité totale livrée pour un produit
                                            $r = "SELECT SUM(quantite) as somme1 FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idBL";
                                            $requette = $gc->getDb()->prepare($r);
                                            $requette->execute([':idP' => $idP, ':idBL' => $idBL]);
                                            $resultat = $requette->fetch(PDO::FETCH_ASSOC);
                                            $qte_bl = $resultat['somme1'] ?? 0;

                                            // Récupérer la quantité du produit dans le bon de commande
                                            $q = "SELECT quantite FROM bon_commande_produit WHERE idP = :idP AND idBC = :idBC";
                                            $rqt = $gc->getDb()->prepare($q);
                                            $rqt->execute([':idP' => $idP, ':idBC' => $idBC]);
                                            $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                            $qte_bc = $rep['quantite'] ?? 0;

                                            $reste = $qte_bc - $qte_bl;
                                            if ($quantity > $reste) {
                                                echo json_encode(['success' => false, 'message' => 'La quantité saisie dépasse la quantité restante à livrer ('.$reste.')']);
                                                exit;
                                            }

                                            // Vérification de l'existence de l'enregistrement
                                            $q = "SELECT * FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idBL";
                                            $rqt = $gc->getDb()->prepare($q);
                                            $rqt->execute([':idP' => $idP, ':idBL' => $idBL]);
                                            $rep = $rqt->fetchAll(PDO::FETCH_ASSOC);
                                            // Insertion ou mise à jour de l'enregistrement
                                            if (count($rep) <= 0) {
                                                $stmt = $gc->getDb()->prepare("INSERT INTO bon_livraison_produit (idBL, idP, quantite,unite, prix_unitaire, dateadd) VALUES (:idBL, :idP, :quantity, :unite, :prix, :dateadd)");
                                                $stmt->bindParam(':idBL', $idBL);
                                                $stmt->bindParam(':idP', $idP);
                                                $stmt->bindParam(':prix', $prix);
                                                $stmt->bindParam(':unite', $unite);
                                                $stmt->bindParam(':quantity', $quantity);
                                                $stmt->bindParam(':dateadd', $date);
                                                $stmt->execute();
                                            } else {
                                                $stmt = $gc->getDb()->prepare("UPDATE bon_livraison_produit SET quantite = quantite + :quantity, prix_unitaire = :prix ,unite= :unite WHERE idP = :idP AND idBL = :idBL");
                                                $stmt->bindParam(':quantity', $quantity);
                                                $stmt->bindParam(':prix', $prix);
                                                $stmt->bindParam(':unite', $unite);
                                                $stmt->bindParam(':idP', $idP);
                                                $stmt->bindParam(':idBL', $idBL);
                                                $stmt->execute();
                                            }
                                            $stmt =$gc->getDb()->prepare("UPDATE bon_livraison SET Etat_Livraison = 5 WHERE idBL = :idBL");
                                            $stmt->bindParam(':idBL', $idBL);
                                            $stmt->execute();

                                            echo json_encode(['success' => true, 'message' => 'Produit enregistré avec succès.']);

                                            } catch (PDOException $e) {
                                            echo json_encode(['success' => false, 'message' => 'Erreur serveur : ' . $e->getMessage()]);
                                            }
                                            break;
                                                                     
                                                                                
                                        case 24: 
                                            if (isset($_GET["idBC"]) && isset($_GET["idBL"])) {
                                                

                                                $idBC = $_GET["idBC"];
                                                $idBL = $_GET["idBL"];

                                                try {
                                                    $stmt = $gc->getDb()->prepare('
                                                        SELECT DISTINCT p.idP, p.nomproduit, bcp.idbc, bcp.quantite,bcp.unite
                                                        FROM bon_commande_produit bcp
                                                        JOIN product p ON bcp.idP = p.idP
                                                        JOIN bon_livraison bl ON bl.id_bc = bcp.idbc
                                                        WHERE bcp.idbc = :idBC and bl.idBL = :idBL
                                                    ');
                                                    $stmt->execute(['idBC' => $idBC, 'idBL' => $idBL]);
                                                    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                                                                                                                
                                                        echo json_encode(["status" => "success", "products" => $products]);
                                                    } catch (PDOException $e) {
                                                        echo json_encode(["status" => "error", "message" => "Erreur : " . $e->getMessage()]);
                                                    }
                                                } else {
                                                    echo json_encode(["status" => "error", "message" => "Données manquantes."]);
                                                }
                                                break;


        case 25: 
            if (!isset($_POST['idBL'], $_POST['idBC'], $_POST['idP'], $_POST['quantity'], $_POST['prix'], $_POST['unite'])) {
                echo json_encode(['success' => false, 'message' => 'Les données nécessaires ne sont pas fournies.']);
                exit;
            }
        
            $idBL = $_POST['idBL'];
            $idBC = $_POST['idBC'];
            $idP = $_POST['idP'];
            $quantityInput = floatval($_POST['quantity']);
            $prix = $_POST['prix'];
            $unite = $_POST['unite'];
            $mode = $_POST['mode'] ?? 'cumulatif'; // 'remplacement' ou défaut 'cumulatif'
        
            try {
                // Récupérer date et quantité déjà livrée
                $sql_date = "SELECT dateadd, quantite FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idBL";
                $stmt = $gc->getDb()->prepare($sql_date);
                $stmt->execute([':idP' => $idP, ':idBL' => $idBL]);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
                if (!$row) {
                    echo json_encode(['success' => false, 'message' => 'Produit non trouvé dans le bon de livraison.']);
                    exit;
                }
        
                $date = $row['dateadd'];
                $quantite_deja_livree = floatval($row['quantite']);
        
                // Récupérer la quantité commandée
                $sql_bc = "SELECT quantite FROM bon_commande_produit WHERE idP = :idP AND idbc = :idBC";
                $stmt = $gc->getDb()->prepare($sql_bc);
                $stmt->execute([':idP' => $idP, ':idBC' => $idBC]);
                $row_bc = $stmt->fetch(PDO::FETCH_ASSOC);
        
                if (!$row_bc) {
                    echo json_encode(['success' => false, 'message' => 'Produit non trouvé dans le bon de commande.']);
                    exit;
                }
        
                $quantite_commandee = floatval($row_bc['quantite']);
        
                // Appliquer la bonne logique
                if ($mode === 'remplacement') {
                    // Remplacement total
                    if ($quantityInput > $quantite_commandee) {
                        echo json_encode([
                            'success' => false,
                            'message' => "Quantité invalide. Elle dépasse la quantité commandée ($quantite_commandee)."
                        ]);
                        exit;
                    }
        
                    $quantite_a_enregistrer = $quantityInput;
        
                } else {
                    // Ajout cumulatif
                    $quantite_totale = $quantite_deja_livree + $quantityInput;
        
                    if ($quantite_totale > $quantite_commandee) {
                        $reste = $quantite_commandee - $quantite_deja_livree;
                        echo json_encode([
                            'success' => false,
                            'message' => "Quantité invalide. Vous ne pouvez ajouter que $reste unité(s) au maximum."
                        ]);
                        exit;
                    }
        
                    $quantite_a_enregistrer = $quantite_totale;
                }
        
                // Mise à jour
                $sql_update = "UPDATE bon_livraison_produit 
                               SET quantite = :quantite, unite = :unite, prix_unitaire = :prix 
                               WHERE idBL = :idBL AND idP = :idP AND dateadd = :dateadd";
                $stmt = $gc->getDb()->prepare($sql_update);
                $stmt->execute([
                    ':quantite' => $quantite_a_enregistrer,
                    ':unite' => $unite,
                    ':prix' => $prix,
                    ':idBL' => $idBL,
                    ':idP' => $idP,
                    ':dateadd' => $date
                ]);
        
                echo json_encode(['success' => true]);
        
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Erreur PDO : ' . $e->getMessage()]);
            }
            break;                  
        
        
            case 26: // Gérer le retrait d’un produit du bon de livraison (sans toucher au stock produit)
                $idBL = $_GET['idBL'];
                $idP = $_GET['idP'];
            
                try {
                    // Vérifier si le produit est bien dans le bon de livraison
                    $r = "SELECT 1 FROM bon_livraison_produit WHERE idBL = :idBL AND idP = :idP";
                    $requette = $gc->getDb()->prepare($r);
                    $requette->execute([':idBL' => $idBL, ':idP' => $idP]);
                    $produitExiste = $requette->fetchColumn();
            
                    if ($produitExiste) {
                        // Ne touche que à la livraison : on annule la quantité livrée
                        $sql = "UPDATE bon_livraison_produit SET quantite = 0 WHERE idBL = :idBL AND idP = :idP";
                        $stmt = $gc->getDb()->prepare($sql);
                        $stmt->execute([
                            ':idBL' => $idBL,
                            ':idP' => $idP                                    
                        ]);
            
                        // ❌ Ne pas modifier le stock ici !
                        echo json_encode(['success' => true]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Le produit n\'est pas présent dans le bon de livraison.']);
                    }
            
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                }
                break;
               


            case 27: 
                try {
                  
                    $input = json_decode(file_get_contents('php://input'), true);

                    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['enregistrerTout'])) {
                        $idP = $input['products'];
                        $Prix = $input['prix'];
                        $quantite = $input['quantity'];
                        $idBL = $input['idBL'] ?? $_SESSION["idBL"];
                        $idBC = $input["idBC"];
                        $nomBL = $input["nomBL"] ?? 'Nom par défaut';
                        date_default_timezone_set('Africa/Dakar');
                        $dateT = new DateTime();
                        $date = $dateT->format("Y-m-d H:i:s");
        
                        if (empty($idBL)) {
                            throw new Exception("ID du bon de livraison manquant.");
                        }   
                        if (empty($idP) || !is_array($idP) || empty($quantite) || !is_array($quantite) || empty($Prix) || !is_array($Prix)) {
                            throw new Exception("Données d'entrée invalides");
                        }
        
                        $produitsIncoherents = [];
        
                        foreach ($idP as $i => $id) {
                            // Récupérer le nom du produit
                            $queryNom = "SELECT nomproduit FROM product WHERE idP = :idP";
                            $stmtNom =$gc->getDb()->prepare($queryNom);
                            $stmtNom->execute([':idP' => $id]);
                            $resultNom = $stmtNom->fetch(PDO::FETCH_ASSOC);
                            $nomProduit = $resultNom['nomproduit'] ?? 'Nom inconnu';
        
                            // Vérifier si le produit est déjà présent dans bon_livraison_produit
                            $checkQuery = "SELECT quantite FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idBL";
                            $checkStmt = $gc->getDb()->prepare($checkQuery);
                            $checkStmt->execute([':idP' => $id, ':idBL' => $idBL]);
                            $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
                            $qte_bl = $checkResult['quantite'] ?? 0;
                                     // Récupérer la quantité du produit dans le bon de commande
                    $q = "SELECT quantite FROM bon_commande_produit WHERE idP = :idP AND idBC = :idBC";
                    $rqt = $gc->getDb()->prepare($q);
                    $rqt->execute([':idP' => $id, ':idBC' => $idBC]);
                    $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                    $qte_bc = $rep['quantite'] ?? 0;

                    $reste = $qte_bc - $qte_bl;

                    if ($quantite[$i] > $reste && $qte_bl == 0) {
                        $produitsIncoherents[] = [
                            'nomProduit' => $nomProduit,
                            'quantiteSaisie' => $quantite[$i],
                            'reste' => $reste
                        ];
                    } else {
                        // Vérifier si le produit n'est pas déjà présent dans bon_livraison_produit
                        if ($qte_bl > 0) {
                            // Produit déjà présent, passer au suivant
                            continue;
                        } 
                        else {
                            // Insérer le produit dans bon_livraison_produit
                            $sql = "INSERT INTO bon_livraison_produit (idBL, idP, quantite, prix_unitaire, dateadd) VALUES (:idBL, :idP, :quantite, :prix_unitaire, :dateadd)";
                            $stmt = $gc->getDb()->prepare($sql);
                            $stmt->execute([
                                ':idBL' => $idBL,
                                ':idP' => $id,
                                ':quantite' => $quantite[$i],
                                ':prix_unitaire' => $Prix[$i],
                                ':dateadd' => $date
                            ]);
                        }
                    }
                }

                if (!empty($produitsIncoherents)) {
                    echo json_encode(['success' => false, 'message' => 'Incohérence dans les quantités.', 'produitsIncoherents' => $produitsIncoherents]);
                    exit;
                }
                
                $r = "UPDATE bon_livraison SET Etat_Livraison = 5 WHERE idBL = :idBL";
                $stmt =$gc->getDb()->prepare($r);
                $stmt->execute([':idBL' => $idBL]);

                if ($stmt) {
                    echo json_encode(['success' => true]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Échec de la mise à jour.']);
                }
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
        }
        break;


        case 28: // Nouveau case pour gérer la consultation des informations du bon de livraison
            try {
               
               if(empty($_GET['idBL'])) {
                   echo json_encode(['success' => false, 'message' => 'ID du bon de livraison manquant.']);
                   exit;

               }
                $idBL = $_GET['idBL'];
    
                $r = "SELECT DISTINCT * FROM product p, bon_livraison bl, bon_livraison_produit blp WHERE blp.idBL = bl.idBL AND blp.idP = p.idP AND bl.idBL = :idBL";
                $requette =$gc->getDb()->prepare($r);
                $requette->execute([':idBL' => $idBL]);
                $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
    
                if (empty($reponse)) {
                    echo json_encode(['success' => false, 'message' => 'Aucun produit trouvé.']);
                } else {
                    $_SESSION["idBL"] = $idBL;
                    echo json_encode(['success' => true, 'products' => $reponse]);
                }
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
            }
break;

case 29: //Valider livraison en mettant à jour le stock
    try {
        $idBL = $_GET["idBL"];

        if (empty($idBL)) {
            echo json_encode(['success' => false, 'message' => 'ID de bon de livraison invalide.']);
            exit;
        }

        // Étape 1 : Mettre à jour l’état du bon de livraison
        $updateEtat = "UPDATE bon_livraison SET Etat_Livraison = 3 WHERE idBL = :idBL";
        $stmt = $gc->getDb()->prepare($updateEtat);
        $stmt->execute([':idBL' => $idBL]);

        // Étape 2 : Récupérer tous les produits du bon de livraison
        $queryProduits = "
            SELECT idP, quantite 
            FROM bon_livraison_produit 
            WHERE idBL = :idBL
        ";
        $stmtProduits = $gc->getDb()->prepare($queryProduits);
        $stmtProduits->execute([':idBL' => $idBL]);
        $produits = $stmtProduits->fetchAll(PDO::FETCH_ASSOC);

        // Étape 3 : Pour chaque produit, mettre à jour le stock et le total
        foreach ($produits as $produit) {
            $idP = $produit['idP'];
            $quantiteLivree = floatval($produit['quantite']);

            $updateStock = "
                UPDATE product 
                SET Stock_actuel = Stock_actuel + :qte,
                    Total = Total + :qte
                WHERE idP = :idP
            ";
            $stmtUpdate = $gc->getDb()->prepare($updateStock);
            $stmtUpdate->execute([
                ':qte' => $quantiteLivree,
                ':idP' => $idP
            ]);
        }

        echo json_encode(['success' => true, 'message' => 'Bon de livraison validé et stock mis à jour.']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => "Erreur : " . $e->getMessage()]);
    }
    break;


    case 30: // PoursuivreLivraison
        try {
            if (empty($_GET['idBL'])) {
                echo json_encode(['success' => false, 'message' => 'ID du bon de livraison manquant.']);
                exit;
            }

            $idBL = $_GET['idBL'];

            $r = "SELECT 
    DISTINCT blp.idP, 
    blp.quantite, 
    blp.idBL, 
    bcp.idbc, 
    p.nomproduit, 
    blp.prix_unitaire,
    blp.unite
FROM 
    bon_livraison_produit blp
INNER JOIN 
    product p ON blp.idP = p.idP
INNER JOIN 
    bon_commande_produit bcp ON blp.idP = bcp.idP
INNER JOIN 
    bon_livraison bl ON bl.idBL = blp.idBL
INNER JOIN 
    bon_commande bc ON bc.id_BC = bl.id_bc
WHERE 
    blp.idBL = :idBL and bcp.idbc = bc.id_BC

"; 
            $requette =  $gc->getDb()->prepare($r);
            $requette->execute([':idBL' => $idBL]);
            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);

            if (empty($reponse)) {
                echo json_encode(['success' => false, 'message' => 'Aucun produit trouvé.']);
            } else {
                foreach ($reponse as &$ventes) {
                    $ventes['reste'] = reste($ventes['idP'], $idBL, $ventes['idbc'],  $gc->getDb());
                }
                echo json_encode(['success' => true, 'products' => $reponse]);
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
        }
        break;
        case 31: // Nouveau case pour récupérer les autres produits du bon de commande
            try {
                if (empty($_GET['idBL'])) {
                    echo json_encode(['success' => false, 'message' => 'ID du bon de livraison manquant.']);
                    exit;
                }
        
                $idBL = $_GET['idBL'];
        
                $r = "SELECT distinct bcp.idP, p.nomproduit, bcp.idbc
                      FROM bon_commande bc
                      INNER JOIN bon_commande_produit bcp ON bcp.idbc = bc.id_BC
                      INNER JOIN bon_livraison bl ON bl.id_bc = bc.id_BC
                      INNER JOIN product p ON bcp.idP = p.idP
                      WHERE bl.idBL = :idBL
                      AND bcp.idP NOT IN (SELECT idP FROM bon_livraison_produit WHERE idBL = :idBL)";
                $requette = $gc->getDb()->prepare($r);
                $requette->execute([':idBL' => $idBL]);
                $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                if (($reponse)) {
                    foreach ($reponse as &$ventes) {
                        $ventes['reste'] = reste($ventes['idP'], $idBL, $ventes['idbc'],  $gc->getDb());
                    }
                    echo json_encode(['success' => true, 'products' => $reponse]);
                } else {
                    echo json_encode(['success' => true, 'products' => $reponse]);
                 
                }
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
            }
            break;
        
            case 32: // Nouveau case pour récupérer la quantité restante
                try {
                    if (empty($_GET['idP']) || empty($_GET['idbc'])) {
                        echo json_encode(['success' => false, 'message' => 'ID du produit ou ID du bon de commande manquant.']);
                        exit;
                    }
        
                    $idP = $_GET['idP'];
                    $idbc = $_GET['idbc'];
        
                    $r = "SELECT SUM(quantite) as somme FROM bon_livraison_produit WHERE idP = :idP";
                    $requette = $gc->getDb()->prepare($r);
                    $requette->execute([':idP' => $idP]);
                    $resultat = $requette->fetch(PDO::FETCH_ASSOC);
                    $qte_bl = $resultat['somme'] ?? 0;
        
                    $q = "SELECT quantite FROM bon_commande_produit WHERE idP = :idP AND idbc= :idbc";
                    $rqt = $gc->getDb()->prepare($q);
                    $rqt->execute([':idP' => $idP, ':idbc' => $idbc]);
                    $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                    $qte_bc = $rep['quantite'] ?? 0;
        
                    $reste = $qte_bc - $qte_bl;

                    echo json_encode(['success' => true, 'reste' => $reste]);
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                }
                break;


    case 33:
    try {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enregistrerTout'])) {
            $idP = json_decode($_POST['products'], true);
            $Prix = json_decode($_POST['prix'], true);
            $quantite = json_decode($_POST['quantity'], true);
            $unites = json_decode($_POST['unite'], true);
            $idBL = $_POST['idBL'] ?? $_SESSION["idBL"];
            $idBC = $_POST["idBC"];
            $nomBL = $_POST["nomBL"] ?? 'Nom par défaut';
            date_default_timezone_set('Africa/Dakar');
            $dateT = new DateTime();
            $date = $dateT->format("Y-m-d H:i:s");

            if (empty($idBL)) throw new Exception("ID du bon de livraison manquant.");
            if (empty($idP) || !is_array($idP) || empty($quantite) || !is_array($quantite) || empty($Prix) || !is_array($Prix)) {
                throw new Exception("Données d'entrée invalides");
            }

            $produitsIncoherents = [];

            foreach ($idP as $i => $id) {
                $qte_saisie = floatval($quantite[$i]);
                $prix_saisi = floatval($Prix[$i]);
                $unite_saisie = $unites[$i] ?? '';

                // Nom du produit
                $stmtNom = $gc->getDb()->prepare("SELECT nomproduit FROM product WHERE idP = :idP");
                $stmtNom->execute([':idP' => $id]);
                $nomProduit = $stmtNom->fetchColumn() ?? 'Nom inconnu';

                // Quantité déjà livrée
                $stmtLiv = $gc->getDb()->prepare("SELECT quantite, dateadd FROM bon_livraison_produit WHERE idP = :idP AND idBL = :idBL");
                $stmtLiv->execute([':idP' => $id, ':idBL' => $idBL]);
                $livraison = $stmtLiv->fetch(PDO::FETCH_ASSOC);
                $qte_bl = $livraison['quantite'] ?? 0;
                $dateadd = $livraison['dateadd'] ?? $date;

                // Quantité commandée
                $stmtCmd = $gc->getDb()->prepare("SELECT quantite FROM bon_commande_produit WHERE idP = :idP AND idBC = :idBC");
                $stmtCmd->execute([':idP' => $id, ':idBC' => $idBC]);
                $qte_bc = $stmtCmd->fetchColumn() ?? 0;

                $reste = $qte_bc - $qte_bl;

                if ($qte_saisie <= 0 || $prix_saisi <= 0 || $unite_saisie === '') {
                    $produitsIncoherents[] = [
                        'nomProduit' => $nomProduit,
                        'quantiteSaisie' => $qte_saisie,
                        'reste' => $reste
                    ];
                    continue;
                }

                if (!$livraison) {
                    // ➕ Insertion
                    if ($qte_saisie > $reste) {
                        $produitsIncoherents[] = [
                            'nomProduit' => $nomProduit,
                            'quantiteSaisie' => $qte_saisie,
                            'reste' => $reste
                        ];
                        continue;
                    }

                    $stmtInsert = $gc->getDb()->prepare("
                        INSERT INTO bon_livraison_produit (idBL, idP, quantite, prix_unitaire, unite, dateadd)
                        VALUES (:idBL, :idP, :quantite, :prix, :unite, :dateadd)
                    ");
                    $stmtInsert->execute([
                        ':idBL' => $idBL,
                        ':idP' => $id,
                        ':quantite' => $qte_saisie,
                        ':prix' => $prix_saisi,
                        ':unite' => $unite_saisie,
                        ':dateadd' => $date
                    ]);
                } else {
                    if ($reste > 0) {
                        // 🔁 Cumul
                        $qte_nouvelle = $qte_bl + $qte_saisie;
                        if ($qte_nouvelle > $qte_bc) {
                            $produitsIncoherents[] = [
                                'nomProduit' => $nomProduit,
                                'quantiteSaisie' => $qte_saisie,
                                'reste' => $reste
                            ];
                            continue;
                        }
                    } else {
                        // 🔁 Remplacement (reste == 0)
                        $qte_nouvelle = $qte_saisie;
                        if ($qte_nouvelle > $qte_bc) {
                            $produitsIncoherents[] = [
                                'nomProduit' => $nomProduit,
                                'quantiteSaisie' => $qte_saisie,
                                'reste' => $reste
                            ];
                            continue;
                        }
                    }

                    $stmtUpdate = $gc->getDb()->prepare("
                        UPDATE bon_livraison_produit 
                        SET quantite = :quantite, prix_unitaire = :prix, unite = :unite 
                        WHERE idBL = :idBL AND idP = :idP AND dateadd = :dateadd
                    ");
                    $stmtUpdate->execute([
                        ':quantite' => $qte_nouvelle,
                        ':prix' => $prix_saisi,
                        ':unite' => $unite_saisie,
                        ':idBL' => $idBL,
                        ':idP' => $id,
                        ':dateadd' => $dateadd
                    ]);
                }
            }

            if (!empty($produitsIncoherents)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Incohérences détectées.',
                    'produitsIncoherents' => $produitsIncoherents
                ]);
                exit;
            }

            $stmt = $gc->getDb()->prepare("UPDATE bon_livraison SET Etat_Livraison = 5 WHERE idBL = :idBL");
            $stmt->execute([':idBL' => $idBL]);

            echo json_encode(['success' => true]);

        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
    }
    break;


    case 34:
      
    
        try {
            $r = "SELECT * FROM fournisseur WHERE nomF <> 'pas de fournisseur'";
            $requette =$gc->getDb()->prepare($r);
            $requette->execute();
            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
    
            echo json_encode(['success' => true, 'data' => $reponse]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
        }
        break;
        case 35:
            if(!empty($_POST["nom"]) && !empty($_POST["prenom"]) && !empty($_POST["adresse"]) && !empty($_POST["mail"]) && !empty($_POST["telephone"]) && !empty($_POST["entreprise"]) && !empty($_POST["ville"])){
                try {
               
   
         
                    $nom = htmlspecialchars($_POST["nom"]);
                    $prenom = htmlspecialchars($_POST["prenom"]);
                    $adresse = htmlspecialchars($_POST["adresse"]);
                    $mail = htmlspecialchars($_POST["mail"]);
                    $telephone =($_POST["telephone"]);
                    $entreprise = htmlspecialchars($_POST["entreprise"]);
                    $ville = htmlspecialchars($_POST["ville"]);
            
                   
                    $regexTel = "/^(221|00221|\+221)?(77|78|75|70|76)[0-9]{7}$/";
                   
                    $regexEmail = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/";
            
                   
                    if (preg_match($regexTel, $telephone) && preg_match($regexEmail, $mail)) {
                        $r = "INSERT INTO fournisseur(nomF, prenomF, adresseF, telF, emailF, ville, entreprise) VALUES(:nom, :prenom, :adresse, :telephone, :mail, :ville, :entreprise)";
                       
                        $stmt = $gc->getDb()->prepare($r);
                        $stmt->bindParam(':nom', $nom);
                        $stmt->bindParam(':prenom', $prenom);
                        $stmt->bindParam(':adresse', $adresse);
                        $stmt->bindParam(':telephone', $telephone);
                        $stmt->bindParam(':mail', $mail);
                        $stmt->bindParam(':ville', $ville);
                        $stmt->bindParam(':entreprise', $entreprise);
                        $stmt->execute();
            
                        $newFournisseurId = $gc->getDb()->lastInsertId();
            
                        if ($newFournisseurId) {
                            echo json_encode(['success' => true, 'idF' => $newFournisseurId]);
                        } else {
                            echo json_encode(['success' => false, 'message' => 'Échec de l\'ajout du fournisseur.']);
                        }
                    } else {
                        $errorType = preg_match($regexTel, $telephone) ? "nonEmail" : "nonTel";
                        echo json_encode(['success' => false, 'message' => 'Données invalides.', 'errorType' => $errorType]);
                    }
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                }
            }
            else{
                echo json_encode(['success' => false, 'message' => 'champObligatoire']);

            }
      
            break;
    case 36:
      
    
        try {
            $r = "SELECT distinct * FROM expression_besoin eb
                  join status_commande sc on sc.id_status_cmd = eb.Etat_expression_besoin
                  WHERE eb.Etat_expression_besoin != 4
                  ORDER BY date_creation DESC";
            $requette = $gc->getDb()->prepare($r);
            $requette->execute();
            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
    
            echo json_encode(['success' => true, 'data' => $reponse]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
        }
        break;
        case 37:
          
        
            try {
                $idBon = $_POST['idBon'];
                $r = "SELECT distinct * FROM expression_besoin_produit WHERE idEB = :idBon";
                $requette = $gc->getDb()->prepare($r);
                $requette->bindParam(':idBon', $idBon, PDO::PARAM_INT);
                $requette->execute();
                $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
        
                echo json_encode(['success' => true, 'data' => $reponse]);
            } catch (PDOException $e) {
                echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
            }
            break;
            case 38:
                
            
                try {
                    $idBon = $_POST['idBon'];
                    $r = "SELECT * FROM expression_besoin_produit ebp
                          JOIN product p ON p.idP = ebp.idP
                          JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
                          WHERE idEB = :id";
                    $requette = $gc->getDb()->prepare($r);
                    $requette->bindParam(':id', $idBon, PDO::PARAM_INT);
                    $requette->execute();
                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
            
                    $r1 = "SELECT * FROM product";
                    $requette2 = $gc->getDb()->prepare($r1);
                    $requette2->execute();
                    $reponse2 = $requette2->fetchAll(PDO::FETCH_ASSOC);
            
                    echo json_encode(['success' => true, 'data' => $reponse, 'products' => $reponse2]);
                } catch (PDOException $e) {
                    echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                }
                break;
                case 39:
                  
                
                    try {
                        $idSousCategorie = $_POST['id_sous_categorie'];
                        $sql = "SELECT * FROM product WHERE id_Sous_categorie = :idSousCategorie AND Stock_actuel > 0";
                        $stmt = $gc->getDb()->prepare($sql);
                        $stmt->bindParam(':idSousCategorie', $idSousCategorie, PDO::PARAM_INT);
                        $stmt->execute();
                        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode(['success' => true, 'data' => $products]);
                    } catch (PDOException $e) {
                        echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                    }
                    break;
                    case 40:
                    
                        try {
                            $idProduit = $_POST['id_produit'];
                            $sql = "SELECT Stock_actuel FROM product WHERE idP = :idProduit";
                            $stmt = $gc->getDb()->prepare($sql);
                            $stmt->bindParam(':idProduit', $idProduit, PDO::PARAM_INT);
                            $stmt->execute();
                            $stock = $stmt->fetch(PDO::FETCH_ASSOC);
                            echo json_encode(['success' => true, 'data' => $stock]);
                        } catch (PDOException $e) {
                            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                        }
                        break;
                        case 41:
                        
                            try {
                                $idP = $_POST['idP'];
                                $idBon = $_POST['idBon'];
                                $quantite = $_POST['quantite'];
                                $unite = $_POST['unite'];
                        
                                // Supprimer le produit du bon de sortie
                                $r = "DELETE FROM expression_besoin_produit WHERE idEB   = :idBon and idP = :idP";
                                $requette = $gc->getDb()->prepare($r);
                                $requette->bindParam(':idBon', $idBon);
                                $requette->bindParam(':idP', $idP);
                                $requette->execute();
                        
                                // Mettre à jour le stock du produit
                                $stmt = $gc->getDb()->prepare("UPDATE product SET Stock_actuel = Stock_actuel + :quantity WHERE idP = :idP");
                                $stmt->bindParam(':quantity', $quantite);
                                $stmt->bindParam(':idP', $idP);
                                $stmt->execute();
                                  // Mettre à jour le statut du produit
        $updateStateStmt = $gc->getDb()->prepare("UPDATE product SET id_statut = 1 WHERE idP = :idP");
        $updateStateStmt->bindParam(':idP', $idP);
        $updateStateStmt->execute();

        echo json_encode(true);
    } catch (PDOException $e) {
        echo json_encode(false);
    }
    break;


    case 42:
          
        try {
            $expB = $_POST['idBon'];
            $etats = 2;
            
            $r = "SELECT Etat_expression_besoin FROM expression_besoin WHERE idEB = :id_EB";
            $requette = $gc->getDb()->prepare($r);
            $requette->bindParam(':id_EB', $expB);
            $requette->execute();
            $result = $requette->fetch(PDO::FETCH_ASSOC);
    
            if ($result) {
                if ($result['Etat_expression_besoin'] == 2) {
                    $_SESSION["cmd"] = "Deja_Fait";
                    echo json_encode(['success' => false, 'message' => 'Déjà validé']);
                } else {
                    date_default_timezone_set('Africa/Dakar');
                    $dateT = new DateTime();
                    $date_validation = $dateT->format("Y-m-d H:i:s");
    
                // Mettre à jour l'état de la commande
                $updateQuery = "UPDATE expression_besoin SET Etat_expression_besoin = :Etat_commander WHERE idEB = :id_EB";
                $updateRequette = $gc->getDb()->prepare($updateQuery);
                $updateRequette->bindParam(':Etat_commander', $etats);
                $updateRequette->bindParam(':id_EB',  $expB);
                $updateRequette->execute();

                // Sélectionner tous les produits pour mettre à jour leur stock
                $r_list = "SELECT idP, quantite FROM expression_besoin_produit WHERE idEB = :id_EB";
                $requette_list = $gc->getDb()->prepare($r_list);
                $requette_list->bindParam(':id_EB', $expB);
                $requette_list->execute();
                $result_list = $requette_list->fetchAll(PDO::FETCH_ASSOC);

              
                if ($updateRequette) {
                    $_SESSION["cmd"] = "Valider";
                    echo json_encode(['success' => true, 'message' => 'Validation réussie']);
                } else {
                    $_SESSION["cmd"] = "Erreur lors de la validation de la commande.";
                    echo json_encode(['success' => false, 'message' => 'Erreur lors de la validation']);
                }
            }
        } else {
            $_SESSION["cmd"] = "Sortie non trouvée.";
            echo json_encode(['success' => false, 'message' => 'Sortie non trouvée']);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
    }
    break;
    case 43:

     
            $matricule = $_POST['matricule'];
$nom = $_POST['nom'];
$prenom = $_POST['prenom'];
$service = $_POST['service'];
date_default_timezone_set('Africa/Dakar');
$dateT = new DateTime();
$date = $dateT->format("Y-m-d H:i:s");

// Save product data to database
$r = "INSERT INTO expression_besoin (user,structure,nom,prenom,date_creation) VALUES(:matricule,:structure,:nom,:prenom,:date_add)";
$requette = $gc->getDb()->prepare($r);
$requette->bindParam(':matricule', $matricule);
$requette->bindParam(':structure', $service);
$requette->bindParam(':nom', $nom);
$requette->bindParam(':prenom', $prenom);
$requette->bindParam(':date_add', $date);
$requette->execute();

// Return success response
if($requette) {
    echo json_encode(true);
} else {
    echo json_encode(false);
}       
break;     
case 44:
    if (isset($_GET["idBon"])) {
        $auto_gen = $_GET["idBon"];
        $r = "SELECT * FROM expression_besoin WHERE idEB = (SELECT idEB FROM expression_besoin ORDER BY idEB DESC LIMIT 1)";
        $requette = $gc->getDb()->prepare($r);
        $requette->execute();
        $reponse = $requette->fetch(PDO::FETCH_ASSOC);
    
        if ($reponse) {
            $name = $reponse["date_creation"];
            echo json_encode(['name' => $name]);
        } else {
            echo json_encode(['error' => 'No record found.']);
        }
    } else {
        echo json_encode(['error' => 'idBon not set.']);
    } 
    break;
    case 45:
        $sql = "SELECT c.id_categorie, c.nom_categorie, sc.idSC, sc.nom 
                FROM categorie c
                JOIN souscategorie sc ON c.id_categorie = sc.id_categorie
                JOIN product p ON sc.idSC = p.id_Sous_categorie
                WHERE p.Stock_actuel > 0
                GROUP BY c.id_categorie, c.nom_categorie, sc.idSC, sc.nom
                HAVING COUNT(p.idP) > 0
                ORDER BY c.nom_categorie, sc.nom";
    
        $stmt = $gc->getDb()->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
        echo json_encode($categories);
        break;
        case 46:

            
            if (isset($_GET['id_sous_categorie'])) {
                $idSousCategorie = $_GET['id_sous_categorie'];
                $sql = "SELECT * FROM product WHERE id_Sous_categorie = :idSousCategorie AND Stock_actuel > 0";
                $stmt = $gc->getDb()->prepare($sql);
                $stmt->bindParam(':idSousCategorie', $idSousCategorie, PDO::PARAM_INT);
                $stmt->execute();
                $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($products);
            } else {
                echo json_encode(['error' => 'id_sous_categorie not set.']);
            }
            break;
            case 47:
                $sql = "SELECT c.id_categorie, c.nom_categorie, sc.idSC, sc.nom 
                        FROM categorie c
                        JOIN souscategorie sc ON c.id_categorie = sc.id_categorie
                        JOIN product p ON sc.idSC = p.id_Sous_categorie
                        WHERE p.Stock_actuel > 0
                        GROUP BY c.id_categorie, c.nom_categorie, sc.idSC, sc.nom
                        HAVING COUNT(p.idP) > 0
                        ORDER BY c.nom_categorie, sc.nom";
                $stmt = $gc->getDb()->prepare($sql);
                $stmt->execute();
                $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($categories);
                break;
                case 48:
                    
    $id_produit = $_GET['id_produit'];

    $r = "SELECT Stock_actuel 
        FROM product
        WHERE idP = :id_produit";

    $requette = $gc->getDb()->prepare($r);
    $requette->bindParam(':id_produit', $id_produit);
    $requette->execute();
    $reponse = $requette->fetch(PDO::FETCH_ASSOC);

    echo json_encode($reponse);
    break;


    case 49:
        $id_sous_categorie = $_GET['id_sous_categorie'];

        $r = "SELECT p.idP, p.nomproduit,p.Stock_actuel
            FROM product p
            JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC
            WHERE  p.id_Sous_categorie = :id_sous_categorie and p.Stock_actuel > 0
            ORDER BY p.nomproduit";

        $requette = $gc->getDb()->prepare($r);
        $requette->bindParam(':id_sous_categorie', $id_sous_categorie);
        $requette->execute();
        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($reponse);
        break;


    case 50:
        $idP = $_POST['idP'];
        $quantite = $_POST['quantite'];
        $unite = $_POST['unite'];
        $idBon = $_POST['idBon'];
        date_default_timezone_set('Africa/Dakar');
        $dateT = new DateTime();
        $date = $dateT->format("Y-m-d H:i:s");

        // Save product data to database
        $r = "INSERT INTO expression_besoin_produit (idP, idEB, quantite,unite, dateadd) VALUES (:idP, :idBon, :quantite,:unite, :dateadd)";
        $requette = $gc->getDb()->prepare($r);
        $requette->bindParam(':idBon', $idBon);
        $requette->bindParam(':idP', $idP);
        $requette->bindParam(':dateadd', $date);
        $requette->bindParam(':quantite', $quantite);
        $requette->bindParam(':unite', $unite);
        $requette->execute();

        $updateSql = "UPDATE expression_besoin SET Etat_expression_besoin = 5 WHERE idEB = :idEB";
        $updateStmt = $gc->getDb()->prepare($updateSql);
        $updateStmt->bindParam(':idEB', $idBon);
        $updateStmt->execute();
    // Return success response
    if ($requette) {
        echo json_encode(true);
    } else {
        echo json_encode(false);
    }
    break;


    case 51:     
       
        $idP = $_POST['idP'];
        $idP_ancien = $_POST['id'];
        $quantite = $_POST['quantite'];
        $unite = $_POST['unite'];
        $idBon = $_POST['idBon'];
        date_default_timezone_set('Africa/Dakar');
           $dateT = new DateTime();
          $date = $dateT->format("Y-m-d H:i:s");
       
        $r = "UPDATE expression_besoin_produit SET idP = :idP , dateadd = :dateadd ,quantite = :quantite ,unite = :unite WHERE idEB = :idBon and idP = :id_ancien";
        $requette = $gc->getDb()->prepare($r);
        $requette->bindParam(':idBon', $idBon);
        $requette->bindParam(':idP', $idP);
        $requette->bindParam(':id_ancien', $idP_ancien);
        $requette->bindParam(':dateadd', $date);
        $requette->bindParam(':quantite', $quantite);
        $requette->bindParam(':unite', $unite);
        $requette->execute();
    
        // Return success response
        if($requette) {
            echo json_encode(true);
        } else {
            echo json_encode(false);
        }
        break;


        case 52:
         
            try {
        
                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                    $idP = $_POST['idP'];
                    $quantite = $_POST['quantite'];
                    $unite = $_POST['unite'];
                    $idEB = $_POST["idBon"];
                    date_default_timezone_set('Africa/Dakar');
                                        $dateT = new DateTime();
                                        $date = $dateT->format("Y-m-d H:i:s");
        
                    
                   
                    // Prepare the insert statement
                    $sql = "INSERT INTO expression_besoin_produit (idP, idEB, quantite,unite, dateadd) VALUES (:idP, :idEB, :quantite, :unite,:dateadd)";
                    $stmt = $gc->getDb()->prepare($sql);
        
                    foreach ($idP as $i => $id) {
                        $checkProductSql = "SELECT COUNT(*) FROM expression_besoin_produit WHERE idP = :idP AND idEB = :idEB";
                        $checkProductStmt = $gc->getDb()->prepare($checkProductSql);
                        $checkProductStmt->execute([':idP' => $id, ':idEB' => $idEB]);
                        $productExists = $checkProductStmt->fetchColumn();
        
                        // If the product exists, skip to the next iteration
                        if ($productExists > 0) {
                            continue; // Skip this product
                        }
        
                        // If the product does not exist, we insert it
                        $stmt->execute([
                            ':idEB' => $idEB,
                            ':idP' => $id,
                            ':quantite' => $quantite[$i],
                            ':unite' => $unite[$i],
                            ':dateadd' => $date
                        ]);
                    }
        
                    $r = "UPDATE expression_besoin SET Etat_expression_besoin = 5 WHERE idEB = :idEB";
                    $updateStmt = $gc->getDb()->prepare($r);
                    $updateStmt->execute([':idEB' => $idEB]);
        
                    echo json_encode(['message' => 'Fait']);
                }
            } catch (PDOException $e) {
                echo json_encode(['error' => $e->getMessage()]);
            }
            break;
            case 53:
                try {
                    $idBL = $_POST["idBL"];
            
                     if (empty($idBL)) {
                        throw new Exception("ID de bon de livraison invalide.");
                    }
            
                    $r = "UPDATE bon_livraison SET Etat_Livraison = 4 WHERE idBL = :idBL";
                    $stmt = $gc->getDb()->prepare($r);
                    $stmt->execute([':idBL' => $idBL]);
            
                    echo json_encode(['status' => 'success']);
                } catch (PDOException $e) {
                    echo json_encode(['status' => 'error', 'message' => "Erreur PDO : " . $e->getMessage()]);
                } 
                break;
                case 54:
                
                    try {
                        $query = "SELECT DISTINCT nom_categorie FROM categorie ORDER BY nom_categorie";
                        $stmt = $gc->getDb()->prepare($query);
                        $stmt->execute();
                        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                        echo json_encode($categories);
                    } catch (PDOException $e) {
                        echo json_encode(['status' => 'error', 'message' => "Erreur PDO : " . $e->getMessage()]);
                    } catch (Exception $e) {
                        echo json_encode(['status' => 'error', 'message' => "Erreur : " . $e->getMessage()]);
                    }
                    break;
                
                case 55:
                
                    try {
                        $query = "SELECT DISTINCT nom_statut FROM statut";
                        $stmt = $gc->getDb()->prepare($query);
                        $stmt->execute();
                        $souscategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                        echo json_encode($souscategories);
                    } catch (PDOException $e) {
                        echo json_encode(['status' => 'error', 'message' => "Erreur PDO : " . $e->getMessage()]);
                    } catch (Exception $e) {
                        echo json_encode(['status' => 'error', 'message' => "Erreur : " . $e->getMessage()]);
                    }
                    break;
                    case 56:
                    
                        try {
                            $r = "SELECT * FROM product p 
                                  JOIN statut s ON p.id_statut=s.id_statut 
                                  JOIN souscategorie sc ON p.id_Sous_categorie = sc.idSC 
                                  JOIN categorie c ON c.id_categorie = sc.id_categorie 
                                  ORDER BY idP DESC";
                            $stmt = $gc->getDb()->prepare($r);
                            $stmt->execute();
                            $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    
                            echo json_encode($produits);
                        } catch (PDOException $e) {
                            echo json_encode(['status' => 'error', 'message' => "Erreur PDO : " . $e->getMessage()]);
                        } 
                        break;
                        case 57:
                            try {
                                $query =" SELECT DISTINCT nom FROM souscategorie order by nom";
                                $stmt = $gc->getDb()->prepare($query);
                                $stmt->execute();
                                $Souscategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        
                                echo json_encode($Souscategories);
                            } catch (PDOException $e) {
                                echo json_encode(['status' => 'error', 'message' => "Erreur PDO : " . $e->getMessage()]);
                            } catch (Exception $e) {
                                echo json_encode(['status' => 'error', 'message' => "Erreur : " . $e->getMessage()]);
                            }
                            break;
                           
                                             
                            case 58:
                                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                                    try {
                                        $idBon = valid_donnees($_POST['idBon']);
                                        $etats = 4;
                                        $r = "UPDATE expression_besoin SET Etat_expression_besoin = :etat_eb WHERE idEB = :idBon";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->bindParam(':etat_eb', $etats, PDO::PARAM_INT);
                                        $requette->bindParam(':idBon', $idBon, PDO::PARAM_INT);
                                        $requette->execute();
                            
                                        if ($requette) {
                                            echo json_encode(['success' => true]);
                                        } else {
                                            echo json_encode(['success' => false, 'message' => "Erreur lors de la suppression."]);
                                        }
                                    } catch (Throwable $th) {
                                        echo json_encode(['success' => false, 'message' => 'Erreur : ' . $th->getMessage()]);
                                    }
                                }
                            break;

                            case 59:
                                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                                    try {
                                        $idBon = valid_donnees($_POST['idBon']);
                                        $r = "SELECT * FROM expression_besoin_produit bcp 
                                                JOIN product p ON p.idP = bcp.idP
                                                WHERE idEB = :id";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->bindParam(':id', $idBon, PDO::PARAM_INT);
                                        $requette->execute();
                                        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                            
                                        echo json_encode(['success' => true, 'data' => $reponse]);
                                    } catch (Throwable $th) {
                                        echo json_encode(['success' => false, 'message' => 'Erreur : ' . $th->getMessage()]);
                                    }
                                }
                                break;

                                case 60:
                                    try {
                                        $stmt = $gc->getDb()->prepare("SELECT bc.id_BC, bc.nomBC, bc.date, sc.nom_status_cmd, bc.Etat_commander, bc.idBC_gen FROM bon_commande bc JOIN status_commande sc ON sc.id_status_cmd = bc.Etat_commander WHERE bc.Etat_commander = 2 ORDER BY bc.date");
                                        $stmt->execute();
                                        $listes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                
                                        $data = array();
                                        foreach ($listes as $tmp) {
                                            $data[] = array(
                                                'id_BC' => $tmp["id_BC"],
                                                'nomBC' => $tmp["nomBC"],
                                                'date' => $tmp["date"],
                                                'nom_status_cmd' => $tmp["nom_status_cmd"],
                                                'Etat_commander' => $tmp["Etat_commander"],
                                                'idBC_gen' => $tmp["idBC_gen"]
                                            );
                                        }
                                        echo json_encode($data);
                                        die;
                                    } catch (PDOException $e) {
                                        echo "erreur";
                                        die;
                                    }
                                    break;

                                    case 61: // Nouveau case pour récupérer les livraisons
                                        try {
                                            $connexion = $gc->getDb();
                                            $sql = "SELECT distinct bl.*, sc.nom_status_cmd, bc.nomBC FROM bon_livraison bl
                                                    join status_commande sc on sc.id_status_cmd = bl.Etat_Livraison
                                                    join bon_commande bc on bc.id_BC = bl.id_bc 
                                                    where bl.Etat_Livraison = 3"; // Exemple de requête pour récupérer les livraisons
                                            $stmt = $connexion->prepare($sql);
                                            $stmt->execute();
                                            $livraisons = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                
                                            foreach ($livraisons as &$ventes) {
                                                $idBL = $ventes["idBL"];
                                                $r = "SELECT * FROM bon_livraison_produit WHERE idBL = :idBL";
                                                $requette = $connexion->prepare($r);
                                                $requette->bindParam(':idBL', $idBL, PDO::PARAM_INT);
                                                $requette->execute();
                                                $ventes["nbr_produits"] = $requette->rowCount();
                                            }
                                
                                            echo json_encode($livraisons);
                                        } catch (PDOException $e) {
                                            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
                                        }
                                        break;

                                        case 62:     
                                        try {
                                            $r = "SELECT distinct * FROM expression_besoin eb
                                                    join status_commande sc on sc.id_status_cmd = eb.Etat_expression_besoin
                                                    WHERE eb.Etat_expression_besoin = 2
                                                    ORDER BY date_creation DESC";
                                            $requette = $gc->getDb()->prepare($r);
                                            $requette->execute();
                                            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                    
                                            echo json_encode(['success' => true, 'data' => $reponse]);
                                        } catch (PDOException $e) {
                                            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                                        }
                                        break;
                            
                                        case 63:
                                            $r = "SELECT * FROM categorie";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->execute();
                                        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                        foreach ($reponse as $ventes) {
                                        
                                            echo" <option selected value= {$ventes["id_categorie"]}> {$ventes["nom_categorie"] }</option>";
                                        }
                                    break;

                                    case 64:
                                        $idP = $_POST['idP'];
                                        $bonCmd = $_POST['idbc'];

                                        $r = "DELETE FROM bon_commande_produit WHERE idbc = :idBon and idP = :idP";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->bindParam(':idBon', $bonCmd);
                                        $requette->bindParam(':idP', $idP);
                                        $requette->execute();

                                        // Return success response
                                        if($requette) {
                                            echo json_encode(true);
                                        } else {
                                            echo json_encode(false);
                                        }
                                    break;

                                    case 65:
                                        $requette = "select * from fournisseur";
                                        $requette = $gc->getDb()->prepare($requette);
                                        $requette->execute();
                                        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                    
                                        
                                        echo json_encode($reponse); 
                                        break;


                                        case 66:
                                        $exp="select * from expression_besoin where Etat_expression_besoin=2 ";
                                        $requette= $gc->getDb()->prepare($exp);
                                        $requette->execute();
                                        $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                        foreach($reponse as $exp){
                                            echo "<option value=".$exp['idEB']."> ".$exp['date_creation']." ".$exp['structure']."  ".$exp['prenom']." ".$exp['nom']."</option>";

                                        }
                                        break;

                                        case 67:
                                        $expID = $_POST['expID'];
                                                    
                                        date_default_timezone_set('Africa/Dakar');
                                        $dateT = new DateTime();
                                        $date = $dateT->format("Y-m-d H:i:s");
                                        
                                        
                                        $r = "INSERT INTO bon_sortie(expID,date_creation) VALUES(:expID,:date_add)";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->bindParam(':expID', $expID);
                                        
                                        $requette->bindParam(':date_add', $date);
                                        $requette->execute();
                                        
                                        if($requette) {
                                            echo json_encode(true);
                                        } else {
                                            echo json_encode(false);
                                        }       
                                        break; 
                                                                                            
                                        case 68: 
                                            try {
                                                $connexion = $gc->getDb();
                                                $sql = "SELECT DISTINCT bs.*, 
                                                                sc.nom_status_cmd, 
                                                                eb.structure, 
                                                                eb.nom, 
                                                                eb.prenom
                                                        FROM bon_sortie bs
                                                        JOIN status_commande sc ON sc.id_status_cmd = bs.Etat_bon_sortie
                                                        JOIN expression_besoin eb ON eb.idEB = bs.expID 
                                                        WHERE bs.Etat_bon_sortie <> 4
                                                        ORDER BY bs.date_creation DESC";
                                                
                                                $stmt = $connexion->prepare($sql);
                                                $stmt->execute();
                                                $bonsSortie = $stmt->fetchAll(PDO::FETCH_ASSOC);
                                        
                                                // Ajouter le nombre de produits pour chaque bon de sortie
                                                foreach ($bonsSortie as &$sortie) {
                                                    $idBS = $sortie["idBS"];
                                                    $r = "SELECT COUNT(*) as nbr_produits 
                                                            FROM bon_sortie_produit 
                                                            WHERE idBS = :idBS";
                                                    $requette = $connexion->prepare($r);
                                                    $requette->bindParam(':idBS', $idBS, PDO::PARAM_INT);
                                                    $requette->execute();
                                                    $result = $requette->fetch(PDO::FETCH_ASSOC);
                                                    $sortie["nbr_produits"] = $result["nbr_produits"];
                                        
                                                    
                                                    
                                                }
                                        
                                                echo json_encode([
                                                    "success" => true,
                                                    "data" => $bonsSortie
                                                ]);
                                            } catch (PDOException $e) {
                                                echo json_encode([
                                                    "success" => false, 
                                                    "message" => "Erreur : " . $e->getMessage()
                                                ]);
                                            }
                                            break;
                                            
                                            case 69:
                                                try {
                                                    $idBS = $_POST['idBon'];
                                                    $etats = 2;
                                                    
                                                    $r = "SELECT Etat_bon_sortie FROM bon_sortie WHERE idBS = :id_BS";
                                                    $requette = $gc->getDb()->prepare($r);
                                                    $requette->bindParam(':id_BS', $idBS);
                                                    $requette->execute();
                                                    $result = $requette->fetch(PDO::FETCH_ASSOC);
                                            
                                                    if ($result) {
                                                        if ($result['Etat_bon_sortie'] == 2) {
                                                            // $_SESSION["cmd"] = "Deja_Fait";
                                                            echo json_encode(['success' => false, 'message' => 'Déjà validé']);
                                                        } else {
                                                            date_default_timezone_set('Africa/Dakar');
                                                            $dateT = new DateTime();
                                                            $date_validation = $dateT->format("Y-m-d H:i:s");
                                            
                                                        // Mettre à jour l'état de la commande
                                                        $updateQuery = "UPDATE bon_sortie SET Etat_bon_sortie = :Etat_commander WHERE idBS = :id_BS";
                                                        $updateRequette = $gc->getDb()->prepare($updateQuery);
                                                        $updateRequette->bindParam(':Etat_commander', $etats);
                                                        $updateRequette->bindParam(':id_BS',  $idBS);
                                                        $updateRequette->execute();
                                        
                                                        // Sélectionner tous les produits pour mettre à jour leur stock
                                                        $r_list = "SELECT idP, quantite FROM bon_sortie_produit WHERE idBS = :id_BS";
                                                        $requette_list = $gc->getDb()->prepare($r_list);
                                                        $requette_list->bindParam(':id_BS', $idBS);
                                                        $requette_list->execute();
                                                        $result_list = $requette_list->fetchAll(PDO::FETCH_ASSOC);
                                        
                                                        foreach ($result_list as $key) {
                                                            // Mettre à jour le stock des produits
                                                            $updateStockQuery = "UPDATE product SET Stock_actuel = Stock_actuel - :quantite WHERE idP = :idP";
                                                            $requette_stock = $gc->getDb()->prepare($updateStockQuery);
                                                            $requette_stock->bindParam(':quantite', $key["quantite"]);
                                                            $requette_stock->bindParam(':idP', $key["idP"]);
                                                            $requette_stock->execute();
                                                        }
                                                        if ($updateRequette) {
                                                            // $_SESSION["cmd"] = "Valider";
                                                            echo json_encode(['success' => true, 'message' => 'Validation réussie']);
                                                        } else {
                                                            $_SESSION["cmd"] = "Erreur lors de la validation de la commande.";
                                                            echo json_encode(['success' => false, 'message' => 'Erreur lors de la validation']);
                                                        }
                                                    }
                                                } else {
                                                    $_SESSION["cmd"] = "Sortie non trouvée.";
                                                    echo json_encode(['success' => false, 'message' => 'Sortie non trouvée']);
                                                }
                                            } catch (PDOException $e) {
                                                echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
                                            }
                                            break;
                                                                          
                            case 70:
                                if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                                    try {
                                        $idBon = valid_donnees($_POST['idBon']);
                                        $etats = 4;
                                        $r = "UPDATE bon_sortie SET Etat_bon_sortie = :etat_bS WHERE idBS = :idBon";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->bindParam(':etat_bS', $etats, PDO::PARAM_INT);
                                        $requette->bindParam(':idBon', $idBon, PDO::PARAM_INT);
                                        $requette->execute();
                            
                                        if ($requette) {
                                            echo json_encode(['success' => true]);
                                        } else {
                                            echo json_encode(['success' => false, 'message' => "Erreur lors de la suppression."]);
                                        }
                                    } catch (Throwable $th) {
                                        echo json_encode(['success' => false, 'message' => 'Erreur : ' . $th->getMessage()]);
                                    }
                                }
                                break;
                                case 71:
                                    if (isset($_GET["idBon"])) {
                                        $auto_gen = $_GET["idBon"];
                                        $r = "SELECT * FROM bon_sortie WHERE idBS = (SELECT idBS FROM bon_sortie ORDER BY idBS DESC LIMIT 1)";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->execute();
                                        $reponse = $requette->fetch(PDO::FETCH_ASSOC);
                                    
                                        if ($reponse) {
                                            $name = $reponse["date_creation"];
                                            echo json_encode(['name' => $name]);
                                        } else {
                                            echo json_encode(['error' => 'No record found.']);
                                        }
                                    } else {
                                        echo json_encode(['error' => 'idBon not set.']);
                                    } 
                                    break;
                                  
                                case 72:
                                    if (isset($_GET["idEB"]) && isset($_GET["idBS"])) {
                                        $idEB = $_GET["idEB"];
                                        $idBS = $_GET["idBS"];

                                        try {
                                            $stmt = $gc->getDb()->prepare('
                                                SELECT DISTINCT p.idP, p.nomproduit, ebp.idEB, ebp.quantite, ebp.unite,p.Stock_actuel
                                                FROM expression_besoin_produit ebp
                                                JOIN product p ON ebp.idP = p.idP
                                                JOIN bon_sortie bs ON bs.expID = ebp.idEB
                                                WHERE ebp.idEB = :idEB AND bs.idBS = :idBS
                                                AND p.Stock_actuel >= 0
                                            ');
                                            $stmt->execute([
                                                'idEB' => $idEB, 
                                                'idBS' => $idBS
                                            ]);
                                            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

                                            // Vérifier si des produits ont été trouvés
                                            if ($products) {
                                                foreach ($products as &$product) {
                                                    // Ajouter le stock actuel pour chaque produit
                                                    $stockStmt = $gc->getDb()->prepare('
                                                        SELECT Stock_actuel 
                                                        FROM product 
                                                        WHERE idP = :idP
                                                    ');
                                                    $stockStmt->execute(['idP' => $product['idP']]);
                                                    $stock = $stockStmt->fetchColumn();
                                                    $product['stock_actuel'] = $stock;

                                                    // Vérifier si le produit est déjà dans le bon de sortie
                                                    $bspStmt = $gc->getDb()->prepare('
                                                        SELECT quantite 
                                                        FROM bon_sortie_produit 
                                                        WHERE idBS = :idBS AND idP = :idP
                                                    ');
                                                    $bspStmt->execute([
                                                        'idBS' => $idBS,
                                                        'idP' => $product['idP']
                                                    ]);
                                                    $bspQuantite = $bspStmt->fetchColumn();
                                                    $product['quantite_deja_sortie'] = $bspQuantite ?: 0;
                                                }
                                            }
                                            
                                            echo json_encode([
                                                "status" => "success",
                                                "products" => $products
                                            ]);
                                        } catch (PDOException $e) {
                                            echo json_encode([
                                                "status" => "error", 
                                                "message" => "Erreur : " . $e->getMessage()
                                            ]);
                                        }
                                    } else {
                                        echo json_encode([
                                            "status" => "error",
                                            "message" => "Données manquantes (idEB ou idBS)"
                                        ]);
                                    }
                                    break;
                                
                                case 73:
                                    if (!isset($_POST['idBS'], $_POST['idP'], $_POST['quantity'], $_POST['unite'])) {
                                        echo json_encode(['success' => false, 'message' => 'Les données nécessaires ne sont pas fournies.']);
                                        exit;
                                    }

                                    date_default_timezone_set('Africa/Dakar');
                                    $dateT = new DateTime();
                                    $date = $dateT->format("Y-m-d H:i:s");
                                    $idBS = $_POST['idBS'];
                                    $idP = $_POST['idP'];
                                    $quantity = $_POST['quantity'];
                                    $unite = $_POST['unite'];

                                    // Validation de la quantité
                                    if (!is_numeric($quantity) || $quantity <= 0) {
                                        echo json_encode(['success' => false, 'message' => 'Quantité invalide.']);
                                        exit;
                                    }

                                    try {
                                        // Récupérer la quantité totale sortie pour ce produit
                                        $r = "SELECT SUM(quantite) as somme1 FROM bon_sortie_produit WHERE idP = :idP AND idBS = :idBS";
                                        $requette = $gc->getDb()->prepare($r);
                                        $requette->execute([':idP' => $idP, ':idBS' => $idBS]);
                                        $resultat = $requette->fetch(PDO::FETCH_ASSOC);
                                        $qte_bs = $resultat['somme1'] ?? 0;

                                        // Récupérer la quantité demandée dans l'expression de besoin
                                        $q = "SELECT ebp.quantite 
                                            FROM expression_besoin_produit ebp 
                                            JOIN bon_sortie bs ON bs.expID = ebp.idEB 
                                            WHERE ebp.idP = :idP AND bs.idBS = :idBS";
                                        $rqt = $gc->getDb()->prepare($q);
                                        $rqt->execute([':idP' => $idP, ':idBS' => $idBS]);
                                        $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                        $qte_eb = $rep['quantite'] ?? 0;

                                        // Vérifier le stock disponible
                                        $stockQuery = "SELECT Stock_actuel FROM product WHERE idP = :idP";
                                        $stockStmt = $gc->getDb()->prepare($stockQuery);
                                        $stockStmt->execute([':idP' => $idP]);
                                        $stockActuel = $stockStmt->fetchColumn();

                                        $reste_demande = $qte_eb - $qte_bs;
                                        
                                        // Vérifications
                                        if ($quantity > $reste_demande) {
                                            echo json_encode([
                                                'success' => false, 
                                                'message' => 'La quantité saisie dépasse la quantité restante demandée ('.$reste_demande.')'
                                            ]);
                                            exit;
                                        }

                                        if ($quantity > $stockActuel) {
                                            echo json_encode([
                                                'success' => false, 
                                                'message' => 'La quantité saisie dépasse le stock disponible ('.$stockActuel.')'
                                            ]);
                                            exit;
                                        }

                                        // Vérification de l'existence de l'enregistrement
                                        $q = "SELECT * FROM bon_sortie_produit WHERE idP = :idP AND idBS = :idBS";
                                        $rqt = $gc->getDb()->prepare($q);
                                        $rqt->execute([':idP' => $idP, ':idBS' => $idBS]);
                                        $rep = $rqt->fetchAll(PDO::FETCH_ASSOC);

                                        // Insertion ou mise à jour de l'enregistrement
                                        if (count($rep) <= 0) {
                                            $stmt = $gc->getDb()->prepare(
                                                "INSERT INTO bon_sortie_produit (idBS, idP, quantite, unite, dateadd) 
                                                VALUES (:idBS, :idP, :quantity, :unite, :dateadd)"
                                            );
                                            $stmt->bindParam(':idBS', $idBS);
                                            $stmt->bindParam(':idP', $idP);
                                            $stmt->bindParam(':quantity', $quantity);
                                            $stmt->bindParam(':unite', $unite);
                                            $stmt->bindParam(':dateadd', $date);
                                            $stmt->execute();
                                        } else {
                                            $stmt = $gc->getDb()->prepare(
                                                "UPDATE bon_sortie_produit 
                                                SET quantite = quantite + :quantity, unite = :unite 
                                                WHERE idP = :idP AND idBS = :idBS"
                                            );
                                            $stmt->bindParam(':quantity', $quantity);
                                            $stmt->bindParam(':unite', $unite);
                                            $stmt->bindParam(':idP', $idP);
                                            $stmt->bindParam(':idBS', $idBS);
                                            $stmt->execute();
                                        }

                                        // Mettre à jour l'état du bon de sortie
                                        $stmt = $gc->getDb()->prepare("UPDATE bon_sortie SET Etat_bon_sortie = 5 WHERE idBS = :idBS");
                                        $stmt->bindParam(':idBS', $idBS);
                                        $stmt->execute();

                                        echo json_encode([
                                            'success' => true, 
                                            'message' => 'Produit enregistré avec succès.'
                                        ]);

                                    } catch (PDOException $e) {
                                        echo json_encode([
                                            'success' => false, 
                                            'message' => 'Erreur serveur : ' . $e->getMessage()
                                        ]);
                                    }
                                    break;

                                    case 74: 
                                        try {
                                            if (empty($_GET['idBS'])) {
                                                echo json_encode(['success' => false, 'message' => 'ID du bon de sortie manquant.']);
                                                exit;
                                            }
                                    
                                            $idBS = $_GET['idBS'];
                                    
                                            $r = "SELECT 
                                                DISTINCT bsp.idP, 
                                                bsp.quantite, 
                                                bsp.idBS, 
                                                ebp.idEB, 
                                                p.nomproduit,
                                                p.Stock_actuel,
                                                bsp.unite
                                            FROM 
                                                bon_sortie_produit bsp
                                            INNER JOIN 
                                                product p ON bsp.idP = p.idP
                                            INNER JOIN 
                                                expression_besoin_produit ebp ON bsp.idP = ebp.idP
                                            INNER JOIN 
                                                bon_sortie bs ON bs.idBS = bsp.idBS
                                            INNER JOIN 
                                                expression_besoin eb ON eb.idEB = bs.expID
                                            WHERE 
                                                bsp.idBS = :idBS AND ebp.idEB = bs.expID";
                                    
                                            $requette = $gc->getDb()->prepare($r);
                                            $requette->execute([':idBS' => $idBS]);
                                            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                    
                                            if (empty($reponse)) {
                                                echo json_encode(['success' => false, 'message' => 'Aucun produit trouvé.']);
                                            } else {
                                                foreach ($reponse as &$produit) {
                                                    // Calculer le reste à sortir
                                                    $qteDejaBS = "SELECT SUM(quantite) as total
                                                                FROM bon_sortie_produit 
                                                                WHERE idP = :idP AND idBS = :idBS";
                                                    $stmtBS = $gc->getDb()->prepare($qteDejaBS);
                                                    $stmtBS->execute([
                                                        ':idP' => $produit['idP'],
                                                        ':idBS' => $idBS
                                                    ]);
                                                    $totalBS = $stmtBS->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
                                    
                                                    $qteEB = "SELECT quantite 
                                                            FROM expression_besoin_produit 
                                                            WHERE idP = :idP AND idEB = :idEB";
                                                    $stmtEB = $gc->getDb()->prepare($qteEB);
                                                    $stmtEB->execute([
                                                        ':idP' => $produit['idP'],
                                                        ':idEB' => $produit['idEB']
                                                    ]);
                                                    $totalEB = $stmtEB->fetch(PDO::FETCH_ASSOC)['quantite'] ?? 0;
                                    
                                                    $produit['reste'] = max(0, $totalEB - $totalBS);
                                                }
                                                echo json_encode(['success' => true, 'products' => $reponse]);
                                            }
                                        } catch (PDOException $e) {
                                            echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                                        }
                                        break;
                                    
                                    case 75: 
                                        try {
                                            if (empty($_GET['idBS'])) {
                                                echo json_encode(['success' => false, 'message' => 'ID du bon de sortie manquant.']);
                                                exit;
                                            }
                                    
                                            $idBS = $_GET['idBS'];
                                            // $idEB = $_GET['idEB'];
                                    
                                            $r = "SELECT DISTINCT 
                                                    ebp.idP, 
                                                    p.nomproduit, 
                                                    ebp.idEB,
                                                    ebp.quantite as quantite_demandee,
                                                    p.Stock_actuel,
                                                    ebp.unite
                                                FROM expression_besoin_produit ebp
                                                INNER JOIN product p ON ebp.idP = p.idP
                                                INNER JOIN expression_besoin eb ON eb.idEB = ebp.idEB
                                                INNER JOIN bon_sortie bs ON bs.expID = eb.idEB
                                                WHERE bs.idBS = :idBS 
                                            
                                                AND ebp.idP NOT IN (
                                                    SELECT idP 
                                                    FROM bon_sortie_produit 
                                                    WHERE idBS = :idBS
                                                )
                                                AND p.Stock_actuel > 0";
                                    
                                            $requette = $gc->getDb()->prepare($r);
                                            $requette->execute([
                                                ':idBS' => $idBS,
                                                
                                            ]);
                                            $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                    
                                            if ($reponse) {
                                                foreach ($reponse as &$produit) {
                                                    // Calculer le reste disponible (min entre stock et quantité demandée)
                                                    $produit['reste'] = min(
                                                        $produit['Stock_actuel'],
                                                        $produit['quantite_demandee']
                                                    );
                                                }
                                                echo json_encode(['success' => true, 'products' => $reponse]);
                                            } else {
                                                echo json_encode(['success' => true, 'products' => []]);
                                            }
                                        } catch (PDOException $e) {
                                            echo json_encode([
                                                'success' => false, 
                                                'message' => "Erreur PDO : " . $e->getMessage()
                                            ]);
                                        }
                                        break;
                                    
                                case 76:
                                    try {
                                        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['enregistrerTout'])) {
                                            $idP = json_decode($_POST['products'], true);
                                            $quantite = json_decode($_POST['quantity'], true);
                                            $unite = json_decode($_POST['unite'], true);
                                            $idBS = $_POST['idBS'] ?? $_SESSION["idBS"];
                                            $idEB = $_POST["idEB"];
                                            date_default_timezone_set('Africa/Dakar');
                                            $dateT = new DateTime();
                                            $date = $dateT->format("Y-m-d H:i:s");

                                            if (empty($idBS)) {
                                                throw new Exception("ID du bon de sortie manquant.");
                                            }

                                            if (empty($idP) || !is_array($idP) || empty($quantite) || !is_array($quantite) || empty($unite) || !is_array($unite)) {
                                                throw new Exception("Données d'entrée invalides");
                                            }

                                            $produitsIncoherents = [];

                                            foreach ($idP as $i => $id) {
                                                // Récupérer le nom du produit et son stock actuel
                                                $queryProduit = "SELECT nomproduit, Stock_actuel FROM product WHERE idP = :idP";
                                                $stmtProduit = $gc->getDb()->prepare($queryProduit);
                                                $stmtProduit->execute([':idP' => $id]);
                                                $resultProduit = $stmtProduit->fetch(PDO::FETCH_ASSOC);
                                                $nomProduit = $resultProduit['nomproduit'] ?? 'Nom inconnu';
                                                $stockActuel = $resultProduit['Stock_actuel'] ?? 0;

                                                // Vérifier si le produit est déjà présent dans bon_sortie_produit
                                                $checkQuery = "SELECT quantite FROM bon_sortie_produit WHERE idP = :idP AND idBS = :idBS";
                                                $checkStmt = $gc->getDb()->prepare($checkQuery);
                                                $checkStmt->execute([':idP' => $id, ':idBS' => $idBS]);
                                                $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
                                                $qte_bs = $checkResult['quantite'] ?? 0;

                                                // Récupérer la quantité demandée dans l'expression de besoin
                                                $q = "SELECT quantite FROM expression_besoin_produit 
                                                    WHERE idP = :idP AND idEB = :idEB";
                                                $rqt = $gc->getDb()->prepare($q);
                                                $rqt->execute([':idP' => $id, ':idEB' => $idEB]);
                                                $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                                $qte_eb = $rep['quantite'] ?? 0;

                                                $reste_demande = $qte_eb - $qte_bs;
                                                $quantite_demandee = $quantite[$i];

                                                // Vérifications
                                                if ($quantite_demandee > $stockActuel) {
                                                    $produitsIncoherents[] = [
                                                        'nomProduit' => $nomProduit,
                                                        'quantiteSaisie' => $quantite_demandee,
                                                        'reste' => $stockActuel,
                                                        'message' => 'Stock insuffisant'
                                                    ];
                                                } else if ($quantite_demandee > $reste_demande && $qte_bs == 0) {
                                                    $produitsIncoherents[] = [
                                                        'nomProduit' => $nomProduit,
                                                        'quantiteSaisie' => $quantite_demandee,
                                                        'reste' => $reste_demande,
                                                        'message' => 'Quantité supérieure à la demande'
                                                    ];
                                                } else {
                                                    // Vérifier si le produit n'est pas déjà présent
                                                    if ($qte_bs > 0) {
                                                        continue; // Produit déjà présent, passer au suivant
                                                    } else {
                                                        // Insérer le produit dans bon_sortie_produit
                                                        $sql = "INSERT INTO bon_sortie_produit (idBS, idP, quantite, unite, dateadd) 
                                                            VALUES (:idBS, :idP, :quantite, :unite, :dateadd)";
                                                        $stmt = $gc->getDb()->prepare($sql);
                                                        $stmt->execute([
                                                            ':idBS' => $idBS,
                                                            ':idP' => $id,
                                                            ':quantite' => $quantite[$i],
                                                            ':unite' => $unite[$i],
                                                            ':dateadd' => $date
                                                        ]);
                                                    }
                                                }
                                            }

                                            if (!empty($produitsIncoherents)) {
                                                echo json_encode([
                                                    'success' => false, 
                                                    'message' => 'Incohérences détectées.', 
                                                    'produitsIncoherents' => $produitsIncoherents
                                                ]);
                                                exit;
                                            }

                                            // Mettre à jour l'état du bon de sortie
                                            $r = "UPDATE bon_sortie SET Etat_bon_sortie = 5 WHERE idBS = :idBS";
                                            $stmt = $gc->getDb()->prepare($r);
                                            $stmt->execute([':idBS' => $idBS]);

                                            if ($stmt) {
                                                echo json_encode(['success' => true, 'message' => 'Produits enregistrés avec succès.']);
                                            } else {
                                                echo json_encode(['success' => false, 'message' => 'Échec de la mise à jour.']);
                                            }
                                        }
                                    } catch (PDOException $e) {
                                        echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                                    } catch (Exception $e) {
                                        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                                    }
                                    break;
                                    case 77:
                                        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
                                            try {
                                                $idBon = valid_donnees($_POST['idBon']);
                                                $r = "SELECT * FROM bon_sortie_produit bsp 
                                                    JOIN product p ON p.idP = bsp.idP
                                                    WHERE idBS = :id";
                                                $requette = $gc->getDb()->prepare($r);
                                                $requette->bindParam(':id', $idBon, PDO::PARAM_INT);
                                                $requette->execute();
                                                $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                    
                                                echo json_encode(['success' => true, 'data' => $reponse]);
                                            } catch (Throwable $th) {
                                                echo json_encode(['success' => false, 'message' => 'Erreur : ' . $th->getMessage()]);
                                            }
                                        }
                                        break;
                                        
                                case 78:
                                    try {
                                        $input = json_decode(file_get_contents('php://input'), true);

                                        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['enregistrerTout'])) {
                                            $idP = $input['products'];
                                            $quantite = $input['quantity'];
                                            $unite = $input['unite'];
                                            $idBS = $input['idBS'] ?? $_SESSION["idBS"];
                                            $idEB = $input["idEB"];
                                            date_default_timezone_set('Africa/Dakar');
                                            $dateT = new DateTime();
                                            $date = $dateT->format("Y-m-d H:i:s");

                                            if (empty($idBS)) {
                                                throw new Exception("ID du bon de sortie manquant.");
                                            }   

                                            if (empty($idP) || !is_array($idP) || empty($quantite) || !is_array($quantite)) {
                                                throw new Exception("Données d'entrée invalides");
                                            }

                                            $produitsIncoherents = [];

                                            foreach ($idP as $i => $id) {
                                                // Récupérer le nom du produit et le stock actuel
                                                $queryProduit = "SELECT nomproduit, Stock_actuel FROM product WHERE idP = :idP";
                                                $stmtProduit = $gc->getDb()->prepare($queryProduit);
                                                $stmtProduit->execute([':idP' => $id]);
                                                $resultProduit = $stmtProduit->fetch(PDO::FETCH_ASSOC);
                                                $nomProduit = $resultProduit['nomproduit'] ?? 'Nom inconnu';
                                                $stockActuel = $resultProduit['Stock_actuel'] ?? 0;

                                                // Vérifier si le produit est déjà présent dans bon_sortie_produit
                                                $checkQuery = "SELECT quantite FROM bon_sortie_produit WHERE idP = :idP AND idBS = :idBS";
                                                $checkStmt = $gc->getDb()->prepare($checkQuery);
                                                $checkStmt->execute([':idP' => $id, ':idBS' => $idBS]);
                                                $checkResult = $checkStmt->fetch(PDO::FETCH_ASSOC);
                                                $qte_bs = $checkResult['quantite'] ?? 0;

                                                // Récupérer la quantité demandée dans l'expression de besoin
                                                $q = "SELECT quantite FROM expression_besoin_produit WHERE idP = :idP AND idEB = :idEB";
                                                $rqt = $gc->getDb()->prepare($q);
                                                $rqt->execute([':idP' => $id, ':idEB' => $idEB]);
                                                $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                                $qte_eb = $rep['quantite'] ?? 0;

                                                $reste_demande = $qte_eb - $qte_bs;

                                                // Vérifications
                                                if ($quantite[$i] > $stockActuel) {
                                                    $produitsIncoherents[] = [
                                                        'nomProduit' => $nomProduit,
                                                        'quantiteSaisie' => $quantite[$i],
                                                        'reste' => $stockActuel,
                                                        'message' => 'Stock insuffisant'
                                                    ];
                                                } else if ($quantite[$i] > $reste_demande && $qte_bs == 0) {
                                                    $produitsIncoherents[] = [
                                                        'nomProduit' => $nomProduit,
                                                        'quantiteSaisie' => $quantite[$i],
                                                        'reste' => $reste_demande,
                                                        'message' => 'Quantité supérieure à la demande'
                                                    ];
                                                } else {
                                                    // Vérifier si le produit n'est pas déjà présent
                                                    if ($qte_bs > 0) {
                                                        continue; // Produit déjà présent, passer au suivant
                                                    } else {
                                                        // Insérer le produit dans bon_sortie_produit
                                                        $sql = "INSERT INTO bon_sortie_produit (idBS, idP, quantite, unite, dateadd) 
                                                            VALUES (:idBS, :idP, :quantite, :unite, :dateadd)";
                                                        $stmt = $gc->getDb()->prepare($sql);
                                                        $stmt->execute([
                                                            ':idBS' => $idBS,
                                                            ':idP' => $id,
                                                            ':quantite' => $quantite[$i],
                                                            ':unite' => $unite[$i],
                                                            ':dateadd' => $date
                                                        ]);
                                                    }
                                                }
                                            }

                                            if (!empty($produitsIncoherents)) {
                                                echo json_encode([
                                                    'success' => false, 
                                                    'message' => 'Incohérences détectées.', 
                                                    'produitsIncoherents' => $produitsIncoherents
                                                ]);
                                                exit;
                                            }
                                            
                                            $r = "UPDATE bon_sortie SET Etat_bon_sortie = 5 WHERE idBS = :idBS";
                                            $stmt = $gc->getDb()->prepare($r);
                                            $stmt->execute([':idBS' => $idBS]);

                                            if ($stmt) {
                                                echo json_encode(['success' => true]);
                                            } else {
                                                echo json_encode(['success' => false, 'message' => 'Échec de la mise à jour.']);
                                            }
                                        }
                                    } catch (PDOException $e) {
                                        echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                                    }
                                    break;
                                
                                    case 79: 
                                        if (!isset($_POST['idBS'], $_POST['idP'], $_POST['quantity'], $_POST['unite'])) {
                                            echo json_encode(['success' => false, 'message' => 'Les données nécessaires ne sont pas fournies.']);
                                            exit;
                                        }
                                    
                                        $idBS = $_POST['idBS'];
                                        $idP = $_POST['idP'];
                                        $quantity = $_POST['quantity'];
                                        $unite = $_POST['unite'];
                                    
                                        try {
                                            // Récupérer la date d'ajout du produit
                                            $requette_date = "SELECT dateadd FROM bon_sortie_produit WHERE idP = :idP AND idBS = :idBS";
                                            $rqt = $gc->getDb()->prepare($requette_date);
                                            $rqt->execute([':idP' => $idP, ':idBS' => $idBS]);
                                            $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                            $date = $rep['dateadd'];
                                            
                                            // Récupérer la quantité demandée dans l'expression de besoin
                                            $q = "SELECT ebp.quantite 
                                                FROM expression_besoin_produit ebp 
                                                JOIN bon_sortie bs ON bs.expID = ebp.idEB 
                                                WHERE ebp.idP = :idP AND bs.idBS = :idBS";
                                            $rqt = $gc->getDb()->prepare($q);
                                            $rqt->execute([':idP' => $idP, ':idBS' => $idBS]);
                                            $rep = $rqt->fetch(PDO::FETCH_ASSOC);
                                            $qte_eb = $rep['quantite'] ?? 0;
                                    
                                            // Vérifier le stock disponible
                                            $stockQuery = "SELECT Stock_actuel FROM product WHERE idP = :idP";
                                            $stockStmt = $gc->getDb()->prepare($stockQuery);
                                            $stockStmt->execute([':idP' => $idP]);
                                            $stockActuel = $stockStmt->fetchColumn();
                                    
                                            if ($quantity > $stockActuel) {
                                                echo json_encode([
                                                    'success' => false, 
                                                    'message' => 'La quantité saisie dépasse le stock disponible ('. $stockActuel .')'
                                                ]);
                                                exit;
                                            }
                                    
                                            if ($quantity > $qte_eb) {
                                                echo json_encode([
                                                    'success' => false, 
                                                    'message' => 'La quantité saisie dépasse la quantité demandée ('. $qte_eb .')'
                                                ]);
                                                exit;
                                            } 
                                    
                                            // Mettre à jour le bon de sortie produit
                                            $sql = "UPDATE bon_sortie_produit 
                                                    SET quantite = :quantite, 
                                                        unite = :unite 
                                                    WHERE idBS = :idBS 
                                                    AND idP = :idP 
                                                    AND dateadd = :dateadd";
                                    
                                            $stmt = $gc->getDb()->prepare($sql);
                                            $stmt->execute([
                                                ':quantite' => $quantity,
                                                ':unite' => $unite,
                                                ':idBS' => $idBS,
                                                ':dateadd' => $date,
                                                ':idP' => $idP
                                            ]);
                                    
                                            echo json_encode(['success' => true]);
                                        } catch (PDOException $e) {
                                            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                                        }
                                        break;                                        
                                        case 80:
                                            $idBS = $_GET['idBS'];
                                            $idP = $_GET['idP'];
                                            $quantity = $_GET['quantity'];
                                            $unite = $_GET['unite'];
                                    
                                            try {
                                                // $gc->getDb()->beginTransaction();
                                    
                                                // Vérifier si le produit existe dans le bon de livraison
                                                $r = "SELECT 1 FROM bon_sortie_produit WHERE idBS = :idBS AND idP = :idP";
                                                $requette = $gc->getDb()->prepare($r);
                                                $requette->execute([':idBS' => $idBS, ':idP' => $idP]);
                                                $produitExiste = $requette->fetchColumn();
                                    
                                                // Supprimer (mettre à jour la quantité à 0) le produit du bon de livraison s'il existe
                                                if ($produitExiste) {
                                                    // Mettre à jour la quantité à 0 
                                                    $sql = "UPDATE bon_sortie_produit SET quantite = 0 WHERE idBS = :idBS AND idP = :idP";
                                                    $stmt = $gc->getDb()->prepare($sql);
                                                    $stmt->execute([
                                                        ':idBS' => $idBS,
                                                        ':idP' => $idP                                    
                                                    ]);

                                                    // Remettre la quantité supprimée dans le stock du produit
                                                    $stmt = $gc->getDb()->prepare("UPDATE product SET Stock_actuel = Stock_actuel - :quantity WHERE idP = :idP");
                                                    $stmt->bindParam(':quantity', $quantity);
                                                    $stmt->bindParam(':idP', $idP);
                                                    $stmt->execute();
                                    
                                                    // $gc->getDb()->commit();
                                    
                                                    echo json_encode(['success' => true]);
                                                } else {
                                                
                                                    echo json_encode(['success' => false, 'message' => 'Le produit n\'est pas présent dans le bon de livraison.']);
                                                }
                                    
                                            } catch (PDOException $e) {
                                                // $gc->getDb()->rollBack();
                                                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                                            }
                                            break;    
                                            case 81:
                                    

                                                try {
                                                    $r = "SELECT distinct * FROM bon_sortie bs
                                                        join status_commande sc on sc.id_status_cmd = bs.Etat_bon_sortie
                                                        WHERE bs.Etat_bon_sortie = 2
                                                        ORDER BY date_creation DESC";
                                                    $requette = $gc->getDb()->prepare($r);
                                                    $requette->execute();
                                                    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);
                                            
                                                    echo json_encode(['success' => true, 'data' => $reponse]);
                                                } catch (PDOException $e) {
                                                    echo json_encode(['success' => false, 'message' => "Erreur PDO : " . $e->getMessage()]);
                                                }
                                                break;                           
                                                default:
                                            
                                                    echo json_encode(['error' => 'Option inexistante']);
                                                break;
                           
                                                            
                                }
                                ?>