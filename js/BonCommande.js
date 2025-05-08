$(document).ready(function () {
    const formBonCommande = document.getElementById('formBonCommande');
    const submitButtonCommande = document.getElementById('btnAjoutBC');

    if (formBonCommande) {
  
        formBonCommande.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) e.preventDefault();
        });

      
        formBonCommande.addEventListener("submit", function (e) {
            e.preventDefault();

         
            submitButtonCommande.setAttribute('data-kt-indicator', 'on');
            submitButtonCommande.disabled = true;

      
            const formData = $(formBonCommande).serialize() + '&option=14';

           
            $.ajax({
                type: 'post',
                url: '../../controlleur/controlleur.php', 
                data: formData,
                success: function (data) {
                    if (data == "OK") {
                        formBonCommande.reset();
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: 'Bon ajoutée avec succès',
                        }).then(() => {
                            location.reload();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Ajout du bon échoué',
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