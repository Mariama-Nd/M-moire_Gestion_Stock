
document.addEventListener('DOMContentLoaded', function() {
    fetchBonSortie();
});

function fetchBonSortie() {
    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 62
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const expressionBesoin = data.data;
            const tbody = document.querySelector('#sales-table tbody');
            tbody.innerHTML = ''; 

                      expressionBesoin.forEach(bon => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bon.prenom}</td>
                    <td>${bon.nom}</td>
                    <td>${bon.structure}</td>
                    <td>${bon.date_creation}</td>
                    <td>${bon.nom_status_cmd}</td>
                    <td id="action-${bon.idEB}"></td>
                    <td id="validation-${bon.idEB}"></td>
                    <td id="delete-${bon.idEB}"></td>
                `;
                tbody.appendChild(row);
            
                fetchActions(bon.idEB, bon.Etat_expression_besoin);
            });
        } else {
            console.error('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
    });
}
function fetchActions(idBon, etatExpressionBesoin) {
    console.log('fetchActions appelé avec:', idBon, etatExpressionBesoin); // Log pour déboguer

    if (!idBon) {
        console.error('ID bon invalide');
        return;
    }

    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 37,
            'idBon': idBon
        })
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.success) {
            const actions = data.data;
            const actionCell = document.getElementById(`action-${idBon}`);
            const validationCell = document.getElementById(`validation-${idBon}`);
            const deleteCell = document.getElementById(`delete-${idBon}`);

            if (!actionCell || !validationCell || !deleteCell) {
                console.error('Cellules non trouvées pour idBon:', idBon);
                return;
            }

            actionCell.innerHTML = getActionButtons(idBon, etatExpressionBesoin);
            deleteCell.innerHTML = getDeleteButton(idBon);
        }
    })
    .catch(error => console.error('Erreur fetchActions:', error));
}
function creerEB() {
    location.href = "index.php";
}

function getActionButtons(idBon, etatExpressionBesoin) {
    let buttons = '<div class="d-flex gap-2">';
    
    if (etatExpressionBesoin == 2) {
        buttons += `
            <button onclick="newWindows(${idBon})" class="btn btn-custom" style="background-color:rgb(97, 196, 229); color: white;">
                Voir Bon
            </button>`;
    }
    
    buttons += `
        <button onclick="location.href='Consulter_EB.php?idBon=${idBon}'" class="btn btn-secondary btn-custom">
            Consulter BS
        </button>`;

    buttons += '</div>';
    return buttons;
}
function getDeleteButton(idBon) {
    return `<button onclick="deleteEB(${idBon})" class="btn btn-danger btn-custom">Supprimer</button>`;
}

function deleteEB(idBon) {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Voulez-vous vraiment supprimer cette expression de besoin ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'option': 58,
                    'idBon': idBon
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Supprimé !',
                        text: 'L\'expression de besoin a été supprimée avec succès.',
                        icon: 'success',
                        timer: 1500
                    }).then(() => {
                        window.location.href = "historique_EB.php";
                    });
                } else {
                    Swal.fire({
                        title: 'Erreur',
                        text: data.message || 'Une erreur est survenue lors de la suppression',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Erreur de connexion au serveur :', error);
                Swal.fire({
                    title: 'Erreur',
                    text: 'Erreur de connexion au serveur',
                    icon: 'error'
                });
            });
        }
    });
}

function newWindows(id_bon_cmd) {
    window.open("FPDF.php?id=" + id_bon_cmd, "blank");
}

