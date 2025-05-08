let tab_identifian = []
let tba_valeur = []
let inputs = document.querySelectorAll("input[type='number']");
inputs.forEach(function (input) {
    input.style.display = "none";
});
function affiche(a) {
    const check = document.getElementById("my-checkbox" + a)
    const form_input = document.getElementById("input" + a)
    if (check.checked) {
        form_input.style.display = 'block';

        tab_identifian.push(check.value)
    } else {
        form_input.style.display = 'none';
    }
    tba_valeur.push(form_input.value)
}
let check = document.querySelectorAll("input[type='checkbox']")
inputs.forEach(element => {
    console.log(element)
})
console.log("///////////////////////////////")
check.forEach(element => {
    console.log(element.value)
})
function add() {
    let xhr = new XMLHttpRequest()
    console.log(tab_identifian)
    console.log(tba_valeur)
    xhr.open("GET", "")
    xhr.onload = function () {
        let reponse = xhr.responseText
        if (reponse) {
            alert("Inventaire mise à jour")
        } else {
            alert("Imposible d'effectuer ces modification")
        }
    }

    xhr.send
}
