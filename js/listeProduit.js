document.addEventListener('DOMContentLoaded', function() {
    fetchCategories();
    fetchSousCategories();
    fetchProduits();
    fetchEtat();
});

function fetchCategories() {
    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 54
        })
    })
    .then(response => response.json())
    .then(data => {
        const catSelect = document.getElementById('cat-select');
        catSelect.innerHTML = '<option value="">Tous</option>';
        data.forEach(categorie => {
            const option = document.createElement('option');
            option.value = categorie.nom_categorie;
            option.textContent = categorie.nom_categorie;
            catSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des catégories :', error));
}

function fetchSousCategories() {
    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 57
        })
    })
    .then(response => response.json())
    .then(data => {
     
        const subcat = document.getElementById('subcat-select');
        subcat.innerHTML = '<option value="">Tous</option>';
        data.forEach(souscategorie => {
            const option = document.createElement('option');
            option.value = souscategorie.nom;
            option.textContent = souscategorie.nom;
            subcat.appendChild(option);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des sous-catégories :', error));
}
function fetchEtat() {
    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 55
        })
    })
    .then(response => response.json())
    .then(data => {
        const etatSelect = document.getElementById('etat-select');
        etatSelect.innerHTML = '<option value="">Tous</option>';
        data.forEach(etat => {
            const option = document.createElement('option');
            option.value = etat.nom_statut;
            option.textContent = etat.nom_statut;
            if (etat.nom_statut === 'En Service') {
                option.classList.add('en-service');
            } else if (etat.nom_statut === 'Hors Service') {
                option.classList.add('hors-service');
            }
            etatSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Erreur lors de la récupération des sous-catégories :', error));
}
function fetchProduits() {
    fetch('../controlleur/controlleur.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'option': 56
        })
    })
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('#sales-table tbody');
        tbody.innerHTML = '';
        data.forEach(ventes => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-stock', ventes.Stock_actuel);
            tr.setAttribute('data-min-threshold', ventes.Seuil_limite);
            tr.innerHTML = `
                <td>${ventes.nom_categorie}</td>
                <td>${ventes.nom}</td>
                <td>${ventes.nomproduit}</td>
                <td>${ventes.Stock_actuel                                                                                             }</td>
                <td>${ventes.Total}</td>
                <td>${ventes.retrait}</td>
                <td>${ventes.nom_statut}</td>
            `;
            tbody.appendChild(tr);
        });

        initializeDataTable();
    })
    .catch(error => console.error('Erreur lors de la récupération des produits :', error));
}

function initializeDataTable() {
    const table = $('#sales-table').DataTable();
    const categoryOptions = new Set();
    const subcategoryOptions = new Set();
    const stockOptions = new Set();
    const etatOptions = new Set();

    $('#sales-table tbody tr').each(function() {
        categoryOptions.add($(this).find('td:eq(0)').text());
        subcategoryOptions.add($(this).find('td:eq(1)').text());
        stockOptions.add($(this).find('td:eq(3)').text());
        etatOptions.add($(this).find('td:eq(6)').text());
    });

    stockOptions.forEach(option => {
        $('#stock-select').append(`<option value="${option}">${option}</option>`);
    });
    etatOptions.forEach(option => {
        $('#etat-select').append(`<option value="${option}">${option}</option>`);
    });

    $('select, #name-input').on('change input', function() {
        const categoryFilter = $('#cat-select').val();
        const subcategoryFilter = $('#subcat-select').val();
        const nameFilter = $('#name-input').val().toLowerCase();
        const stockFilter = $('#stock-select').val();
        const etatFilter = $('#etat-select').val();
        table.rows().every(function() {
            const data = this.data();
            const row = $(this.node());
            const categoryMatch = categoryFilter === "" || data[0].toLowerCase().includes(categoryFilter.toLowerCase());
            const subcategoryMatch = subcategoryFilter === "" || data[1].toLowerCase().includes(subcategoryFilter.toLowerCase());
            const nameMatch = nameFilter === "" || data[2].toLowerCase().includes(nameFilter);
            const stockMatch = stockFilter === "" || data[3] === stockFilter;
            const etatMatch = etatFilter === "" || data[6] === etatFilter;
            if (categoryMatch && subcategoryMatch && nameMatch && stockMatch && etatMatch) {
                row.show();
            } else {
                row.hide();
            }
        });
    });
}