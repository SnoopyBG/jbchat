var invio_abilitato = true;
var url_fcgi = 'jbchat.fcgi';

$(document).ready(function() {
	// Reset iniziale
	abilita_invio();

	// Predispone il gestore dell'invio dei messaggi
	$('#form_invio').submit(invia_messaggio);

	// Inizia l'ascolto dei messaggi
	richiedi_messaggi();
});


// Ricezione messaggi ////////////////////////////////////
function richiedi_messaggi()
{
	$.ajax({
		type: 'GET',
		url: url_fcgi,
		data: { 'ricevi' : 'nuovi' },
		success: arrivo_messaggi,
		error: errore_ricezione,
		dataType: 'xml',
		timeout: 60000
	});
}

function arrivo_messaggi(xml)
{
	if (xml != '<keepalive></keepalive>') {
		$(xml).find('msg').each(function() {
			var testo = $(this).text();
			var autore = $(this).attr('autore');

			// Nota: text(stringa) si occupa anche
			//       dell'escaping
			$('<li></li>').text(autore).appendTo("#msgs");
			$('<li></li>').text(testo).appendTo("#msgs");
		});
	}
	richiedi_messaggi();
}

function errore_ricezione(XMLHttpRequest, textStatus, errorThrown)
{
	mostra_stato("Si è verificato un errore di ricezione (" + textStatus + "), ricaricare la pagina", 1);
}


// Invio messaggi ////////////////////////////////////////
function invia_messaggio()
{
	if (!invio_abilitato)
		return false;

	disabilita_invio();
	$.ajax({
		type: 'POST',
		url: url_fcgi,
		data: $('#form_invio').serialize(),
		success: function(risp) {
			if (risp == 'OK')
				abilita_invio();
			else errore_invio();
			},
		error: errore_invio,
		dataType: 'text',
		timeout: 1000
	});
	return false;
}

function disabilita_invio()
{
	invio_abilitato = false;
	$('#bottone_invio')
		.attr('disabled', true)
		.val('Invio in corso...');
}

function abilita_invio()
{
	$('#testo').val("");
	invio_abilitato = true;
	$('#bottone_invio')
		.attr('disabled', false)
		.val('Invia');
}

function errore_invio(XMLHttpRequest, textStatus, errorThrown)
{
	mostra_stato("Si è verificato un errore durante l'invio del messaggio: " + textStatus, 2);
	abilita_invio();
}


// Funzioni di interfaccia ///////////////////////////////
function mostra_stato(s, tipo)
{
	// tipo:
	//        0   normale
	//        1   errore permanente
	//        2   errore temporaneo

	// TODO: stili, fadeout
	$("#stato").text(s);
}

