var $j = jQuery.noConflict();

$j(document).ready(function () {
    const formCategorie = document.getElementById('formCategorie');
    const submitButtonCategorie = document.getElementById('btnAjoutCategorie');

    if (formCategorie) {
        formCategorie.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) e.preventDefault();
        });

        $j("form[name='formCategorie']").validate({
            rules: {
                nomC: {
                    required: true,
                    minlength: 3
                }
            },
            messages: {
                nomC: {
                    required: "Champ obligatoire",
                    minlength: "Le nom doit contenir au moins 3 caractères"
                }
            },
            submitHandler: function (form) {
                submitButtonCategorie.setAttribute('data-kt-indicator', 'on');
                submitButtonCategorie.disabled = true;
                const formData = $j(form).serialize() + '&option=2';

                $j.ajax({
                    type: 'post',
                    url: '../../controlleur/controlleur.php', // Assurez-vous que ce chemin est correct
                    data: formData,
                    success: function (data) {
                        if (data === "OK") {
                            formCategorie.reset();
                            Swal.fire({
                                icon: 'success',
                                title: 'Succès',
                                text: 'Categorie ajoutée avec succès',
                            }).then(() => {
                                location.reload();
                            });
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
            }
        });
    }
});