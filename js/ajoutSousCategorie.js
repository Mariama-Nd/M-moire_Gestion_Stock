$(document).ready(function () {
    const formSousCategorie = document.getElementById('formSousCategorie');
    const submitButtonSousCategorie = document.getElementById('btnAjoutSousCategorie');

    $.ajax({
        type: 'post',
        url: '../../controlleur/controlleur.php',
        data: { option: 63 },
        success: function (data) {
       
            if (data == "pasConnexion") {
                window.location.href = "page-de-connexion";
            } else if (data == "Erreur") {
                window.location.href = "/erreur";
            } else {
                $('#categorie-name').html(data);
              
            }
        },
        error: function (resultat, statut, erreur) {
            console.error('Erreur AJAX:', erreur);
            window.location.href = "/erreur";
        }
    });
    if (formSousCategorie) {
  
        formSousCategorie.addEventListener("keydown", function (e) {
            if (e.keyCode == 13) e.preventDefault();
        });

      
        formSousCategorie.addEventListener("submit", function (e) {
            e.preventDefault();

          
         
            submitButtonSousCategorie.setAttribute('data-kt-indicator', 'on');
            submitButtonSousCategorie.disabled = true;

      
            const formData = $(formSousCategorie).serialize() + '&option=5';

           
            $.ajax({
                type: 'post',
                url: '../../controlleur/controlleur.php', 
                data: formData,
                success: function (data) {
                    console.log(data);
                    if (data == "OK") {
                        Swal.fire({
                            icon: 'success',
                            title: 'Succès',
                            text: ' Sous_Categorie ajoutée avec succès',
                        }).then(() => {
                            formSousCategorie.reset();
                            location.reload();
                        });
                    } else if (data == "champObligatoire") {
                      
                        const divAlert = document.getElementById('divAlert');
                        const labelAlert = document.getElementById('labelAlert');
                        divAlert.classList.remove('d-none');
                        divAlert.classList.add('d-block');
                        labelAlert.innerText = 'Veuillez remplir tous les champs obligatoires.';
                        submitButtonSousCategorie.removeAttribute('data-kt-indicator');
                        submitButtonSousCategorie.disabled = false;
                    }
                    else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erreur',
                            text: 'Ajout de la Sous_categorie échoué',
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
                        text: 'Erreur lors de l\'ajout de la Sous_categorie',
                    });
                }
            });
        });
    }
});