/**
 * 
 */
var cryptos;
var apis;

var table = new CryptoTable({
	'completeGather': function(){
		alert('completeGather:' + table.totalFiat);
	},
	'complete': function(){
		var totalFiat = table.totalFiat;
		/*
		$('.fiat').each(function(){
			var value = $(this).html().replace(/€/, '');
			totalFiat += parseFloat(value);
		});
		*/
		$('#totalFiat').html(table.round(totalFiat, 2));
		$('#waitToBeFilled').show();
		$('#loading').hide();
		$('#coincontainer').DataTable({
			paging: true,
			search: false
		});
		
	},
	'partial': function(data){
		$('#txtLoading').html(data.remaining);
	}
});

function convert(){
	var crypto;
	var o = {'amount': $('#inTokens').val()};
	switch($('#token').val()){
		case 'ETH':
			crypto = new Ethereum(o);
			break;
		case 'BTC':
			crypto = new Bitcoin(o);
			break;
		case 'CREA':
			crypto = new Creativecoin(o);
			break;
		case 'LTC':
			crypto = new Litecoin(o);
			break;
		case 'NEO':
			crypto = new Neo(o);
			break;
		case 'DASH':
			crypto = new Dash(o);
			break;
		case 'XRP':
			crypto = new Ripple(o);
			break;
	}
	
	var sense = $('#sense').val();
	var from = (sense=='LTR' ? '#inTokens' : '#outEuros');
	var to = (sense=='RTL' ? '#inTokens' : '#outEuros');
	var value = $(from).val();
	var inValue = (sense=='LTR' ? value : 1);
	
	crypto.convert(inValue, function(data){
		var output = data[0].price_eur * data[0].value;
		var result = crypto.round(output, 2);
		if (sense=='RTL'){
			result = value/result;
		}
		$(to).val(result);
	}, false);
}

function getConf(){
	var g1 = new Promise(function(ok,  reject)
    {
        browser.storage.local.get("cryptos",function(result)
        {
            if(!result || !result.cryptos) {
            	console.debug('no crypto defined, show setup');
            	$('#setup').show();
            }else{
            	console.debug('loading from storage');
            	cryptos = result.cryptos;
            	ok();
            }
        });
    });
	var g2 = new Promise(function(ok,  reject)
    {
        browser.storage.local.get("apis",function(result)
        {
            if(!result || !result.apis) {
            	console.debug('no apis defined, show setup');
            	$('#setup').show();
            }else{
            	console.debug('loading from storage');
            	apis = result.apis;
            	ok();
            }
        });
    });
	return Promise.all([g1, g2])
}

async function run(){
	await getConf();
	var result = {
			cryptos: cryptos,
			apis: apis
	}
	table.loadData(result, function(){
		table.render();
	});
}

run();

$(document).ready(function(){
	convert();
	$( document ).tooltip();
	$('#token, #inTokens, #outEuros').change(function(){convert()});
	$('#inTokens, #outEuros').focus(function(){
		var sense ="LTR";
		var toRO = "outEuros";
		if ($(this).attr('id')=='inTokens'){
			sense ="LTR";
			toRO = "outEuros";
		}else if ($(this).attr('id')=='outEuros'){
			sense ="RTL";
			toRO = "inTokens";
		}
		$('#' + toRO).attr('readonly', 'readonly');
		$(this).removeAttr('readonly');
		$('#sense').val(sense);
			
	});
	
	
	
	
});