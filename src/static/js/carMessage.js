function mensaje(idItem) {
    Swal.fire({
        title: '¿Desea agregar este articulo al carrito?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire('Articulo añadido al carrito', '', 'success')
            document.getElementById('addToCarForm' + idItem).submit();
        } else if (result.isDenied) {
            Swal.fire('Articulo no agregado', '', 'info')
        }
    })


}

function OrdenEntregada(url) {
    Swal.fire({
        title: '¿La orden ha sido entregada?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Orden entregada',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                window.location.href = url;
            })
        } else if (result.isDenied) {
            Swal.fire('La orden no ha sido entregada', '', 'info')
        }
    })

}

function OrdenEnviada(url) {
    Swal.fire({
        title: '¿Desear enviar esta orden?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Orden enviada',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                window.location.href = url;
            })
        } else if (result.isDenied) {
            Swal.fire('La orden no ha sido enviada', '', 'info')
        }
    })

}

function OrdenTerminada(url) {
    Swal.fire({
        title: '¿La orden ya esta lista para enviar?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Orden lista para enviar',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                window.location.href = url;
            })
        } else if (result.isDenied) {
            Swal.fire('La orden no ha sido modificada', '', 'info')
        }
    })

}

function OrdenCancelada(url) {
    Swal.fire({
        title: '¿Deseas cancelar la orden?',
        showDenyButton: false,
        showCancelButton: true,
        confirmButtonText: 'Si'
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {

            Swal.fire({
                title: 'Orden Cancelada',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                window.location.href = url;
            })

        } else if (result.isDenied) {
            Swal.fire('La orden no ha sido cancelada', '', 'info')
        }
    })


}
