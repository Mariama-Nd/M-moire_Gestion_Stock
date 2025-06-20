<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Liste des Achats</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css" rel="stylesheet">
    <style>
        body { background-color: #f4f6f9; }
        .container { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 0 10px #ccc; }
        h2 { color: #198754; }
    </style>
</head>
<body class="p-4">
<div class="container">
    <h2 class="mb-4">Achats générés</h2>

    <table id="tableAchats" class="table table-bordered table-hover">
        <thead class="table-success">
            <tr>
                <th>ID Achat</th>
                <th>Titre Expression</th>
                <th>Structure</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
<script src="js/achats.js"></script>
</body>
</html>