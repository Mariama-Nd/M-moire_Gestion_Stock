<?php
require ('fpdf/fpdf.php');
require '../vendor/autoload.php';

use setasign\Fpdi\Fpdi;

try {
    if(!isset($_GET["id"]) || !isset($_GET["fournisseurId"])){
        throw new Exception("Paramètres manquants.");
    }
    $id =$_GET["id"];
    $fournisseurId =$_GET['fournisseurId'];
  
    include 'Categorie/Categorie/config/db.php';
    $connexion = new DB();
    $db = $connexion->connect();

    if (!$db) {
        throw new Exception("Connexion à la base de données échouée.");
    }

    $pdf = new Fpdi();
    $pdf->AddPage();

    $pageCount = $pdf->setSourceFile('includes/bonCommande.pdf');
    $templateId = $pdf->importPage(1);
    $pdf->useTemplate($templateId, 0, 0, 210);


    date_default_timezone_set('Africa/Dakar');
    $date = date("Y-m-d H:i:s");

    $pdf->SetFont('Arial', '', 12);
    $pdf->SetTextColor(0, 0, 0);

    
    
    $pdf->Ln(10); 

    
    $r = "SELECT * FROM bon_commande WHERE id_BC = :id";
    $requette = $db->prepare($r);
    $requette->execute(['id' => $id]);
    $reponse = $requette->fetch(PDO::FETCH_ASSOC);

    if (!$reponse) {
        throw new Exception("Commande non trouvée.");
    }

   
    $rFournisseur = "SELECT * FROM fournisseur WHERE idF = :fournisseurId ";
    $requetteFournisseur = $db->prepare($rFournisseur);
    $requetteFournisseur->execute(['fournisseurId' => $fournisseurId]);

    $fournisseur = $requetteFournisseur->fetch(PDO::FETCH_ASSOC);

    if (!$fournisseur) {
        throw new Exception("Fournisseur non trouvé.");
    }
 
    
  
    
    $pdf->ln(55 );
    
    
    $pdf->SetFont('Arial', '', 14);
    $xPos = 122; 
    
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Prénom: '.$fournisseur['prenomF']), 0, 'L');
    
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Nom: '.$fournisseur['nomF']), 0, 'L');
    
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetXY(9, $pdf->GetY()); // Positionner "Bon Commande N°" à gauche
    $pdf->Cell(80,4, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Bon Commande N°: ' . $reponse['id_BC']), 0, 0, 'L');

    $pdf->SetFont('Arial', '', 14);
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Entreprise: '.$fournisseur['entreprise']), 0, 'L');
    

    
    $pdf->SetXY($xPos, $pdf->GetY()); 
    $pdf->Cell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Adresse: '.$fournisseur['adresseF']), 0, 1, 'L');
    
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Ville: '.$fournisseur['ville']), 0, 'L');
    
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Téléphone: '.$fournisseur['telF']), 0, 'L');
    
    $pdf->SetX($xPos); 
    $pdf->MultiCell(80,8, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Email: '.$fournisseur['emailF']), 0, 'L');
    
 
    $pdf->Ln(10);

    $pdf->SetFont('Arial', '', 12);
 
    $pdf->Ln(10);


 
$leftMargin = (210 - 180) / 2; 

$pdf->SetX($leftMargin); 
$pdf->SetFillColor(220);

$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Date de la commande'), 1, 0, 'C','true');
$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Receveur'), 1, 0, 'C','true');
$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Modalité de paiement'), 1, 0, 'C','true');
$pdf->Cell(30, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Réglement'), 1, 1, 'C','true');

$pdf->SetX($leftMargin); 

$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $reponse['date']), 1, 0, 'C');
$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $fournisseur['nomF']), 1, 0, 'C');
$pdf->Cell(50, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $reponse['modalitePaiement']), 1, 0, 'C');
$pdf->Cell(30, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $reponse['modeReglement']), 1, 1, 'C');



    
    $r = "SELECT p.nomproduit, bcp.quantite, bcp.unite
          FROM bon_commande_produit bcp 
          JOIN product p ON bcp.idP = p.idP 
          WHERE idBC = :id";
    $requette = $db->prepare($r);
    $requette->execute(['id' => $id]);
    $produits = $requette->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($produits)) {
        throw new Exception("Aucun produit trouvé pour cette commande.");
    }

$pdf->Ln(10);


$leftMargin = (210 - 180) / 2; 
$colWidth = 40; 
$colNom=100;
$pdf->SetX($leftMargin);
$pdf->SetFillColor(220);
$pdf->Cell($colWidth, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Quantité'), 1, 0, 'C','true');
$pdf->Cell($colWidth, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Unité'), 1, 0, 'C','true');
$pdf->Cell($colNom, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Nom du produit'), 1, 1, 'C','true');




foreach ($produits as $prod) {
    if ($pdf->GetY() > 250) { 
        $pdf->AddPage(); 
          
          $templateId = $pdf->importPage(1);
          $pdf->useTemplate($templateId, 0, 0, 210);
          $pdf->SetY(80);
    }
    $pdf->SetX($leftMargin);
    $pdf->Cell($colWidth, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $prod['quantite']), 1, 0, 'C');
    $pdf->Cell($colWidth, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $prod['unite']), 1, 0, 'C');
    $pdf->Cell($colNom, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', $prod['nomproduit']), 1, 1, 'C');
  
}
    $pdf->Cell(0, 10, iconv('UTF-8', 'ISO-8859-1//TRANSLIT', 'Date: ' . $date), 0, 0, 'R');


   
    $pdf->Output('I', 'Bon_de_commande.pdf');
    echo json_encode(['success' => true, 'message' => 'Bon généré avec succès']);
} catch (Exception $e) {
  
    echo json_encode(['success' => false, 'message' => 'Erreur : ' . $e->getMessage()]);
}
?>
