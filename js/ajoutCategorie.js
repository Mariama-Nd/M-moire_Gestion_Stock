$(document).ready(function () {
    const formCategorie = document.getElementById('formCategorie');
    const submitButtonCategorie = document.getElementById('btnAjoutCategorie');

    if (formCategorie) {
        formCategorie.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) e.preventDefault();
        });

        formCategorie.addEventListener("submit", function (e) {
            e.preventDefault();

            submitButtonCategorie.setAttribute('data-kt-indicator', 'on');
            submitButtonCategorie.disabled = true;

            const formData = $(formCategorie).serialize() + '&option=2';

            $.ajax({
                type: 'post',
                url: '../../controlleur/controlleur.php',
                data: formData,
                success: function (data) {
                    if (data == "OK") {
                        formCategorie.reset();
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Categorie ajoutée avec succès',
                        }).then(() => {
                            location.reload();
                        });
                    } else if (data == "champObligatoire") {
                        // Afficher le div d'alerte avec le message approprié
                        const divAlert = document.getElementById('divAlert');
                        const labelAlert = document.getElementById('labelAlert');
                        divAlert.classList.remove('d-none');
                        divAlert.classList.add('d-block');
                        labelAlert.innerText = 'Veuillez remplir tous le champs obligatoire.';
                        submitButtonCategorie.removeAttribute('data-kt-indicator');
                        submitButtonCategorie.disabled = false;
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Ajout de la categorie échoué',
                        }).then(() => {
                            location.reload();
                        });
                    }
                },
                error: function (resultat, statut, erreur) {
                    console.error('Erreur AJAX:', erreur);
                    Swal.fire({
                        icon: 'error',
                        title: 'Erreur',
                        text: 'Erreur lors de l\'ajout de la categorie',
                    });
                }
            });
        });
    }
});