<?php
require('../../fpdf/fpdf.php');
require '../../../vendor/autoload.php'; 

use setasign\Fpdi\Fpdi;

try {
    $id = $_GET["id"];
    include '../../Categorie/Categorie/config/db.php';

    $db = new DB();
    $connexion = $db->connect();

    if (!$connexion) {
        throw new Exception("Connexion à la base de données échouée.");
    }


    $pdf = new FPDI();
    $pdf->AddPage();

    $pdfPath = '../../includes/bonSortie.pdf';
    if (!file_exists($pdfPath)) {
        throw new Exception("Le fichier PDF modèle est introuvable.");
    }
    $pdf->setSourceFile($pdfPath);
    $tplIdx = $pdf->importPage(1);
    $pdf->useTemplate($tplIdx, 0, 0, 210);

   

    $r = "SELECT * FROM bon_sortie,expression_besoin WHERE idBS = :id";
    $requette = $connexion->prepare($r);
    $requette->execute(['id' => $id]);
    $reponse = $requette->fetch(PDO::FETCH_ASSOC);

    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetXY(140, 50); 
    $pdf->Cell(25, 10, 'Date:', 0, 0, 'R');
    $pdf->SetFont('Arial', '', 12);
    $date = new DateTime($reponse["date_creation"]);
$formattedDate = $date->format('d F Y');
    $pdf->Cell(25, 10,iconv('UTF-8', 'ISO-8859-1', $formattedDate), 0, 1, 'L');
$pdf->SetFont('Arial', 'B', 12);

   
   // Positionner le tableau à gauche
   $pdf->SetXY(20, 70); 
   $leftMargin = (210 - 180) / 2; 

$pdf->SetX($leftMargin); 
   
   $pdf->SetFont('Arial', '', 12);
   $pdf->SetXY($pdf->getX(), $pdf->getY());

$pdf->SetX($leftMargin); 
$date = new DateTime($reponse["date_creation"]);
$formattedDate = $date->format('d F Y');

$pdf->SetFont('Arial', 'B', 12);

   
   $pdf->Cell(180,10,iconv('UTF-8', 'ISO-8859-1', "Direction\Service\Responsabilité"),0,0,'L');
   $pdf->Ln(40);
   $pdf->SetXY($leftMargin, 100); 
   $pdf->SetFont('Arial', 'B', 12);
   $pdf->Cell(90, 15, iconv('UTF-8', 'ISO-8859-1', "Service Demandeur"), 0, 1, 'L');
   
  

$pdf->SetX($leftMargin);
$pdf->Cell(120, 15, iconv('UTF-8', 'ISO-8859-1', "Direction: "), 1, 0, 'L'); 
$pdf->Cell(60, 15, "", "LTR", 1, 'L'); 


$pdf->SetX($leftMargin);
$pdf->Cell(120, 15, iconv('UTF-8', 'ISO-8859-1', "Service: "), 1, 0, 'L');
$pdf->Cell(60, 15, "", "LBR", 1, 'L');
   
   
$pdf->SetFont('Arial', 'B', 11);


$pdf->SetFillColor(191, 191, 191); 
$pdf->SetXY( 100, 170);
$pdf->SetX($leftMargin); 
$pdf->Cell(70, 20, iconv('UTF-8', 'ISO-8859-1', 'Désignation'), 1, 0, 'C', true);
$pdf->Cell(40, 20, iconv('UTF-8', 'ISO-8859-1', 'Quantités demandées'), 1, 0, 'C', true);
$pdf->Cell(40, 20, iconv('UTF-8', 'ISO-8859-1', 'Quantités servies'), 1, 0, 'C', true);
$pdf->Cell(30, 20, iconv('UTF-8', 'ISO-8859-1', 'Visa SD'), 1, 1, 'C', true);


$r = "SELECT 
    p.nomproduit, 
    bsp.quantite as qs,
    bsp.unite,
    ebp.quantite as qd 
FROM bon_sortie_produit bsp
INNER JOIN product p ON bsp.idP = p.idP
INNER JOIN bon_sortie bs ON bsp.idBS = bs.idBS
INNER JOIN expression_besoin_produit ebp ON ebp.idP = p.idP AND ebp.idEB = bs.expID
WHERE bsp.idBS = :id";
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
    

    $pdf->Cell(70, 15, iconv('UTF-8', 'ISO-8859-1', $ventes["nomproduit"]), 1, 0, 'C', true);
    $pdf->Cell(40, 15, iconv('UTF-8', 'ISO-8859-1', $ventes["qd"]), 1, 0, 'C', true);
    $pdf->Cell(40, 15, iconv('UTF-8', 'ISO-8859-1', $ventes["qs"]), 1, 0, 'C', true);

    $startX = $pdf->GetX();
    $startY = $pdf->GetY();
    
  
    $pdf->Cell(30, 25, '', 'LTR', 2, 'C', true);
    
   
    $pdf->SetXY($startX, $startY + 25);
    $pdf->MultiCell(30, 5, iconv('UTF-8', 'ISO-8859-1', ' responsable'), 'LR', 'C', true);
    
 
    $pdf->SetXY($startX, $startY + 30);
    $pdf->Cell(30, 25, '', 'LR', 2, 'C', true);
    
  
    $pdf->SetXY($startX, $startY + 55);
    $pdf->MultiCell(30, 5, iconv('UTF-8', 'ISO-8859-1', 'bénéficiaire'), 'LR', 'C', true);
    

    $pdf->SetXY($startX, $startY + 60);
    $pdf->Cell(30, 15, '', 'LRB', 1, 'C', true);
    
    
    $pdf->SetXY($leftMargin, $startY + 75);
    
    

  
}


$pdf->Rect($leftMargin, 170, 180, $pdf->GetY() - 170);


   
    $pdf->Output('I', 'Bon_de_livraison.pdf');

} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
?>
