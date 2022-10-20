document.addEventListener('DOMContentLoaded', () => {
    //inicializacion de valores
    let statusPrend = 1;
    let statusColor = 1;
    let statusOrientation = 1;
    //selccion inicial de prenda
    document.getElementById("Sweater").parentNode.style.cssText = "padding: 3px 10px; border: #B8B8B8 5px dashed; border-top-left-radius: 20px; border-bottom-right-radius: 20px;";
    //seleccion inicial de color
    document.getElementById("Black").parentNode.style.cssText = "padding: 1px 5px; border: #B8B8B8 2px dashed; border-top-left-radius: 5px; border-bottom-right-radius: 5px;";

    //marco de img
    const imagen = document.getElementById("img-preview");

    //Cambiar a tamaño carta vertical
    $("#btn-lettersize-v").on('click', function () {
        imagen.style.cssText = "width:16%; height:20%; margin-left:41%; margin-top:43%;"
        $("#size-selected").val("lettersize-v");

    });

    //Cambiar tamaño carta a horizontal
    $("#btn-lettersize-h").on('click', function () {
        imagen.style.cssText = "width:20%; height:16%; margin-left:41%; margin-top:43%;"


        $("#size-selected").val("lettersize-v");
    });

    //Cambiar a tamaño carta vertical
    $("#btn-backsize-v").on('click', function () {
        imagen.style.width = "16%";
        imagen.style.height = "20%";
        imagen.style.marginLeft = "43%";
        imagen.style.marginTop = "40%";
        $("#size-selected").val("carta-v");

    });

    //Cambiar tamaño carta a horizontal
    $("#btn-backsize-h").on('click', function () {
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

    $("#Sweater").on('click', function () {
        document.getElementById("Sweater").parentNode.style.cssText = "padding: 3px 10px; border: #B8B8B8 5px dashed; border-top-left-radius: 20px; border-bottom-right-radius: 20px;";
        statusPrend = 1;
        document.getElementById("Hoodie").parentNode.style.cssText = "border:0";
        document.getElementById("Shirt").parentNode.style.cssText = "border:0";
        document.getElementById("Black").src = "/static/img/sweater-black-front.jpg";
        document.getElementById("White").src = "/static/img/sweater-white-front.jpg";
        document.getElementById("Pink").src = "/static/img/sweater-pink-front.jpg";
        document.getElementById("Gray").src = "/static/img/sweater-gray-front.jpg";
        document.getElementById("Pink").style.cssText = "filter: brightness(1);";
        document.getElementById("Gray").style.cssText = "filter: brightness(1);";
        document.getElementById("product-photo").src = "/static/img/sweater-black-front.jpg";

        document.getElementById("img-preview").style.cssText = "width:16%; height: 20%; position: absolute; border-bottom:0; margin-left:43%; margin-top: 40%;";
    });

    $("#Hoodie").on('click', function () {
        document.getElementById("Hoodie").parentNode.style.cssText = "padding: 3px 10px; border: #B8B8B8 5px dashed; border-top-left-radius: 20px; border-bottom-right-radius: 20px;";
        statusPrend = 2;
        document.getElementById("Sweater").parentNode.style.cssText = "border:0";
        document.getElementById("Shirt").parentNode.style.cssText = "border:0";
        document.getElementById("Black").src = "/static/img/hoodie-black-front.jpg";
        document.getElementById("White").src = "/static/img/hoodie-white-front.jpg";
        document.getElementById("Pink").src = "/static/img/hoodie-pink-front.jpg";
        document.getElementById("Gray").src = "/static/img/hoodie-gray-front.jpg";
        document.getElementById("Pink").style.cssText = "filter: brightness(1);";
        document.getElementById("Gray").style.cssText = "filter: brightness(1);";
        document.getElementById("product-photo").src = "/static/img/hoodie-black-front.jpg";

    });

    $("#Shirt").on('click', function () {
        document.getElementById("Shirt").parentNode.style.cssText = "padding: 3px 10px; border: #B8B8B8 5px dashed; border-top-left-radius: 20px; border-bottom-right-radius: 20px;";
        statusPrend = 3;
        document.getElementById("Sweater").parentNode.style.cssText = "border:0";
        document.getElementById("Hoodie").parentNode.style.cssText = "border:0";
        document.getElementById("Black").src = "/static/img/shirt-black-front.jpg";
        document.getElementById("White").src = "/static/img/shirt-white-front.jpg";
        document.getElementById("Pink").src = "/static/img/shirt-pink-front.jpg";
        document.getElementById("Gray").src = "/static/img/shirt-gray-front.jpg";
        document.getElementById("Pink").style.cssText = "filter: brightness(0.5);";
        document.getElementById("Gray").style.cssText = "filter: brightness(0.5);";
        document.getElementById("product-photo").src = "/static/img/shirt-black-front.jpg";
        document.getElementById("img-preview").style.cssText = "width: 26%; height: 32%; position: absolute; border-bottom: 0px; margin-left: 37%; margin-top: 35%;";
    });

    $("#Black").on('click', function () {
        document.getElementById("Black").parentNode.style.cssText = "padding: 1px 5px; border: #B8B8B8 2px dashed; border-top-left-radius: 5px; border-bottom-right-radius: 5px;";
        statusColor = 1;
        document.getElementById("White").parentNode.style.cssText = "border:0";
        document.getElementById("Gray").parentNode.style.cssText = "border:0";
        document.getElementById("Pink").parentNode.style.cssText = "border:0";

    });

    $("#White").on('click', function () {
        document.getElementById("White").parentNode.style.cssText = "padding: 1px 5px; border: #B8B8B8 2px dashed; border-top-left-radius: 5px; border-bottom-right-radius: 5px;";
        statusColor = 2;
        document.getElementById("Black").parentNode.style.cssText = "border:0";
        document.getElementById("Gray").parentNode.style.cssText = "border:0";
        document.getElementById("Pink").parentNode.style.cssText = "border:0";

    });


    $("#Gray").on('click', function () {
        document.getElementById("Gray").parentNode.style.cssText = "padding: 1px 5px; border: #B8B8B8 2px dashed; border-top-left-radius: 5px; border-bottom-right-radius: 5px;";
        statusColor = 4;
        document.getElementById("White").parentNode.style.cssText = "border:0";
        document.getElementById("Black").parentNode.style.cssText = "border:0";
        document.getElementById("Pink").parentNode.style.cssText = "border:0";

    });

    $("#Pink").on('click', function () {
        document.getElementById("Pink").parentNode.style.cssText = "padding: 1px 5px; border: #B8B8B8 2px dashed; border-top-left-radius: 5px; border-bottom-right-radius: 5px;";
        statusColor = 5;
        document.getElementById("White").parentNode.style.cssText = "border:0";
        document.getElementById("Gray").parentNode.style.cssText = "border:0";
        document.getElementById("Black").parentNode.style.cssText = "border:0";


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