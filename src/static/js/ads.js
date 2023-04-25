//anuncios
var modal = document.getElementById("modal");
var overlay = document.createElement("div");
overlay.className = "overlay";
document.body.appendChild(overlay);
var close = document.getElementsByClassName("close")[0];


function seHaMostradoHoy() {
    const hoy = new Date();
    const fechaMostrada = localStorage.getItem('fechaMostrada');
    if (fechaMostrada === null) {
      return false;
    }
    const fecha = new Date(fechaMostrada);
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  /* Mostrar la ventana modal si no se ha mostrado hoy */
  if (!seHaMostradoHoy()) {
    window.onload = function () {
        modal.style.display = "block";
        overlay.style.display = "block";
    }
    localStorage.setItem('fechaMostrada', new Date().toISOString());
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