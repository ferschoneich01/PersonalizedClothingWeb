var costshipping = 0;
$(document).ready(function(){
    function addAddressAjax(){
        $.ajax(
            {
                url: '/addAddres',
                data: $('form').serialize(),
                type: 'POST',
                success: function(response){
                    console.log(response);
                    if(response['departamento'] == "Managua"){
                        costshipping = 70;
                        $(".cost").text("Costo de Envio: C$70");
                    }else{
                        $(".cost").text("Costo de Envio: C$90");
                        costshipping = 90;
                    }
                    renderizar_boton();
                },
                error: function(error){
                    console.log(error);
                }

            }
        );
    }
    
    $("#form-addres").submit(function(event){
        event.preventDefault();
        addAddressAjax();
    });

});
