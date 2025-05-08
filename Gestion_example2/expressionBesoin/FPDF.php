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

    $pdfPath = '../../includes/expressionBesoin.pdf';
    if (!file_exists($pdfPath)) {
        throw new Exception("Le fichier PDF modèle est introuvable.");
    }
    
    $pdf->setSourceFile($pdfPath);
    $tplIdx = $pdf->importPage(1);
    $pdf->useTemplate($tplIdx, 0, 0, 210);
 
    $demandeur="SELECT * FROM expression_besoin WHERE idEB = :id";
    $requette = $connexion->prepare($demandeur);
    $requette->execute(['id' => $id]);
    $reponse = $requette->fetch(PDO::FETCH_ASSOC);
    $pdf->SetFont('Arial', '', 12);
    
    // Date à droite
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetXY(140, 50); 
    $pdf->Cell(25, 10, 'Date:', 0, 0, 'R');
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(25, 10, date('d/m/Y', strtotime($reponse['date_creation'])), 0, 1, 'L');
    
    $pdf->SetXY(18, 75);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(40, 10, iconv('UTF-8', 'ISO-8859-1', 'Nom et Prénom'), 0, 0);
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(80, 10, iconv('UTF-8', 'ISO-8859-1', ": ".$reponse['nom'] . ' ' . $reponse['prenom']), 0, 1);
    
    $pdf->SetXY(18, 85);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(40, 10, 'Matricule', 0, 0);
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(80, 10, ": ".$reponse['user'], 0, 1);
    
    $pdf->SetXY(18, 95);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(40, 10, 'Structure', 0, 0);
    $pdf->SetFont('Arial', '', 12);
    $pdf->Cell(80, 10, iconv('UTF-8', 'ISO-8859-1', ": ".$reponse['structure']), 0, 1);

    $pageWidth = 210;
    $tableWidth = 180; 
    $leftMargin = ($pageWidth - $tableWidth) / 2;
    
    $pdf->SetXY($leftMargin, 130);
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->Cell(20, 20, iconv('UTF-8', 'ISO-8859-1', 'N°'), 1, 0, 'C');
    $pdf->Cell(70, 20, iconv('UTF-8', 'ISO-8859-1', 'Désignation'), 1, 0, 'C');
    $pdf->Cell(50, 20, iconv('UTF-8', 'ISO-8859-1', 'Quantités demandée'), 1, 0, 'C');
    $pdf->Cell(40, 20, iconv('UTF-8', 'ISO-8859-1', 'Unité'), 1, 1, 'C');

   
    $r = "SELECT p.nomproduit, ebp.quantite, ebp.unite FROM expression_besoin_produit ebp 
          INNER JOIN product p ON ebp.idP = p.idP 
          WHERE idEB = :id";
    $requette = $connexion->prepare($r);
    $requette->execute(['id' => $id]);
    $reponse = $requette->fetchAll(PDO::FETCH_ASSOC);

    if (empty($reponse)) {
        throw new Exception("Aucun produit trouvé pour cet ID.");
    }

    $pdf->SetFont('Times', '', 12);
    $numero = 1;
    foreach ($reponse as $ventes) {
        $pdf->SetX($leftMargin);
        $pdf->Cell(20, 20, $numero, 1, 0, 'C');
        $pdf->Cell(70, 20, iconv('UTF-8', 'ISO-8859-1', $ventes["nomproduit"]), 1, 0, 'C');
        $pdf->Cell(50, 20, iconv('UTF-8', 'ISO-8859-1', $ventes["quantite"]), 1, 0, 'C');
        $pdf->Cell(40, 20, iconv('UTF-8', 'ISO-8859-1', $ventes["unite"]), 1, 1, 'C');
        $numero++;
    }

    $pdf->Output('I', 'Expression_besoin.pdf');

} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
}
?>