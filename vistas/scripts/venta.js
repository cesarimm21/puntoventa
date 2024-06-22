var tabla;

//funcion que se ejecuta al inicio
function init(){
   mostrarform(false);
   listar();

   $("#formulario").on("submit",function(e){
   	guardaryeditar(e);
   });

   //cargamos los items al select cliente
   $.post("../ajax/venta.php?op=selectCliente", function(r){
   	$("#idcliente").html(r);
   	$('#idcliente').selectpicker('refresh');
   });

}

//funcion limpiar
function limpiar(){
//obtenemos la fecha actual
	var now = new Date();
	var day =("0"+now.getDate()).slice(-2);
	var month=("0"+(now.getMonth()+1)).slice(-2);
	var today=now.getFullYear()+"-"+(month)+"-"+(day);
	var series=now.getFullYear()+""+(month)+""+(day)+now.getHours()+""+now.getMinutes()+""+now.getSeconds();
	$("#idcliente").val("");
	$("#cliente").val("");
	$("#serie_comprobante").val("");
	$("#num_comprobante").val("");
	//$("#serie_comprobante").val("TIK01");
	//$("#num_comprobante").val(series);
	$("#impuesto").val(0);

	$("#total_venta").val("");
	$(".filas").remove();
	$("#total").html("0");

	
	$("#fecha_hora").val(today);

	//marcamos el primer tipo_documento
	$("#tipo_comprobante").val("Boleta");
	$("#tipo_comprobante").selectpicker('refresh');

}

var num_db_last_registry = 0;

//funcion para obtener el ultimo registro
function obtenerUltimoRegistro() {
	$.ajax({
	   url: '../ajax/venta.php?op=obtenerUltimoRegistro',
	   type: 'GET',
	   dataType: 'json',
	   success: function(data) {
		if (data && data.idventa) {
			num_db_last_registry = data.idventa;
		}else {
			num_db_last_registry = 0; // Valor predeterminado si no hay registros
		}
		marcarImpuesto(); // Llamar aquí para actualizar los valores
	   },
	   error: function(err) {
		  console.log('Error obteniendo el último registro:', err);
	   }
	});
 }

//declaramos variables necesarias para trabajar con las compras y sus detalles
var impuesto=18;
var cont=0;
var detalles=0;

$("#btnGuardar").hide();
$("#tipo_comprobante").change(marcarImpuesto);

function marcarImpuesto(){
	var tipo_comprobante=$("#tipo_comprobante option:selected").text();
	var num_db_last_registry_padded = padNumber((Number(num_db_last_registry) + 1), 4);
	if (tipo_comprobante=='Factura') {
		$("#impuesto").val(impuesto);
		$("#serie_comprobante").val(`E_${num_db_last_registry_padded}`);
		$("#num_comprobante").val(`${num_db_last_registry_padded}`);
	}else if(tipo_comprobante=='Boleta'){
		$("#impuesto").val("0");
		$("#serie_comprobante").val(`BL_${num_db_last_registry_padded}`);
		$("#num_comprobante").val(`${num_db_last_registry_padded}`);
	}else if(tipo_comprobante=='Ticket'){
		$("#impuesto").val("0");
		$("#serie_comprobante").val(`TK_${num_db_last_registry_padded}`);
		$("#num_comprobante").val(`${num_db_last_registry_padded}`);
	}
}

function padNumber(num, length) {
    return num.toString().padStart(length, '0');
}

//funcion mostrar formulario
function mostrarform(flag){
	obtenerUltimoRegistro();
	limpiar();
	marcarImpuesto();
	if(flag){
		$("#listadoregistros").hide();
		$("#formularioregistros").show();
		//$("#btnGuardar").prop("disabled",false);
		$("#btnagregar").hide();
		listarArticulos();

		$("#btnGuardar").hide();
		$("#btnCancelar").show();
		detalles=0;
		$("#btnAgregarArt").show();


	}else{
		$("#listadoregistros").show();
		$("#formularioregistros").hide();
		$("#btnagregar").show();
	}
}

//funcion mostrar formulario
function mostrarformView(flag){
	limpiar();
	marcarImpuesto();
	if(flag){
		$("#listadoregistros").hide();
		$("#formularioregistros").show();
		//$("#btnGuardar").prop("disabled",false);
		$("#btnagregar").hide();
		listarArticulos();
		$("#btnGuardar").hide();
		$("#btnCancelar").show();
		detalles=0;
		$("#btnAgregarArt").show();


	}else{
		$("#listadoregistros").show();
		$("#formularioregistros").hide();
		$("#btnagregar").show();
	}
}

//cancelar form
function cancelarform(){
	limpiar();
	$("#idcliente").prop("disabled", false);
	$("#tipo_comprobante").prop("disabled", false);
	mostrarform(false);
}

//funcion listar
function listar(){
	tabla=$('#tbllistado').dataTable({
		"aProcessing": true,//activamos el procedimiento del datatable
		"aServerSide": true,//paginacion y filrado realizados por el server
		dom: 'Bfrtip',//definimos los elementos del control de la tabla
		buttons: [
                  'copyHtml5',
                  'excelHtml5',
                  'csvHtml5',
                  'pdf'
		],
		"ajax":
		{
			url:'../ajax/venta.php?op=listar',
			type: "get",
			dataType : "json",
			error:function(e){
				console.log(e.responseText);
			}
		},
		"bDestroy":true,
		"iDisplayLength":10,//paginacion
		"order":[[0,"desc"]]//ordenar (columna, orden)
	}).DataTable();
}

