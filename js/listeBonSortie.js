// script.js mis à jour pour filtre + recherche + pagination depuis le serveur

let currentPage = 1;
const rowsPerPage = 5;

// Écouteur d'événement

document.addEventListener('DOMContentLoaded', () => {
    setupFilters();
    fetchBonSortie();
});

function setupFilters() {
    document.getElementById('searchInput').addEventListener('input', () => {
        currentPage = 1;
        fetchBonSortie();
    });

    document.getElementById('filterStatus').addEventListener('change', () => {
        currentPage = 1;
        fetchBonSortie();
    });
}

function fetchBonSortie() {
    const search = document.getElementById('searchInput').value.trim();
    const etat = document.getElementById('filterStatus').value;

    const formData = new URLSearchParams({
        option: 68,
        page: currentPage,
        limit: rowsPerPage,
        search,
        etat
    });

    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            renderTable(data.data);
            setupPagination(data.total || 0);
        } else {
            console.error('Erreur serveur :', data.message);
        }
    })
    .catch(err => console.error('Erreur fetch :', err));
}

function renderTable(data) {
    const tbody = document.querySelector('#sales-table tbody');
    tbody.innerHTML = '';

    data.forEach(bon => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${bon.prenom}</td>
            <td>${bon.nom}</td>
            <td>${bon.structure}</td>
            <td>${bon.date_creation}</td>
            <td>${bon.nom_status_cmd}</td>
            <td>${getActions(bon)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function setupPagination(totalItems) {
    const pageCount = Math.ceil(totalItems / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            fetchBonSortie();
        });
        pagination.appendChild(li);
    }
}

function getActions(bon) {
    const { idBS, expID, Etat_bon_sortie, nbr_produits } = bon;
    let html = `<div class="btn-group" role="group">`;

    if (Etat_bon_sortie == 1 || nbr_produits <= 0) {
        html += `<button onclick="location.href='add_product_to_bs.php?idBon=${idBS}&expID=${expID}'" class="btn btn-primary btn-sm">Editer</button>`;
    } else if (Etat_bon_sortie == 2) {
        html += `
            <button onclick="location.href='Consulter_BS.php?idBon=${idBS}'" class="btn btn-secondary btn-sm">Consulter</button>
            <button onclick="newWindows(${idBS})" class="btn btn-info btn-sm">Voir</button>`;
    } else if (Etat_bon_sortie == 5) {
        html += `
            <button onclick="validation_Sortie(${idBS})" class="btn btn-success btn-sm">Valider</button>
            <button onclick="location.href='poursuivre_sortie.php?idBon=${idBS}&expID=${expID}'" class="btn btn-warning btn-sm">Poursuivre</button>`;
    } else {
        html += `<button onclick="validation_Sortie(${idBS})" class="btn btn-success btn-sm">Valider</button>`;
    }

    html += `<button onclick="deleteBonSortie(${idBS})" class="btn btn-danger btn-sm">Supprimer</button>`;
    html += `</div>`;
    return html;
}

function creerBS() {
    location.href = "index.php";
}

function newWindows(idBS) {
    window.open("FPDF.php?id=" + idBS, "_blank");
}

function validation_Sortie(idBon) {
    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'option': 69, 'idBon': idBon })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire('Succès', 'Validation effectuée', 'success')
                .then(() => fetchBonSortie());
        } else {
            Swal.fire('Erreur', data.message, 'error');
        }
    });
}

function deleteBonSortie(idBon) {
    Swal.fire({
        title: 'Supprimer ?',
        text: 'Cette action est irréversible.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler'
    }).then(result => {
        if (result.isConfirmed) {
            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'option': 70, 'idBon': idBon })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    Swal.fire('Supprimé!', 'Le bon a été supprimé.', 'success')
                        .then(() => fetchBonSortie());
                } else {
                    Swal.fire('Erreur!', data.message, 'error');
                }
            });
        }
    });
}