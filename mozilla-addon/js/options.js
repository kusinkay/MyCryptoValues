var browser = browser || chrome;

var table;
var cryptos,
	exchanges;



$('#formTokens').submit(function(e){
	e.preventDefault();
});


function saveOptions(e) {
  log('saveOptions');
  var apis = [];
  if ($('[name=cryptoid_api_key]').val()!=''){
	  apis.push({web: 'cryptoid',api_key: $('[name=cryptoid_api_key]').val()});
  }
  if ($('[name=etherscan_api_key]').val()!=''){
	  apis.push({web: 'etherscan',api_key: $('[name=etherscan_api_key]').val()});
  }
  browser.storage.local.set({cryptos: cryptos, apis: apis});
}

function loadCrypto(i){
	log('loadCrypto');
	$('#entry').show();
	return false;
}

function restoreOptions() {
	log('entramos restoreOptions');
	$('#entry').hide();
	table = new CryptoTable({});
	
	for (var i=0; i<table.availableCryptos.length; i++){
		$('[name=class]').append('<option>' + table.availableCryptos[i] + '</option>');
		$('[name=bridge]').append('<option>' + table.availableCryptos[i] + '</option>');
	}
	//table.tmpLoad('data/coins.json', reloadCoins);
	var g1 = new Promise(function(ok,  reject)
    {
        browser.storage.local.get("cryptos",function(result)
        {
            if(!result || !result.cryptos) {
            	$('#noconf').show();
            	
            }else{
	            cryptos = result.cryptos;
	            log('loading cryptos from storage');
				reloadCoins(result);
            }
        });
        browser.storage.local.get("apis",function(result)
        {
            if(!result || !result.apis) {
            	log("Couldn't load apis from storage");
            	
            }else{
	            log('loading apis from storage: ' + result.apis.length);
				if (result.apis){
					reloadApis(result);
				}
            }
        });
        browser.storage.local.get("exchanges",function(result)
        {
            if(!result || !result.exchanges) {
            	log("Couldn't load exchanges from storage");
            	
            }else{
	            log('loading exchanges from storage: ' + result.exchanges.length);
				if (result.exchanges){
					exchanges = result.exchanges;
					reloadExchanges(result);
				}
            }
        });
        
    });
	
	$('.loadSample').click(function(){
		log('loading cryptos from file');
		$('#noconf').hide();
		table.tmpLoad('data/coins.json', function(result){
			reloadCoins(result);
			log('loading apis from sample: ' + result.apis.length)
			reloadApis(result);
		});
	});
	
	
  function setCurrentChoice(result) {
    //document.querySelector("#color").value = result.color || "blue";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

}

function reloadApis(result){
	for (var i=0; i<result.apis.length; i++){
		$('[name=' + result.apis[i].web + '_api_key]').val(result.apis[i].api_key);
	}
}

function reloadCoins(result){
	$('#dashboard').html('<h2>Tokens</h2>');
	log(result.cryptos.length + " cryptos carregades");
	cryptos = result.cryptos;
	output('<ul>');
	for (var i=0; i<result.cryptos.length; i++){
		output(	'<li>' + (i+1) + 
				' - <a class="crypto" id="token_' + i + '" href="#">' 
				+ result.cryptos[i].class + '</a>'
				+ (result.cryptos[i].class=='Ethereum' ? 
						' - <a class="addContract" id="addContract_' + i + '" href="#">+ contract</a> ' : ''));
		var contracts = result.cryptos[i].contracts;
		if (contracts!=null && contracts.length>0){
			log(contracts.length + " contractes");
			output('<ul style="display:none">');
			for (var j=0; j<contracts.length; j++){
				output('<li>' + (i+1) + '.' + (j+1) 
					+ ' - <a class="contract" id="altcoin_'+i+'_'+j+'" href="#">' 
					+ (contracts[j].fsname !='' ? contracts[j].fsname : '(empty)') + '</a></li>');
			}
			output('</ul>');
		}
		output('</li>')
		
	}
	output('</ul>');
	
	$('a.crypto').unbind('click');
	$('a.crypto').click(function(e){
		e.preventDefault();
		var i = $(this).attr('id').replace('token_', '');
		$('.miniform').hide();
		$('#entry').show();
		
		log(cryptos[i].class);
		$('[name=class]').val(cryptos[i].class)
			.attr("disabled", "disabled");
		if (cryptos[i].address!=undefined && cryptos[i].address!=''){
			$('[name=address]').val(cryptos[i].address);
		}
		$('.block:not(:last-child)').remove();
		if (cryptos[i].addresses!=undefined){
			for(var j=0; j<cryptos[i].addresses.length; j++){
				$('[name=address]:last').val(cryptos[i].addresses[j].address);
				$('.addAddress').trigger('click');
			}
		}
		if (cryptos[i].amount !=undefined){
			$('[name=amount]').val(cryptos[i].amount);
		}else{
			$('[name=amount]').val('');
		}

		$('[name=info]').val(cryptos[i].info);
		$('[name=index]').val(i);
		$('[name=action]').val('update');
		$('#deleteToken').show();
		log('click');
	});
	
	$('a.contract').unbind('click');
	$('a.contract').click(function(e){
		e.preventDefault();
		var parts = $(this).attr('id').split('_');
		if (parts.length>=3){
			var tokeni = parts[1];
			var altcoinj = parts[2];
			var altcoin = cryptos[tokeni].contracts[altcoinj];
			$('[name=contract]').val(altcoin.address);
			$('[name=altcoinDecimals]').val(altcoin.decimals);
			$('[name=fsname]').val(altcoin.fsname);
			$('[name=altcoinInfo]').val(altcoin.info);
			$('[name=altcoinAmount]').val(altcoin.amount);
			if (altcoin.bridgecoin){
				$('[name=bridge]').val(altcoin.bridgecoin.class);
				$('[name=bridgeAmount]').val(altcoin.bridgecoin.amount);
			}else{
				$('[name=bridge]').val('');
				$('[name=bridgeAmount]').val('');
			}
			$('[name=tokeni]').val(tokeni);
			$('[name=altcoinj]').val(altcoinj);
			$('.miniform').hide();
			$('#altcoin').show();
			
			
		}
		
	});
	
	$('.addContract').unbind('click');
	$('.addContract').click(function(){
		var i = $(this).attr('id').replace('addContract_', '');
		$('.miniform').hide();
		$('#altcoin').show();
		$('[name=contract]').val("");
		$('[name=tokeni]').val(i);
		$('[name=altcoinj]').val('');
		$('[name=altcoinDecimals]').val('');
		$('[name=fsname]').val('');
		$('[name=bridge]').val('');
		$('[name=bridgeAmount]').val('');
		$('#deleteContract').show();
		log(table.jsonSource);
	});
	
	$('#closeContract').unbind('click');
	$('#closeContract').click(function(){
		$('#altcoin').hide();
	});
	
	$('#closeToken').unbind('click');
	$('#closeToken').click(function(){
		$('#entry').hide();
	});

	$('.addExchange').unbind('click');
	$('.addExchange').click(function(){
		$('.miniform').hide();
		$('#exchange').show();
		$('[name=xApiKey]').val('');
		$('[name=xApiPrvKey]').val('');
		$('[name=exchangei]').val('');
		$('#deleteExchange').hide();
	});
	
	$('#closeExchange').unbind('click');
	$('#closeExchange').click(function(){
		$('#exchange').hide();
	});
	
	$('#saveExchange').unbind('click');
	$('#saveExchange').click(function(){
		var exchange = {
			class: $('[name=xClass]').val(),
			api_key: $('[name=xApiKey]').val(),
			private_key: $('[name=xApiPrvKey]').val(),
		};
		if ($('[name=exchangei]').val()!=''){
			//update
			var i = $('[name=exchangei]').val();
			exchanges[i] = exchange;
		}else{
			exchanges.push(exchange);
			var result = {exchanges: exchanges};
			reloadExchanges(result);
		}
		$('#exchange').hide();
	});
	
	$('#deleteExchange').unbind('click');
	$('#deleteExchange').click(function(){
		if (confirm('Are you sure to delete?')){
			var exchangei = $('[name=exchangei]').val();
			
			if (exchangei!='' ){
				exchanges.splice(exchangei, 1);
				reloadExchanges({exchanges: exchanges});
				$('#exchange').hide();
			}
			
		}
		
	});
	
	
	$('.addToken').unbind('click');
	$('.addToken').click(function(){
		$('.miniform').hide();
		$('#entry').show();
		$('[name=class]').val("")
			.removeAttr("disabled");
		$('[name=address]').val("");
		$('.block:not(:last-child)').remove();
		$('[name=info]').val("");
		$('[name=amount]').val("");
		$('[name=index]').val("");
		$('[name=action]').val('new');
		$('#deleteToken').hide();
		log(table.jsonSource);
	});
	
	$('.reload').unbind('click');
	$('.reload').click(function(){
		if (confirm('Are you sure you want to reload and loose all recent changes?')){
			document.location = document.location;
		}
	});
	$('.persist').unbind('click');
	$('.persist').click(function(){
		if (confirm('Are you sure you want to save and loose all previous changes?')){
			saveOptions($(this));
		}
	});
	$('.download').unbind('click');
	$('.download').click(function(){
		document.location = 'download.html';
	});
	
	
	$('#saveToken').unbind('click');
	$('#saveToken').click(function(){
		var crypto = {
			class: $('[name=class]').val(),
			amount: $('[name=amount]').val(),
			info: $('[name=info]').val(),
			addresses: []
		};
		$('[name=address]').each(function(){
			crypto.addresses.push({address: $(this).val()});
		});
		if ($('[name=action]').val()=='update'){
			var i = $('[name=index]').val();
			cryptos[i] = crypto;
		}else{
			cryptos.push(crypto);
			reloadCoins({cryptos: cryptos});
		}
		
		$('#entry').hide();
	});
	
	$('#saveContract').unbind('click');
	$('#saveContract').click(function(){
		var tokeni = $('[name=tokeni]').val();
		var altcoinj = $('[name=altcoinj]').val();
		var contract = {
				address: $('[name=contract]').val(),
				decimals: $('[name=altcoinDecimals]').val(),
				fsname: $('[name=fsname]').val(),
				info: $('[name=altcoinInfo]').val(),
				amount: $('[name=altcoinAmount]').val()
		};
		
		if ($('[name=bridge]').val()!=''){
			contract.bridgecoin = {
					class: $('[name=bridge]').val(),
					amount: $('[name=bridgeAmount]').val()
			}
		}
		
		if (tokeni!=''){
			if (!cryptos[tokeni].contracts){
				cryptos[tokeni].contracts = [];
			}
			if (altcoinj==''){
				//new
				cryptos[tokeni].contracts.push(contract);
				reloadCoins({cryptos: cryptos});
			}else{
				//update
				cryptos[tokeni].contracts[altcoinj] = contract;
			}
			$('#altcoin').hide();
		}else{
			log('no crypto to save the contract');
		}
		
	});
	
	$('#deleteContract').unbind('click');
	$('#deleteContract').click(function(){
		if (confirm('Are you sure to delete?')){
			var tokeni = $('[name=tokeni]').val();
			var altcoinj = $('[name=altcoinj]').val();
			
			if (tokeni!='' && altcoinj!=''){
				cryptos[tokeni].contracts.splice(altcoinj, 1);
				reloadCoins({cryptos: cryptos});
				$('#altcoin').hide();
			}
			
		}
		
	});


	$('#deleteToken').unbind('click');
	$('#deleteToken').click(function(){
		if (confirm('Are you sure to delete?')){
			if ($('[name=action]').val()=='update'){
				var i = $('[name=index]').val();
				cryptos.splice(i, 1);
				reloadCoins({cryptos: cryptos});
				$('#entry').hide();
			}
			
		}
		
	});
	$('.addAddress').unbind('click');
	$('.addAddress').click(function() {
		$('.block:last').before('<div class="block"><span class="delAddress">Remove Address</span></div>');
		var clone = $('[name=address]:last').clone();
		clone.val('');
		clone.prependTo($('.block:eq(' + ($('.block').length-2) + ')'));
	    
	});
	$('.optionBox').on('click','.delAddress',function() {
	 	$(this).parent().remove();
	});
}

function reloadExchanges(result){
	$('#exchanges').html('<h2>Exchanges</h2>');
	
	exchange('<ul>');
	for (var i=0; i<result.exchanges.length; i++){
		exchange('<li>' + (i+1) + ' - <a class="exchange" id="exchange_' + i + '" href="#">' + result.exchanges[i].class + '</a></li>');
	}
	exchange('</ul>');
	
	$('.exchange').unbind('click');
	$('.exchange').click(function(){
		$('.miniform').hide();
		$('#exchange').show();
		var index = $(this).attr('id').replace('exchange_', '');
		$('[name=xApiKey]').val(exchanges[index].api_key);
		$('[name=xApiPrvKey]').val(exchanges[index].private_key);
		$('[name=exchangei]').val(index);
		$('#deleteExchange').show();
	});
}

function output(text){
	$('#dashboard').append(text);
}

function exchange(text){
	$('#exchanges').append(text);
}

function log(text){
	$('#logger').append(text + "<br>");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
//document.querySelector("form").addEventListener("submit", saveOptions);