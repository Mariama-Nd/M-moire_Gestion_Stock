document.addEventListener('DOMContentLoaded', function () {
    fetch('../../controlleur/controlleur.php?option=61')
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
            }
        })
        .catch(error => console.error('Erreur lors de la récupération des livraisons :', error));
});

function getActions(livraison) {
    const { idBL, id_bc: idBC, nomBL, Etat_Livraison, nbr_produits } = livraison;
    let actions = '';

    if (nbr_produits >0) {
        actions += `<button onclick="window.open('voir.php?idBL=${idBL}&nomBL=${nomBL}', '_blank')" class="btn btn-light btn-custom" style=" background-color:rgb(111, 189, 215); ">Voir Bon</button>`;

        actions += `<button onclick="location.href='consulter_bl.php?idBL=${idBL}&idBC=${idBC}&nomBL=${nomBL}'" class="btn btn-secondary btn-custom">Consulter BL</button>`;
    
    } else {
      
      
            actions += `<button" style="background-color: orange; color: white; border: none; border-radius: 5px; cursor: pointer;"></button>`;
        
    }

    return actions;
}



