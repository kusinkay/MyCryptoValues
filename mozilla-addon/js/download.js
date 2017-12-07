var browser = browser || chrome;

var cryptos;
var apis;
function getConf(){
	var g1 = new Promise(function(ok,  reject)
	{
	    browser.storage.local.get("cryptos",function(result)
	    {
	        if(!result || !result.cryptos) {
	        	$('#dashboard').append('Failed loading cryptos');
	        	
	        }else{
	        	cryptos = result.cryptos;
	        	log(result.cryptos.length + ' cryptos from conf');
	        	ok();
	        }
	    });
	});
	
	var g2 = new Promise(function(ok,  reject)
	{
	    browser.storage.local.get("apis",function(result)
	    {
	        if(!result || !result.apis) {
	        	$('#dashboard').append('Failed loading apis');
	        	
	        }else{
	        	apis = result.apis;

	        	log(result.apis.length + ' apis from conf');
	        	ok();
	        }
	    });
	    
	});
	
	return Promise.all([g1, g2]);
}

function log(text){
	$('#logger').append(text + "<br>");
}


async function run(){
	log('entering getConf');
	await getConf();
	log('exit getConf');
	var result = {
			cryptos: cryptos,
			apis: apis
	}
	$('#backup textarea').val(JSON.stringify(result, null, 2));

}

run();


$(document).ready(function(){
	console.debug('hello?');
	$('#backup textarea').click(function(){
		$(this).select();
	});
	$('.back').click(function(){
		document.location = 'options.html';
	});
	$('.upload').click(function(){
		var commit = true;
		if (crypto && !confirm('Are you sure you want to upload this config and')){
			commit=false;
		}
		if (commit){
			var json = JSON.parse($('#restore textarea').val());
			browser.storage.local.set({cryptos: json.cryptos, apis: json.apis})
		}
	});
	
});