document.addEventListener("DOMContentLoaded", function () {
    // Initialize Select2
    $(document).ready(function() {
        $('#fournisseurs').select2({
            placeholder: 'Sélectionnez les fournisseurs',
            allowClear: true,
            width: '100%'
        });
    });

    // Récupération des éléments du DOM
    const modal = document.getElementById("modalBC");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const formBC = document.getElementById("formBC");
    const fournisseursSelect = document.getElementById("fournisseurs");
    
    // Chargement des fournisseurs
    fetch("../../controlleur/controlleur.php?option=65")
        .then(response => response.json())
        .then(data => {
            fournisseursSelect.innerHTML = "";
            data.forEach(fournisseur => {
                const option = document.createElement("option");
                option.value = fournisseur.idF;
                option.textContent = fournisseur.nomF;
                fournisseursSelect.appendChild(option);
            });
            openModal();
        })
        .catch(error => {
            console.error("Erreur:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors du chargement des fournisseurs'
            });
        });

    // Gestion du formulaire
    formBC.addEventListener("submit", function (e) {
        e.preventDefault();
        
        const nomBC = document.getElementById("commandeNom").value.trim();
        const modalitePaiement = document.querySelector('input[name="modalitePaiement"]:checked')?.value;
        const modeReglement = document.querySelector('input[name="modeReglement"]:checked')?.value;
        const fournisseurs = $('#fournisseurs').val();

        if (!nomBC || !fournisseurs || !modalitePaiement || !modeReglement) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs manquants',
                text: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        // Envoi des données
        const formData = new FormData();
        formData.append('nomBC', nomBC);
        formData.append('fournisseurs', JSON.stringify(fournisseurs));
        formData.append('modalitePaiement', modalitePaiement);
        formData.append('modeReglement', modeReglement);

        fetch("../../controlleur/controlleur.php?option=14", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès',
                    text: 'Commande créée avec succès',
                    timer: 1500
                }).then(() => {
                    location.reload();
                });
            }
        })
        .catch(error => {
            console.error("Erreur:", error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Erreur lors de la création de la commande'
            });
        });
    });

    function openModal() {
        modal.classList.remove("d-none");
        modal.classList.add("d-block");
    }

    closeModalBtn.addEventListener("click", () => {
        modal.classList.remove("d-block");
        modal.classList.add("d-none");
        location.href = "Liste_bon_cmd.php";
    });
});