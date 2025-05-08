<?php
require('../../fpdf/fpdf.php');
require '../../../vendor/autoload.php'; 

use setasign\Fpdi\Fpdi;

try {
    $id = $_GET["idBL"];
    include '../../Categorie/Categorie/config/db.php';

    $db = new DB();
    $connexion = $db->connect();

    if (!$connexion) {
        throw new Exception("Connexion à la base de données échouée.");
    }

    $pdf = new FPDI();
    $pdf->AddPage();

    $pdfPath = '../../includes/bonLivraison.pdf';
    if (!file_exists($pdfPath)) {
        throw new Exception("Le fichier PDF modèle est introuvable.");
    }
    $pdf->setSourceFile($pdfPath);
    $tplIdx = $pdf->importPage(1);
    $pdf->useTemplate($tplIdx, 0, 0, 210);

   

    $r = "SELECT * FROM bon_livraison WHERE idBL = :id";
    $requette = $connexion->prepare($r);
    $requette->execute(['id' => $id]);
    $reponse = $requette->fetch(PDO::FETCH_ASSOC);

 
$pdf->SetFont('Arial', 'B', 12);

   
   $pdf->SetXY(20, 70); 
   $leftMargin = (210 - 180) / 2; 

$pdf->SetX($leftMargin); 
 
   $pdf->Cell(60, 10, iconv('UTF-8', 'ISO-8859-1', 'Date'), 1, 0, 'C'); 
   $pdf->Cell(40, 10, iconv('UTF-8', 'ISO-8859-1', 'Num Bon'), 1, 0, 'C'); 
   $pdf->Cell(40, 10, iconv('UTF-8', 'ISO-8859-1', 'Num Bordereau'), 1, 1, 'C');
   
   $pdf->SetFont('Arial', '', 12);
   $pdf->SetXY($pdf->getX(), $pdf->getY());
$pdf->SetX($leftMargin); 
$date = new DateTime($reponse["date"]);
$formattedDate = $date->format('d F Y');

$pdf->Cell(60, 10, iconv('UTF-8', 'ISO-8859-1', $formattedDate), 1, 0, 'C'); // Valeur Date
   $pdf->Cell(40, 10, iconv('UTF-8', 'ISO-8859-1', $reponse["idBL"]), 1, 0, 'C'); // Valeur Numéro Bon
   $pdf->Cell(40, 10, iconv('UTF-8', 'ISO-8859-1', $reponse["numBL"]), 1, 1, 'C'); // Valeur Numéro Bordereau
   
   $pdf->Ln(30);
   
$pdf->SetFont('Arial', 'B', 12);

$pdf->SetFillColor(191, 191, 191);
$pdf->SetX( 100);
$pdf->SetX($leftMargin); 
$pdf->Cell(60, 10, iconv('UTF-8', 'ISO-8859-1', 'Unité'), 1, 0, 'C', true); 
$pdf->Cell(30, 10, iconv('UTF-8', 'ISO-8859-1', 'Quantitée'), 1, 0, 'C', true);
$pdf->Cell(90, 10, iconv('UTF-8', 'ISO-8859-1', 'Désignation'), 1, 1, 'C', true); 

$r = "SELECT p.nomproduit, blp.quantite ,blp.unite FROM bon_livraison_produit blp, product p WHERE blp.idP = p.idP AND idBL = :id";
$requette = $connexion->prepare($r);
$requette->execute(['id' => $id]);
$reponse = $requette->fetchAll(PDO::FETCH_ASSOC);

if (empty($reponse)) {
    throw new Exception("Aucun produit trouvé pour cet ID.");
}

$pdf->SetFont('Times', '', 12);
$pdf->SetFillColor(255, 255, 255); 
foreach ($reponse as $ventes) {
    
 
    $pdf->SetX($leftMargin); 
    $pdf->Cell(60, 10, iconv('UTF-8', 'ISO-8859-1', $ventes["unite"]), 1, 0, 'C', true);
    $pdf->Cell(30, 10, iconv('UTF-8', 'ISO-8859-1', $ventes["quantite"]), 1, 0, 'C', true);
    $pdf->Cell(90, 10, iconv('UTF-8', 'ISO-8859-1', $ventes["nomproduit"]), 1, 1, 'C', true);
}



    $pdf->Output('I', 'Bon_de_livraison.pdf');

} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
?>
