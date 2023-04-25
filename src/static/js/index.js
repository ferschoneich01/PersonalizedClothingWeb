
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



// script del menu responsive Abrir el menu
var btnMobile = document.getElementById('btn-mobile');

btnMobile.addEventListener('click', function (e) {
    e.preventDefault()
    let mySidenav = document.getElementById("mySidenav")
    mySidenav.classList.toggle("openOffCanvas");
})

// script del menu responsive sticky menu

var nav = document.getElementById('mySidenav')

window.addEventListener('scroll', function () {
    if (window.pageYOffset > nav.offsetTop) {
        nav.classList.add('nav-fixed')
    } else {
        nav.classList.remove('nav-fixed')
    }
})
// script del menu responsive effecto accordeon
var submenu = document.getElementsByClassName('link-submenu');

for (var i = 0; i < submenu.length; i++) {
    submenu[i].onclick = function () {
        var content = this.nextElementSibling

        if (content.style.maxHeight) {
            content.style.maxHeight = null
        } else {
            content.style.maxHeight = content.scrollHeight + "px"
        }

    }
}



