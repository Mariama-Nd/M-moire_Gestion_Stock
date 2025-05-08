
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
            'option': 81
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const bonsSortie = data.data;
            const tbody = document.querySelector('#sales-table tbody');
            tbody.innerHTML = ''; 

            data.data.forEach(bon => {
                const tr = document.createElement('tr');
                const actions = getActions(bon);
                tr.innerHTML = `
                    <td>${bon.prenom}</td>
                    <td>${bon.nom}</td>
                    <td>${bon.structure}</td>
                    <td>${bon.date_creation}</td>
                    <td>${bon.nom_status_cmd}</td>
                    <td>${actions}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            console.error('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
    });
}


function getActions(bon) {
    const { idBS, expID, Etat_bon_sortie, nbr_produits } = bon;
    let actions = '<div class="d-flex gap-2">';


        if (Etat_bon_sortie == 2) {
            // État validé
            actions += `
                <button onclick="location.href='Consulter_BS.php?idBon=${idBS}'" 
                        class="btn btn-secondary btn-custom">Consulter</button>
                <button onclick="newWindows(${idBS})" 
                        class="btn btn-light btn-custom"
                        style="background-color:rgb(97, 196, 229); color: white;">
                        Voir Bon</button>`;
        } 
    

  
    actions += `
        <button onclick="deleteBonSortie(${idBS})" 
                class="btn btn-danger btn-custom">Supprimer</button>`;

    actions += '</div>';
    return actions;
}

function creerBS() {
    location.href = "index.php";
}





function deleteBonSortie(idBon) {
    Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: "Voulez-vous vraiment supprimer ce bon de sortie ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('../../controlleur/controlleur.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    'option': 70,
                    'idBon': idBon
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        title: 'Supprimé!',
                        text: 'Le bon de sortie a été supprimé avec succès.',
                        icon: 'success',
                        timer: 1500
                    }).then(() => {
                        window.location.href = "historique_sortie.php";
                    });
                } else {
                    Swal.fire({
                        title: 'Erreur!',
                        text: data.message || 'Une erreur est survenue lors de la suppression.',
                        icon: 'error'
                    });
                }
            })
            .catch(error => {
                console.error('Erreur de connexion au serveur :', error);
                Swal.fire({
                    title: 'Erreur!',
                    text: 'Erreur de connexion au serveur.',
                    icon: 'error'
                });
            });
        }
    });
}
function newWindows(idBS) {
    window.open("FPDF.php?id=" + idBS, "blank");
}

function validation_Sortie(idBon) {
    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 69,
            'idBon': idBon
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Validation réussie");
        } else {
            alert(data.message);
        }
        window.location.href = "historique_sortie.php";
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
        alert('Erreur de connexion au serveur');
        window.location.href = "historique_sortie.php";
    }); 
}