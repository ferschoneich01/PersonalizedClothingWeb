document.addEventListener('DOMContentLoaded', () => {

    //marco de img
    const imagen = document.getElementById("img-preview");

    //Cambiar a tamaño carta vertical
    $("#btn-lettersize-v").on('click', function () {
        imagen.style.width = "16%";
        imagen.style.height = "20%";
        imagen.style.marginLeft = "43%";
        imagen.style.marginTop = "40%";
        $("#size-selected").val("carta-v");

    });

    //Cambiar tamaño carta a horizontal
    $("#btn-lettersize-h").on('click', function () {
        imagen.style.width = "20%";
        imagen.style.height = "14%";
        imagen.style.marginLeft = "41%";
        imagen.style.marginTop = "43%";
        $("#size-selected").val("carta-h");
    });

    var rotated = false;
    //Cambiar a manga derecha
    $("#btn-manga-d").on('click', function () {
        imagen.style.width = "27%";
        imagen.style.height = "13%";
        imagen.style.marginLeft = "38%";
        imagen.style.marginTop = "45%";
        var deg = rotated ? 0 : 90;

        imagen.style.webkitTransform = 'rotate(' + deg + 'deg)';
        imagen.style.mozTransform = 'rotate(' + deg + 'deg)';
        imagen.style.msTransform = 'rotate(' + deg + 'deg)';
        imagen.style.oTransform = 'rotate(' + deg + 'deg)';
        imagen.style.transform = 'rotate(' + deg + 'deg)';

        document.getElementById("product-photo").src = getImg("negro", "derecha");
        rotated = !rotated;
    });

    //Cambiar a manga izquierda
    $("#btn-manga-i").on('click', function () {
        imagen.style.width = "27%";
        imagen.style.height = "13%";
        imagen.style.marginLeft = "35%";
        imagen.style.marginTop = "45%";
        var deg = rotated ? 0 : -90;

        imagen.style.webkitTransform = 'rotate(' + deg + 'deg)';
        imagen.style.mozTransform = 'rotate(' + deg + 'deg)';
        imagen.style.msTransform = 'rotate(' + deg + 'deg)';
        imagen.style.oTransform = 'rotate(' + deg + 'deg)';
        imagen.style.transform = 'rotate(' + deg + 'deg)';

        document.getElementById("product-photo").src = getImg("negro", "izquierda");
        rotated = !rotated;
    });

});

function getImg(name, posicion) {
    if (name == "negro" && posicion == "derecha") {
        return "static/img/SND.png"
    } else if (name == "negro" && posicion == "izquierda") {
        return "static/img/SNI.png"
    }
    else if (name == "blanco") {
        return "static/img/SBD.png"
    }
}