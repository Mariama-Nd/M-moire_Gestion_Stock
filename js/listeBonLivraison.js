document.addEventListener('DOMContentLoaded', function () {
    fetch('../../controlleur/controlleur.php?option=20')
        .then(response => response.json())
        .then(data => {
            if (data.status === "error") {
                console.error('Erreur lors de la récupération des livraisons :', data.message);
            } else {
                const tbody = document.querySelector('#sales-table tbody');
                data.forEach(livraison => {
                    const tr = document.createElement('tr');
                    const actions = getActions(livraison);
                    tr.innerHTML = `
                        <td>${livraison.nomBL}</td>
                        <td></td>
                        <td>${livraison.date}</td>
                        <td>${livraison.nomBC}</td>
                        <td>${livraison.nom_status_cmd}</td>
                        <td>${actions}</td>
                    `;
                    tbody.appendChild(tr);
                });
                $('#sales-table').DataTable({
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/fr-FR.json'
                    },
                    paging: true,
                    pageLength: 5,
                    lengthChange: false,
                    ordering: true,
                    autoWidth: false
                });
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des livraisons :', error));
});

function supprimerBL(idBL) {
    // Demande de confirmation avant de supprimer
    Swal.fire({
        title: 'Êtes-vous sûr de vouloir supprimer ce bon de livraison ?',
        text: "Cette action est irréversible.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, supprimer!',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            // Si l'utilisateur confirme, on lance la requête AJAX pour supprimer
            $.ajax({
                type: 'post',
                url: '../../controlleur/controlleur.php',
                data: { option: 53, idBL: idBL },
                success: function (response) {
                    const data = JSON.parse(response);
                    if (data.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Bon de livraison supprimé avec succès',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: data.message,
                        });
                    }
                },
                error: function (resultat, statut, erreur) {
                    console.error('Erreur AJAX:', erreur);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de la suppression du bon de livraison',
                    });
                }
            });
        } else {
            // Si l'utilisateur annule, on affiche un message d'annulation
            Swal.fire(
                'Annulé',
                'Le bon de livraison n\'a pas été supprimé.',
                'info'
            );
        }
    });
}


function getActions(livraison) {
    const { idBL, id_bc: idBC, nomBL, Etat_Livraison, nbr_produits } = livraison;
    let actions = '';

    if (nbr_produits <= 0) {
        actions += `<button onclick="location.href='approvisionner.php?idBL=${idBL}&idBC=${idBC}&nomBL=${nomBL}'" class="btn btn-primary btn-custom">Approvisionner</button>`;
        actions += `<button name="supprimer" onclick="supprimerBL(${idBL})" class="btn btn-danger btn-custom">Supprimer</button>`;
    } else {
        if (Etat_Livraison != 3 && Etat_Livraison != 4) {
            actions += `<button name="terminer" onclick="validerBL(${idBL})" class="btn btn-success btn-custom">Valider</button>`;
            actions += `<button name="supprimer" onclick="supprimerBL(${idBL})" class="btn btn-danger btn-custom">Supprimer</button>`;
        }
        if (Etat_Livraison == 3) {
            actions += `<button onclick="window.open('voir.php?idBL=${idBL}&nomBL=${nomBL}', '_blank')" class="btn btn-light btn-custom" style=" background-color:rgb(111, 189, 215); ">Voir Bon</button>`;

            actions += `<button onclick="location.href='consulter_bl.php?idBL=${idBL}&idBC=${idBC}&nomBL=${nomBL}'" class="btn btn-secondary btn-custom">Aperçu </button>`;
            actions += `<button name="supprimer" onclick="supprimerBL(${idBL})" class="btn btn-danger btn-custom">Supprimer</button>`;
        }
        if (Etat_Livraison == 5) {
            actions += `<button onclick="location.href='poursuivre.php?idBL=${idBL}&idBC=${idBC}&nomBL=${nomBL}'" class="btn btn-warning btn-custom">Poursuivre</button>`;
        }
    }

    return actions;
}

function openModalButton() {
    const modal = document.getElementById("productModal");
    modal.classList.remove("d-none");
    modal.classList.add("d-block");

    fetch('../../controlleur/controlleur.php?option=21')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('product-name');
            select.innerHTML = '<option value="" selected>Sélectionnez un Bon de Commande</option>';
            data.forEach(bc => {
                const option = document.createElement('option');
                option.value = bc.id_BC;
                option.textContent = bc.nomBC;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des bons de commande :', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la récupération des bons de commande.',
            }).then(() => {
                openModalButton();
            });
        });
}
const closeButton = document.getElementsByClassName("close")[0];
closeButton.onclick = function () {
    const modal = document.getElementById("productModal");
    modal.classList.remove("d-block");
    modal.classList.add("d-none");
}

window.onclick = function (event) {
    const modal = document.getElementById("productModal");
    if (event.target == modal) {
        modal.classList.remove("d-block");
        modal.classList.add("d-none");
    }
}

function validerBL(idBL) {
    Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Voulez-vous vraiment valider ce bon de livraison?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, valider!',
        cancelButtonText: 'Annuler'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`../../controlleur/controlleur.php?option=29&idBL=${idBL}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire(
                        'Validé!',
                        data.message,
                        'success'
                    ).then(() => {
                        window.location.href = "Liste_BL.php";
                    });
                } else {
                    Swal.fire(
                        'Erreur!',
                        "Erreur : " + data.message,
                        'error'
                    );
                }
            })
            .catch(error => {
                console.error('Erreur lors de la validation du bon de livraison :', error);
                Swal.fire(
                    'Erreur!',
                    "Erreur de connexion au serveur.",
                    'error'
                );
            });
        }
    });
}




document.getElementById('productForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    formData.append('option', 22);

    fetch('../../controlleur/controlleur.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: data.message,
            }).then(() => {
                location.href = "Liste_BL.php";
            });
        } else {
            document.getElementById('divAlert').classList.remove('d-none');
            document.getElementById('labelAlert').textContent = data.message;
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: data.message,
            }).then(() => {
                openModalButton();
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur de connexion au serveur.',
        });
    });
});
