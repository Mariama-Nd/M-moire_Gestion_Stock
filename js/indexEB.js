let nom;
let prenom;
const users = [
  {
    matricule: '230007',
    nom: 'Ndiaye',
    prenom: 'Mariama',
    Structure: 'DRIAT'
  },
  {
    matricule: '230449',
    nom: 'Said',
    prenom: 'Mohamed',
    Structure: 'Finances'
  },
  {
    matricule: '230347',
    nom: 'Seye',
    prenom: 'Robert',
    Structure: 'Academy'
  }
];

function appel() {
  let matricule = document.getElementById('matricule-input').value;
  let input_info = document.getElementById('service');
  let div_cacher = document.getElementById('creation');

  if (!matricule) {
    alert("Veuillez d'abord saisir un matricule");
    div_cacher.hidden = true;
    return;
  }

  if (matricule.length !== 6) {
    alert("Veuillez saisir un matricule valide");
    div_cacher.hidden = true;
    return;
  }
  let reponse = search(matricule);
  if (!reponse) {
    alert("Agent inexistant");
    div_cacher.hidden = true;
  } else {
    div_cacher.hidden = false;
    input_info.value = reponse;
    document.getElementById('matricule-input').inert = true;
  }
}

function search(matricule) {
  for (let i = 0; i < users.length; i++) {
    if (matricule === users[i].matricule) {
      nom = remplis(users[i].nom);
      prenom = remplis2(users[i].prenom);
      return users[i].Structure;
    }
  }
  return false;
}

function remplis(nom) {
  return nom;
}

function remplis2(prenom) {
  return prenom;
}

function valider() {
  let service = document.getElementById('service').value;
  let matricule = document.getElementById('matricule-input').value;
  let div_cacher = document.getElementById('creation');

  Swal.fire({
    title: 'Confirmation',
    text: "Voulez-vous créer une nouvelle expression de besoin ?",
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

      fetch('../../controlleur/controlleur.php?option=43', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `matricule=${matricule}&service=${service}&nom=${nom}&prenom=${prenom}`
      })
      .then(response => response.json())
      .then(data => {
        if (data) {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Expression de besoin créée avec succès',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            matricule = '';
            service = '';
            window.location.href = 'liste_EB.php';
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
          text: 'Erreur lors de l\'enregistrement de l\'expression de besoin'
        });
      });
    } else {
      div_cacher.hidden = true;
      document.getElementById('matricule-input').inert = false;
    }
  });
}