function listarArticulos(){
	tabla=$('#tblarticulos').dataTable({
		"aProcessing": true,//activamos el procedimiento del datatable
		"aServerSide": true,//paginacion y filrado realizados por el server
		dom: 'Bfrtip',//definimos los elementos del control de la tabla
		buttons: [

		],
		"ajax":
		{
			url:'../ajax/venta.php?op=listarArticulos',
			type: "get",
			dataType : "json",
			error:function(e){
				console.log(e.responseText);
			}
		},
		"bDestroy":true,
		"iDisplayLength":10,//paginacion
		"order":[[0,"desc"]]//ordenar (columna, orden)
	}).DataTable();
}
//funcion para guardaryeditar
function guardaryeditar(e){
     e.preventDefault();//no se activara la accion predeterminada 
     //$("#btnGuardar").prop("disabled",true);
     var formData=new FormData($("#formulario")[0]);
	 formData.append('serie_comprobante', $("#serie_comprobante").val());
     formData.append('num_comprobante', $("#num_comprobante").val());
     formData.append('impuesto', $("#impuesto").val());

     $.ajax({
     	url: "../ajax/venta.php?op=guardaryeditar",
     	type: "POST",
     	data: formData,
     	contentType: false,
     	processData: false,

     	success: function(datos){
     		bootbox.alert(datos);
     		mostrarform(false);
     		listar();
     	}
     });

     limpiar();
}

function mostrar(idventa){
	$.post("../ajax/venta.php?op=mostrar",{idventa : idventa},
		function(data,status)
		{
			data=JSON.parse(data);
			mostrarformView(true);

			$("#idcliente").val(data.idcliente);
			$("#idcliente").selectpicker('refresh');
			$("#idcliente").prop("disabled", true);
			$("#tipo_comprobante").val(data.tipo_comprobante);
			$("#tipo_comprobante").selectpicker('refresh');
			$("#tipo_comprobante").prop("disabled", true);
			$("#serie_comprobante").val(data.serie_comprobante);
			$("#num_comprobante").val(data.num_comprobante);
			$("#fecha_hora").val(data.fecha);
			$("#impuesto").val(data.impuesto);
			$("#idventa").val(data.idventa);
			
			//ocultar y mostrar los botones
			$("#btnGuardar").hide();
			$("#btnCancelar").show();
			$("#btnAgregarArt").hide();
		});
	$.post("../ajax/venta.php?op=listarDetalle&id="+idventa,function(r){
		$("#detalles").html(r);
	});

}


//funcion para desactivar
function anular(idventa){
	bootbox.confirm("¿Esta seguro de desactivar este dato?", function(result){
		if (result) {
			$.post("../ajax/venta.php?op=anular", {idventa : idventa}, function(e){
				bootbox.alert(e);
				tabla.ajax.reload();
			});
		}
	})
}

function agregarDetalle(idarticulo,articulo,precio_venta){
	var cantidad=1;
	var descuento=0;

	if (idarticulo!="") {
		var subtotal=cantidad*precio_venta;
		var fila='<tr class="filas" id="fila'+cont+'">'+
        '<td><button type="button" class="btn btn-danger" onclick="eliminarDetalle('+cont+')">X</button></td>'+
        '<td><input type="hidden" name="idarticulo[]" value="'+idarticulo+'">'+articulo+'</td>'+
        '<td><input type="number" name="cantidad[]" id="cantidad' + cont + '" value="'+cantidad+'" onkeyup="modificarSubtotales()"></td>'+
        '<td><input type="number" name="precio_venta[]" id="precio_venta' + cont + '" value="'+precio_venta+'" onkeyup="modificarSubtotales()"></td>'+
        '<td><input type="number" name="descuento[]" id="descuento' + cont + '" value="'+descuento+'" onkeyup="modificarSubtotales()"></td>'+
        '<td><span id="subtotal'+cont+'" name="subtotal">'+subtotal+'</span></td>'+
        '<td><button type="button" onclick="modificarSubtotales()" class="btn btn-info"><i class="fa fa-refresh"></i></button></td>'+
		'</tr>';
		cont++;
		detalles++;
		$('#detalles').append(fila);
		modificarSubtotales();

		$('#cantidad' + (cont - 1)).on('change', function(){
			modificarSubtotales();
		 });
		 $('#precio_venta' + (cont - 1)).on('change', function(){
			modificarSubtotales();
		 });
		 $('#descuento' + (cont - 1)).on('change', function(){
			modificarSubtotales();
		 });

	}else{
		alert("error al ingresar el detalle, revisar las datos del articulo ");
	}
}

function modificarSubtotales(){
	var cant=document.getElementsByName("cantidad[]");
	var prev=document.getElementsByName("precio_venta[]");
	var desc=document.getElementsByName("descuento[]");
	var sub=document.getElementsByName("subtotal");


	for (var i = 0; i < cant.length; i++) {
		var inpV=cant[i];
		var inpP=prev[i];
		var inpS=sub[i];
		var des=desc[i];


		inpS.value=(inpV.value*inpP.value)-des.value;
		document.getElementsByName("subtotal")[i].innerHTML=inpS.value;
	}

	calcularTotales();
}

function calcularTotales(){
	var sub = document.getElementsByName("subtotal");
	var total=0.0;

	for (var i = 0; i < sub.length; i++) {
		total += document.getElementsByName("subtotal")[i].value;
	}
	$("#total").html("S/." + total);
	$("#total_venta").val(total);
	evaluar();
}

function evaluar(){

	if (detalles>0) 
	{
		$("#btnGuardar").show();
	}
	else
	{
		$("#btnGuardar").hide();
		cont=0;
	}
}

function eliminarDetalle(indice){
$("#fila"+indice).remove();
calcularTotales();
detalles=detalles-1;

}

init();