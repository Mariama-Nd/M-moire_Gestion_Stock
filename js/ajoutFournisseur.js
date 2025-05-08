document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('ajoutFournisseurForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        ajouterFournisseur();
    });
});

function ajouterFournisseur() {
    const form = document.getElementById('ajoutFournisseurForm');
    const formData = new FormData(form);
    formData.append('option', 35);

   
    Swal.fire({
        title: 'Ajout en cours...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: 'Succès!',
                text: data.message,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                window.location.href = "liste.php";
            });
        } else {
            Swal.fire({
                title: 'Erreur',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        Swal.fire({
            title: 'Erreur',
            text: 'Erreur de connexion au serveur',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}