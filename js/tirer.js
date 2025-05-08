document.addEventListener('DOMContentLoaded', function() {
    var idbon = new URLSearchParams(window.location.search).get('id');
    let btnSubmitNewFournisseur = document.getElementById('submitFournisseurBtn');
    function loadFournisseurs() {
        $.ajax({
            url: '../../controlleur/controlleur.php',
            data: { option: 34 },
            dataType: 'json',
            success: function(response) {
                var fournisseurSelect = document.getElementById('fournisseurSelect');
                fournisseurSelect.innerHTML = '<option value="">Sélectionnez un fournisseur</option>';

                if (response.success && Array.isArray(response.data)) {
                    response.data.forEach(function(fournisseur) { 
                        var option = document.createElement('option');
                        option.value = fournisseur.idF; 
                        option.textContent = fournisseur.nomF; 
                        fournisseurSelect.appendChild(option);
                    });
                } else {
                    console.error('Données reçues invalides:', response);
                }
            },
            error: function() {
                alert('Erreur de chargement des fournisseurs.');
            }
        });
    }

    document.getElementById('fournisseurModal').style.display = 'block';
    loadFournisseurs();

    function closeModal() {
        document.getElementById('fournisseurModal').style.display = 'none';
    }

    document.getElementById('fournisseurForm').addEventListener('submit', function(event) {
        event.preventDefault();
        var fournisseurId = document.getElementById('fournisseurSelect').value;

        if (fournisseurId) {
            generateBon(fournisseurId, idbon);
        } else {
            alert('Veuillez sélectionner un fournisseur.');
        }
    });

    function generateBon(fournisseurId, idbon) {
        $.ajax({
            type: 'POST',
            url: '../../test.php',
            data: { 
                fournisseurId: fournisseurId,
                id: idbon
            },
         
            success: function(response) {
                
                if (response) {
                    window.open('../../test.php?id=' + idbon + '&fournisseurId=' + fournisseurId, '_blank');
                } else {
                    alert('Erreur lors de la génération du bon: ' + response.message);
                }
            },
            
            error: function(xhr, status, error) {
                alert('Erreur lors de la génération du bon: ' + error);
            }
        });
    }
    

    // Fonction pour afficher le formulaire d'ajout de fournisseur
    function ajouterFournisseur() {
        document.getElementById('newFournisseur').style.display = 'block';
    }

    // Fonction pour soumettre un nouveau fournisseur
    function submitNewFournisseur() {
        var nom = document.getElementById('nom').value;
        var prenom = document.getElementById('prenom').value;
        var entreprise = document.getElementById('entreprise').value;
        var adresse = document.getElementById('adresse').value;
        var ville = document.getElementById('ville').value;
        var telephone = document.getElementById('telephone').value;
        var mail = document.getElementById('mail').value;

        $.ajax({
            type: 'POST',
            url: '../../controlleur/controlleur.php',
            data: {
                option: 35,
                nom: nom,
                prenom: prenom,
                entreprise: entreprise,
                adresse: adresse,
                ville: ville,
                telephone: telephone, 
                mail: mail
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    alert('Fournisseur ajouté avec succès!');
                    var newFournisseurId = response.idF; 
                    loadFournisseurs();

                    generateBon(newFournisseurId, idbon);    
                    closeModal(); 
                }// Ferme le modal
                    else if(response.message == "champObligatoire") {
                        
                        const divAlert = document.getElementById('divAlert');
                        const labelAlert = document.getElementById('labelAlert');
                        divAlert.classList.remove('d-none');
                        divAlert.classList.add('d-block');
                        labelAlert.innerText = 'Veuillez remplir tous le champs obligatoire.';
                        submitFournisseurBtn.removeAttribute('data-kt-indicator');
                        submitFournisseurBtn.disabled = false;
                    }
                 else {
                    alert('Erreur lors de l\'ajout du fournisseur: ' + response.message);
                }
            },
            error: function() {
                alert('Erreur de communication avec le serveur.');
            }
        });
    }

    
    var btnAjouterFournisseur = document.getElementById('btnAjouterFournisseur');
    if (btnAjouterFournisseur) {
        btnAjouterFournisseur.addEventListener('click', function() {
            ajouterFournisseur(); 
            btnAjouterFournisseur.classList.add('d-none');
            submitFournisseurBtn.classList.remove('d-none'); 
           
        });
    }
   
    if (btnSubmitNewFournisseur) {
        btnSubmitNewFournisseur.addEventListener('click', submitNewFournisseur);
    }
});
