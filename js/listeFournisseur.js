document.addEventListener('DOMContentLoaded', function() {
    fetchFournisseurs();
});

function fetchFournisseurs() {
    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 34
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const fournisseurs = data.data;
            const tbody = document.querySelector('#sales-table tbody');
            tbody.innerHTML = ''; 

            fournisseurs.forEach(fournisseur => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${fournisseur.nomF}</td>
                    <td>${fournisseur.prenomF}</td>
                    <td>${fournisseur.adresseF}</td>
                    <td>${fournisseur.telF}</td>
                  
                    <td>${fournisseur.entreprise}</td>
                    <td>${fournisseur.ville}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            console.error('Erreur : ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erreur de connexion au serveur :', error);
    });
}