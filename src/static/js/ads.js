//anuncios
var modal = document.getElementById("modal");
var overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);
var close = document.getElementsByClassName("close")[0];

window.onload = function () {
    modal.style.display = "block";
    overlay.style.display = "block";
}

close.onclick = function () {
    modal.style.display = "none";
    overlay.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        overlay.style.display = "none";
    }
}