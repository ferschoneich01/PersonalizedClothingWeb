///paymenthMethod
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btnPay').addEventListener('click', e => {
        $('button').click(function () {
            var value = $("input[type=radio][name=dir]:checked").val();
            if (value) {
                window.location.href = "/paymenthMethod/" + value;
            }
            else {
                alert('Debe seleccionar una dirección');
            }
        })
    });

});
