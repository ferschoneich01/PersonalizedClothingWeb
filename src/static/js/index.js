
// script del menu responsive Abrir el menu
var btnMobile = document.getElementById('btn-mobile')
btnMobile.addEventListener('click', function (e) {
    e.preventDefault()
    let mySidenav = document.getElementById("mySidenav")
    mySidenav.classList.toggle("openOffCanvas")
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



// script de la navegacipon por tabs
let tabs = Array.prototype.slice.apply(document.querySelectorAll('.tabs-item'))
let panels = Array.prototype.slice.apply(document.querySelectorAll('.tab-panel'))

/*document.getElementById('tabs').addEventListener('click', e => {
    if (e.target.classList.contains('tabs-item')) {
        let i = tabs.indexOf(e.target)
        tabs.map(tab => tab.classList.remove('active-tab'))
        tabs[i].classList.add('active-tab')
        panels.map(panel => panel.classList.remove('active-panel'))
        panels[i].classList.add('active-panel')
    }

})*/

