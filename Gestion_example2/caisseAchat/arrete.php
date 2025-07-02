<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Arrêté de caisse journalier</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <style>
    body {
      font-family: "Segoe UI", Tahoma, sans-serif;
      background-color: #f8f9fa;
      padding: 2rem;
    }

    h3.text-primary {
      font-size: 1.8rem;
    }

    .card {
      border-radius: 0.75rem;
    }

    .card-body h4 {
      font-size: 1.5rem;
    }

    .border-start {
      border-left: 5px solid;
    }

    .border-start.border-success {
      border-color: #198754 !important;
    }

    .border-start.border-warning {
      border-color: #ffc107 !important;
    }

    .border-start.border-danger {
      border-color: #dc3545 !important;
    }

    .table th, .table td {
      vertical-align: middle;
      font-size: 0.95rem;
    }

    .table th {
      background-color: #f1f1f1;
      font-weight: 600;
    }

    #btnExportPDF {
      font-size: 0.875rem;
      padding: 6px 12px;
      border-radius: 0.3rem;
    }

    img.img-thumbnail {
      max-height: 45px;
      border: 1px solid #ccc;
      border-radius: 0.3rem;
      transition: transform 0.2s ease-in-out;
    }

    img.img-thumbnail:hover {
      transform: scale(1.05);
    }

    .card-header h6 {
      font-size: 1rem;
    }
  </style>
</head>
<body>
<div class="container">
  <!-- BOUTON RETOUR -->
  <a href="caisse.php" class="btn btn-outline-secondary fw-semibold rounded-pill shadow-sm mb-3">
    <i class="bi bi-arrow-left-circle me-1"></i> Retour à la caisse
  </a>

  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="text-primary fw-bold"><i class="bi bi-cash-stack me-2"></i>Arrêté de caisse journalier</h3>
    <div class="d-flex gap-2">
      <input type="date" id="dateArrete" class="form-control" value="<?= date('Y-m-d') ?>">

      <select id="modePaiement" class="form-select">
        <option value="global" selected>— Tous modes confondus —</option>
        <option value="espece">Espèces</option>
        <option value="wave">Wave</option>
        <option value="orange_money">Orange Money</option>
        <option value="cheque">Chèque</option>
        <option value="virement">Virement</option>
      </select>

      <button class="btn btn-outline-primary" id="btnExportPDF">
        📄 Exporter en PDF
      </button>
    </div>
  </div>

  <div id="infosCaisse" class="row mb-4 d-none">
    <div class="col-md-4">
      <div class="card border-start border-success shadow h-100">
        <div class="card-body">
          <h6 class="text-muted">Montant alloué</h6>
          <h4 class="text-success fw-bold" id="montantAlloue">0 F</h4>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card border-start border-warning shadow h-100">
        <div class="card-body">
          <h6 class="text-muted">Montant utilisé</h6>
          <h4 class="text-warning fw-bold" id="montantUtilise">0 F</h4>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card border-start border-danger shadow h-100">
        <div class="card-body">
          <h6 class="text-muted">Solde restant</h6>
          <h4 class="text-danger fw-bold" id="soldeRestant">0 F</h4>
        </div>
      </div>
    </div>
  </div>

  <div id="tablePaiements" class="card shadow d-none">
    <div class="card-header bg-light">
      <h6 class="mb-0 fw-bold text-primary">📑 Paiements enregistrés</h6>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Ordre</th>
              <th>Commande</th>
              <th>Montant</th>
              <th>Banque</th>
              <th>Date</th>
              <th>Reçu</th>
            </tr>
          </thead>
          <tbody id="tbodyPaiements"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="../../js/arrete.js"></script>
</body>
</html>