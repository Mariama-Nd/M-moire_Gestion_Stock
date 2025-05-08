



function valider(event) {
  event.preventDefault();
  
  const expID = document.getElementById('expressionAgent').value;
  
  if (!expID) {
    Swal.fire({
      icon: 'warning',
      title: 'Attention',
      text: 'Veuillez sélectionner une expression de besoin'
    });
    return;
  }

  Swal.fire({
    title: 'Confirmation',
    text: "Voulez-vous créer un nouveau Bon de Sortie ?",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, créer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      // Show loading state
      Swal.fire({
        title: 'Création en cours...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      fetch('../../controlleur/controlleur.php?option=67', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `expID=${expID}`
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur réseau');
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Bon de Sortie créé avec succès',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.href = 'Liste_bon_sortie.php';
          });
        } else {
          throw new Error('Erreur lors de l\'enregistrement');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'enregistrement du bon de sortie'
        });
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById("expressionBesoinModal");
  const closeButton = document.getElementsByClassName("close")[0];
  
  if (modal) {
      modal.style.display = "block";
  }
  
  if (closeButton) {
      closeButton.onclick = function () {
          modal.style.display = "none";
          location.href = "Liste_bon_sortie.php";
      }
  }

  window.onclick = function (event) {
      if (event.target == modal) {
          modal.style.display = "none";
          location.href = "Liste_bon_sortie.php";
      }
  }
  const form = document.getElementById('formExpressionBesoin');
  if (form) {
    form.addEventListener('submit', function(event) {
      valider(event);
    });
  }
  $.ajax({
    type: 'post',
    url: '../../controlleur/controlleur.php',
    data: { option: 66 },
    success: function (data) {
   
        if (data == "pasConnexion") {
            window.location.href = "page-de-connexion";
        } else if (data == "Erreur") {
            window.location.href = "/erreur";
        } else {
            $('#expressionAgent').html(data);
          
        }
    },
    error: function (resultat, statut, erreur) {
        console.error('Erreur AJAX:', erreur);
        window.location.href = "/erreur";
    }
});

});