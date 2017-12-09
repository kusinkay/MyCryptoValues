/**
 *
 * C R Y P T O T A B L E
 * 
 */
var CryptoTable = function(ctObj){
	var that = {};
	that.cryptos = [];
	that.totalFiat = 0;
	
	that.availableCryptos = [
	                         "Bitcoin",
	                         "Ethereum",
	                         "Creativecoin",
	                         "Litecoin",
	                         "Neo",
	                         "Faircoin",
	                         "Dash",
	                         "Ripple"
	];
	
	that.converts = [];
	
	that.jsonSource;
	
	that.tmpLoad = function (file, callback){
		$.ajax({
			dataType: 'json',
			url: file,
			data: {format: 'json', callback: '?'},
			success: function(data){
				var cLoaded = false,
					aLoaded = false,
					output = {
						cryptos: [],
						apis: []
					};
				$.each( data, function( key, val ) {
					if (key=='cryptos'){
						for (var i=0; i<val.length; i++){
							//var crypto = that.getCryptoFromJson(val[i]);
							output.cryptos.push(val[i]);
						}
						cLoaded = true;
						if (cLoaded && aLoaded && typeof callback == 'function'){
							callback(output);
						}
					}
					if (key=='apis'){
						output.apis = val;
						aLoaded = true;
						if (cLoaded && aLoaded && typeof callback == 'function'){
							callback(output);
						}
					}
				});
			}
		});
	}
	

	that.loadData = function(data, callback){
		var xLoaded = 100000;
		var cLoaded = false;
		var apisLoaded = false;
		if (data.exchanges!=undefined){
			xLoaded = data.exchanges.length;
			for (var i=0; i<data.exchanges.length; i++){
				var exchange = that.getExchangeFromJson(data.exchanges[i]);
				exchange.getCryptos(function(cryptos){
					console.debug('cryptos from exchange gotten: ' + cryptos.length);
					if (cryptos!=undefined){
						for (var j=0; j<cryptos.length; j++){
							that.addCrypto(cryptos[j]);
						}
					}
					debugVar = that;
					xLoaded--;
					if (xLoaded==0 && cLoaded && apisLoaded && typeof callback == 'function'){
						callback();
					}
					
				});
			}
		}else{
			xLoaded=0;
		}
		if (data.apis!=undefined){
			console.debug('apis to load: ' + data.apis.length);
			that.apis = data.apis;
			apisLoaded = true;
			console.debug('apis loaded');
			if (xLoaded==0 && cLoaded && apisLoaded && typeof callback == 'function'){
				callback();
			}
		}else{
			apisLoaded = true;
		}
		if (data.cryptos!=undefined){
			console.debug('cryptos to load: ' + data.cryptos.length);
			for (var i=0; i<data.cryptos.length; i++){
				var crypto = that.getCryptoFromJson(data.cryptos[i]);
				that.addCrypto(crypto);
			}
			cLoaded = true;
			console.debug('cryptos loaded');
			if (xLoaded==0 && cLoaded && apisLoaded && typeof callback == 'function'){
				callback();
			}
		}
	}
	
	that.loadFile = function(file, callback){
		$.ajax({
			dataType: 'json',
			url: file,
			data: {format: 'json', callback: '?'},
			success: function(data){
				that.jsonSource = data;
				var xLoaded = 10000;
				var cLoaded = false;
				var apiLoaded = false;
				$.each( data, function( key, val ) {
					if (key=='exchanges'){
						xLoaded = val.length;
						for (var i=0; i<val.length; i++){
							var exchange = that.getExchangeFromJson(val[i]);
							exchange.getCryptos(function(cryptos){
								console.debug('cryptos from exchange gotten: ' + cryptos.length);
								if (cryptos!=undefined){
									for (var j=0; j<cryptos.length; j++){
										that.addCrypto(cryptos[j]);
									}
								}
								debugVar = that;
								xLoaded--;
								if (xLoaded==0 && cLoaded && apiLoaded && typeof callback == 'function'){
									callback();
								}
								
							});
						}
					}else if (key=='cryptos'){
						for (var i=0; i<val.length; i++){
							var crypto = that.getCryptoFromJson(val[i]);
							that.addCrypto(crypto);
						}
						cLoaded = true;
						if (xLoaded==0 && apiLoaded && typeof callback == 'function'){
							callback();
						}
					}else if (key=='apis'){
						that.apis = val;
						apiLoaded = true;
						if (xLoaded==0 && cLoaded && apiLoaded && typeof callback == 'function'){
							callback();
						}
					}
					
				});
			}
		});
	}
	
	that.getExchangeFromJson = function (json){
		switch(json.class){
			case 'Kraken': 
				return new Kraken(json);
				break;
		}
	}
	
	that.getCryptoFromJson = function(json){
		json.apis = that.apis;
		switch(json.class){
			case 'Bitcoin':
				return (new Bitcoin(json));
				break;
			case 'Ethereum':
				var crypto = new Ethereum(json);
				if (json.contracts!=undefined){
					for (var i=0; i<json.contracts.length; i++){
						var altcoin = json.contracts[i];
						if (altcoin.bridgecoin!=undefined){
							altcoin.bridgecoin = that.getCryptoFromJson(altcoin.bridgecoin);
							if (altcoin.bridgecoin.amount!=undefined && altcoin.bridgecoin.amount!=''){
								var expr = altcoin.bridgecoin.amount;
								if (expr.indexOf("/")>0){
									var parts = expr.split("/");
									if (parts.length>=2){
										altcoin.bridgecoin.amount = parseFloat(parts[0])/parseFloat(parts[1]);
									}
								}
								
							}
						}
						crypto.addAltCoin(altcoin);
					}
				}
				return (crypto);
				break;
			case 'Creativecoin':
				return (new Creativecoin(json));
				break;
			case 'Litecoin':
				return (new Litecoin(json));
				break;
			case 'Neo':
				return (new Neo(json));
				break;
			case 'Faircoin':
				return (new Faircoin(json));
				break;
			case 'Dash':
				return (new Dash(json));
				break;
			case 'Ripple':
				return (new Ripple(json));
				break;
				
		}
	}
	
	that.addCrypto = function(crypto){
		that.cryptos.push(crypto);
	}
	that.remaining = 0;
	that.onAllRendered = ctObj.complete;
	that.onOneRendered = ctObj.partial;
	that.onAllGathered = ctObj.completeGather;
	that.onOneGathered = ctObj.partialGather;
	
	
	that.render = function(){
		that._renderOrData(false);
	}
	
	that.gather = function (){
		that._renderOrData(true);
	}
	
	that._renderOrData = function(justdata){
		that.totalFiat = 0;
		that.justdata = justdata;
		that.remaining = that.cryptos.length;
		console.debug('[_renderOrData] ' + that.cryptos.length + ' cryptos');
		for (var i=0; i<that.cryptos.length; i++){
			var thisCrypto = that.cryptos[i];
			console.debug('[_renderOrData] crypto ' + i);
			thisCrypto.justdata = justdata;
			
			
			thisCrypto.getBalance(function(data){
				that.totalFiat += data[0].fiat;
				that.renderTotalFiat();
				that.converts.push(data[0]);
			});
			if (thisCrypto.getFsName()=='ethereum'){
				that.remaining += thisCrypto.contracts.length;
				for (var j=0; j<thisCrypto.contracts.length; j++){
					thisCrypto.getAltCoin(j, function(data){
						that.totalFiat += data[0].fiat;
						that.renderTotalFiat();
					});
				}
			}
		}
		//alert(that.totalFiat);
	}
	
	that.round = function(value, decimals){
		return that.cryptos[0].round(value, decimals);
	}
	
	that.renderTotalFiat = function(){
		if (!isNaN(that.totalFiat)){
			/*
			//alert(that.totalFiat);
			if ($('#cryptoTableTotalRow').length==0){
				$('#coincontainer').append('<tr id="cryptoTableTotalRow"><td id="cryptoTableTotalCell" colspan="30" style="align:right">' + (that.totalFiat) + '</td></tr>');
			}else{
				$('#cryptoTableTotalCell').html(that.totalFiat);
			}
			*/
		}
		that.remaining--;
		if (that.remaining==0){
			if (!that.justdata){
				if (typeof that.onAllRendered == 'function'){
					that.onAllRendered();
				}
			}else{
				if (typeof that.onAllGathered == 'function'){
					that.onAllGathered();
				}
			}
		}
		if (typeof that.onOneRendered == 'function'){
			that.onOneRendered({
				'remaining': that.remaining
			});
		}
		
	}
	
	return that;
}


/***********************************
 * 
 * EXTERNAL 
 * 
 */

var RemoteAPI = function(apispec){
	var that = {};
	that.key = apispec.key;
	that.pattern = apispec.pattern;
	
	that.getBalance = function(){
		console.error('RemoteAPI.getBalance must bu overriden');
	}
	
	return that;
}

var HtmlParserAPI = function(apispec){
	if (typeof spec!='object'){
		console.error('no specs for HtmlParserAPI')
	}else{
		that._getBalanceData = function(url, callback){
			
		}
	}
}

var CryptoidAPI = function(spec){
	if (typeof spec!='object'){
		console.error('no specs for CryptoidAPI')
	}else{
		spec.pattern = 'https://chainz.cryptoid.info/' + spec.fsname + '/api.dws';
		var that = RemoteAPI(spec);
		
		that.pattern = spec.pattern;
		
		that._getBalanceData = function(url, callback){
			if (that.crypto.amount!=undefined && that.crypto.amount!='' && (that.crypto.address==undefined || that.crypto.address=='')){
				that.crypto.convert(that.crypto.amount, callback, !that.justdata);
			}else{
				var data ={
						key: that.key
				};
				if (that.crypto.address!=undefined && that.crypto.address!=''){
					data.q = 'getbalance';
					data.a = that.crypto.address;
				}else if (that.crypto.addresses!=undefined ){
					data.q = 'multiaddr';
					var adds = [];
					for (var i=0; i<that.crypto.addresses.length; i++){
						adds.push(that.crypto.addresses[i].address);
					}
					data.active = adds.join('|');
				}
				$.ajax({
					url: url, 
					data: data, 
					crossDomain: true,
					success: function(result, txtStatus, xhr){
						
						if (data!=undefined){
							var value = 0;
							that.crypto.amount = undefined;
							if (data.a){
								value = result * 1;
							}else if (data.active){
								if (result.addresses){
									for (var i=0; i<result.addresses.length; i++){
										value += result.addresses[i].final_balance / 10**8;
									}
								}
							}
							that.crypto.convert(value, callback, !that.justdata);
						}else{
							
						}
					},
					error: function(){
						if (that.crypto.amount!=undefined && that.crypto.amount!=''){
							that.crypto.convert(that.crypto.amount, callback, !that.justdata);
						}
					},
					beforeSend: function(xhr){
						/*
						xhr.setRequestHeader('Access-Control-Allow-Origin', 'https://chainz.cryptoid.info');
						xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
						xhr.setRequestHeader('Content-Type', 'application/xml');
						*/
					}
				});
			}
		}
		
		return that;
	}
}


/********************************
 * 
 *  C R Y P T O S
 * 
 ********************************/

var Crypto = function (spec){
	var that = {};
	that.addresses = [];
	var outCur = 'EUR';
	var outCurSym = '€';
	
	spec.container = (spec.container!=undefined ? spec.container : '#coincontainer tbody');
	
	spec.outCur = outCur;
	spec.outCurSym = outCurSym;
	that.amount = spec.amount;
	that.address = spec.address;
	that.addresses = spec.addresses;
	that.coinfsname = spec.coinfsname;
	that.justdata = true;
	that.apis = spec.apis;
	that.pattern = spec.pattern;
	
	that.getBalance = function(callback){
		var pattern;
		if (that.pattern!=undefined){
			pattern = that.pattern;
		}else if (that.api!=undefined && that.api.pattern!=undefined){
			pattern = that.api.pattern;
		}else{
			console.error('No pattern specified for coin');
		}
		var url = pattern.replace(/{action}/g, 'balance').replace(/{address}/g, (spec.address!=undefined ? spec.address : '') );
		that._getBalanceData(url, callback);
	}
	
	that.getAmount = function(){
		return that.amount;
	}
	
	that.getApiKey = function(name){
		for (var i=0; i<that.apis.length; i++){
			if (that.apis[i].web==name){
				return that.apis[i];
			}
		}
	}
	
	that.render = function(data){
		data = (data==undefined ? spec.output : data);
		var output = data.price_eur * (data.bridge!=undefined ? (data.value * data.bridge.amount) : data.value);
		if (spec.webPattern!=undefined && spec.address!=undefined && spec.address!=''){
			data.url = spec.webPattern.replace(/{address}/g, spec.address).replace(/{contract}/g, data.contract);
		}
		if (!that.justdata){
			var bridgeInfo = (data.bridge!=undefined ? '' + (data.value * data.bridge.amount) + ' ' + data.bridge.coinfsname + "\n" : "");
			bridgeInfo += that.round(data.price_eur, 2) + '&euro;\n';
			var urlInfo = "";
			if (data.url!=undefined){
				urlInfo = '&nbsp;<a target="_blank" href="'+data.url+'">+</a>'
			}else if (that.addresses!=undefined){
				for(var i=0; i<that.addresses.length; i++){
					var url = spec.webPattern.replace(/{address}/g, that.addresses[i].address).replace(/{contract}/g, data.contract);
					urlInfo += '&nbsp;<a target="_blank" href="'+ url +'">+</a>'
				}
			}
			$(spec.container).prepend('<tr><td>'+ data.name + urlInfo +
				"</td>"+
				"<td><a href='#' title='" + bridgeInfo + "'>" + data.value + (that.amount!=undefined && that.amount!='' ? '(k)' : '') + "</td>"+
				"<td>" + data.percent_change_1h + "</td>"+
				"<td>" + data.percent_change_24h + "</td>"+
				"<td>" + data.percent_change_7d + "</td>"+
				"<td style='text-align:right' class='fiat'>" + that.round(output, 2) + spec.outCurSym + "</td></tr>");
		}
		return output;
	}
	
	that.round = function(value, decimals){
		return Math.round(value * 10**decimals) / 10**decimals;
	}
	
	that.output = function(html){
		$(spec.container).append(''+ html + "<br>");
	}
	
	that.getOutput = function(){
		return spec.output;
	}
	
	that.convert = function(value, callback, render){
		$.getJSON('https://api.coinmarketcap.com/v1/ticker/' + spec.coinfsname + '/?convert=' + spec.outCur, function(data){
			data[0].value = value;
			spec.output = data[0];
			data[0].fiat = that.render(data[0]);
			if (typeof( callback) == 'function'){
				callback(data);
			}
		});
	}
	
	that._getBalanceData = function(){
		throw "_getBalanceData must be overriden";
	}
	
	that.getAltCoin = function(currentIndex, callback){
		var currentAltCoin = that.contracts[currentIndex];
		if ((currentAltCoin.address==undefined || currentAltCoin.address=='')&& currentAltCoin.amount!=undefined && currentAltCoin.amount!=''){
			that._convertAltCoin(currentAltCoin, currentAltCoin.amount, callback);
		}else{
			var url = that.pattern.replace(/{action}/g, 'tokenbalance').replace(/{address}/g, spec.addresses[0].address);
			url = url.replace(/{contract}/g, currentAltCoin.address);
			{
				$.getJSON(url, function(data){
					if (data.error != undefined){
						
					}else{
						if(data.message == 'OK'){
							var ethers = data.result / 10**18;
							console.debug(that.contracts);
							that._convertAltCoin(currentAltCoin, ethers, callback);
						}
					}
				});
			}
		}
	}
	
	that._convertAltCoin = function (currentAltCoin, ethers, callback){
		var fsname = currentAltCoin.fsname;
		if (currentAltCoin.bridgecoin!=null){
			fsname = currentAltCoin.bridgecoin.coinfsname;
		}
		spec.webPattern = 'https://etherscan.io/token/{contract}?a={address}';
		$.getJSON('https://api.coinmarketcap.com/v1/ticker/' + fsname + '/?convert=' + outCur, function(data){
			data[0].value = ethers;
			if (currentAltCoin.bridgecoin!=null){
				data[0].name = currentAltCoin.fsname;
				data[0].bridge = currentAltCoin.bridgecoin;
			}
			data[0].contract = currentAltCoin.address;
			var fiat = that.render(data[0]);
			data[0].fiat = fiat;
			if (typeof callback=='function'){
				callback(data);
			}
		})
		.fail(function(){
			var fiat = that.render({'name' : currentAltCoin.fsname, 'price_eur': 0, 'value': ethers, 'percent_change_1h': '?', 'percent_change_24h': '?', 'percent_change_7d': '?'})
			data[0].fiat = fiat;
			if (typeof callback=='function'){
				callback(data);
			}
		});
		
	}
	
	that.getFsName = function(){
		return spec.coinfsname;
	}
	
	that.getContracts = function(){
		return that.contracts;
	}
	
	return that;
}

var Ethereum = function(spec){
	
	var endPointEtherScan = 'https://api.etherscan.io/api';	

	spec.coinfsname = 'ethereum';
	spec.webPattern = 'https://etherscan.io/address/{address}';
	var that = Crypto(spec);
	var etherscanAPIKey = that.getApiKey('etherscan').api_key;
	that.pattern = endPointEtherScan + '?module=account&action={action}&contractaddress={contract}&address={address}&tag=latest&apikey=' + etherscanAPIKey;
	
	that.className="Ethereum";
	that.contracts = [];
	that._getBalanceData = function(url, callback){
		var url = that.pattern.replace(/{action}/g, 'balance').replace(/{address}/g, (spec.addresses[0].address!=undefined ? spec.addresses[0].address : '') );
		
		if (spec.amount!=undefined && spec.amount!=''){
			that.convert(spec.amount, callback, !that.justdata);
		}else{
			$.getJSON(url, function(data){
				if(data.message == 'OK'){
					var ethers = data.result / 10**18;
					that.convert(ethers, callback, !that.justdata);
					
				}
				
			});
		}
	}
	
	that.addAltCoin = function(acSpec){
		that.contracts.push(acSpec);
	}
	return that;
}

var Bitcoin = function (spec){
	spec.coinfsname = 'bitcoin';
	spec.pattern = 'https://blockchain.info/q/addressbalance/{address}';
	spec.webPattern = 'https://blockchain.info/address/{address}';
	var that = Crypto(spec);
	that.className="Bitcoin";
	
	that._getBalanceData = function(url, callback){
		if (spec.amount!=undefined && spec.amount!=''){
			that.convert(spec.amount, callback, !that.justdata);
		}else{
			if (that.addresses!=undefined){
				var adds = [];
				for (var i=0; i<that.addresses.length; i++){
					adds.push(that.addresses[i].address);
				}
				url += adds.join('|');
			}
			$.getJSON(url, function(data){
				if (data!=undefined){
					var value = data / 10**8;
					that.convert(value, callback, !that.justdata);
					
				}
				
			});
		}
	}
	return that;
}

var Creativecoin = function (spec){
	spec.coinfsname = 'creativecoin';
	spec.api = new CryptoidAPI({fsname: 'crea', address:spec.address});
	spec.webPattern = 'https://chainz.cryptoid.info/crea/address.dws?{address}.htm';
	var that = Crypto(spec);
	spec.api.key = that.getApiKey('cryptoid').api_key;
	that.className="Creativecoin";
	
	that.api = spec.api;
	that.api.crypto = that;
	
	that._getBalanceData = function(url, callback){
			
		that.api._getBalanceData(url, callback);
		
	}
	return that;
}

var Litecoin = function (spec){
	spec.coinfsname = 'litecoin';
	spec.api = new CryptoidAPI({fsname: 'ltc', address:spec.address});
	spec.webPattern = 'https://chainz.cryptoid.info/ltc/address.dws?{address}.htm';
	var that = Crypto(spec);
	spec.api.key = that.getApiKey('cryptoid').api_key;
	that.className="Litecoin";
	
	that.api = spec.api;
	that.amount = spec.amount;
	that.api.crypto = that;
	
	that._getBalanceData = function(url, callback){
		
		that.api._getBalanceData(url, callback);
		
	}
	return that;	
}

var Dash = function (spec){
	spec.coinfsname = 'dash';
	spec.api = new CryptoidAPI({fsname: 'dash', address:spec.address});
	spec.webPattern = 'https://chainz.cryptoid.info/dash/address.dws?{address}.htm';
	var that = Crypto(spec);
	spec.api.key = that.getApiKey('cryptoid').api_key;
	that.className="Dash";
	
	that.api = spec.api;
	that.api.crypto = that;
	
	that._getBalanceData = function(url, callback){
			
		that.api._getBalanceData(url, callback);
		
	}
	return that;
}


var Neo = function (spec){
	spec.pattern = 'https://neoexplorer.co/addresses/{address}';
	spec.webPattern = 'https://neoexplorer.co/addresses/{address}';
	
	var that = Crypto(spec);
	that.className="Neo";
	
	that.convert = function(value, callback, render){
		$.getJSON('https://www.cryptopia.co.nz/api/GetMarkets/BTC', function(response){
			console.debug(response);
			if (response.Success){
				var parityUSDBTC = 1;
				var parityUSDEUR = 0.89;
				for (var i = 0; i<response.Data.length; i++){
					if (response.Data[i].Label == '$$$/BTC'){
						parityUSDBTC = response.Data[i].LastPrice * 1000;
					}else if (response.Data[i].Label == 'NEO/BTC'){
						console.debug(response.Data[i]);
						
						var data = [];
						data.push({});
						data[0].value = value;
						data[0].price_eur = response.Data[i].LastPrice / parityUSDBTC * parityUSDEUR;
						data[0].percent_change_1h = 0;
						data[0].percent_change_24h = 0;
						data[0].percent_change_7d = 0;
						data[0].name = 'Neo';
						spec.output = data[0];
						data[0].fiat = that.render(data[0]);
						if (typeof( callback) == 'function'){
							callback(data);
						}
						break;
					}
				}
				
			}
			
			
		});
	}
	
	that._getBalanceData = function(url, callback){
		url = that.pattern.replace(/{address}/g, (spec.addresses[0].address!=undefined ? spec.addresses[0].address : '') );
		$.get(url, function(data){
			$(data).find('.balance-list li a').each(function(){
				if ($(this).html().trim()=='NEO'){
					$(this).parent().find('strong').each(function(){
						var value = $(this).html().trim();
						console.debug(value);
						that.convert(value, callback, !that.justdata);
					});
					
				}
			});
			
		});
		
	}
	
	
	
	return that;
}

var Faircoin = function (spec){
	spec.pattern = 'https://chain.fair.to/address?address={address}';
	spec.webPattern = 'https://chain.fair.to/address?address={address}';
	
	var that = Crypto(spec);
	that.className="Faircoin";
	
	that.convert = function(value, callback, render){
		
						
		var data = [];
		data.push({});
		data[0].value = value;
		data[0].price_eur = 0.9;
		data[0].percent_change_1h = 0;
		data[0].percent_change_24h = 0;
		data[0].percent_change_7d = 0;
		data[0].name = 'Faircoin';
		spec.output = data[0];
		data[0].fiat = that.render(data[0]);
		if (typeof( callback) == 'function'){
			callback(data);
		}
			
			
	}
	
	
	that._getBalanceData = function(url, callback){
		url = that.pattern.replace(/{action}/g, 'balance').replace(/{address}/g, (spec.addresses[0].address!=undefined ? spec.addresses[0].address : '') );
		$.get(url, function(data){
			$(data).find('h3 font.stats:eq(1)').each(function(){
				var value = $(this).html().trim();
				console.debug(value);
				that.convert(value, callback, !that.justdata);
			});
			
		});
		
	}
	
	
	
	return that;
}

var Monero = function (spec){
	//https://moneroexplorer.com/
	//https://chainradar.com/xmr/blocks
	spec.coinfsname = 'monero';
	var that = new Crypto(spec);
	that.className="Monero";
	
	return that;
}

var Ripple = function (spec){
	//https://ripple.com/build/data-api-tool/
	//https://ripplewallet.pro/ per crear una adreça i la seva clau privada
	
	spec.pattern = 'https://data.ripple.com/v2/accounts/{address}/balances';
	spec.webPattern = 'https://data.ripple.com/v2/accounts/{address}/balances';
	spec.coinfsname = 'ripple';
	
	var that = new Crypto(spec);
	that.className="Ripple";
	
	that._getBalanceData = function(url, callback){
		url = that.pattern.replace(/{address}/g, (spec.addresses[0].address!=undefined ? spec.addresses[0].address : '') );
		
		$.get(url, function(data){
			if (data.result=='success'){
				var value = data.balances[0].value;
				that.convert(value, callback, !that.justdata);
			}
			
			
		});
		
	}
	
	return that;
}

var Euro = function(spec){
	spec.pattern = '';
	var that = new Crypto(spec);
	
	that.convert = function(value, callback, render){
				
		var data = [];
		data.push({});
		data[0].value = value;
		data[0].price_eur = 1;
		data[0].percent_change_1h = 0;
		data[0].percent_change_24h = 0;
		data[0].percent_change_7d = 0;
		data[0].name = 'Euro';
		spec.output = data[0];
		data[0].fiat = that.render(data[0]);
		if (typeof( callback) == 'function'){
			callback(data);
		}
	}
	that._getBalanceData = function(url, callback){
		that.convert(spec.amount, callback, !that.justdata);
	}
	return that;
}

/*********************************
 * 
 * EXCHANGES
 * 
 ********************************/
var Exchange = function (spec){
	var that = {};
	return that;
}

var Kraken = function (spec){
	var that = new Exchange(spec);
	that.api_key = spec.api_key;
	that.private_key = spec.private_key;
	
	that.version = '0';
	that.url = 'https://api.kraken.com';
	
	
	that.QueryPrivate = function(method, post_data, ok, reject)
	{
    	if(!that.private_key || !that.api_key)
        {
            console.error('NO API OR PRIVATE KEY');
            return reject();
        }
        /* Locale vars */
        var nonce = that.getNonce();
        var path = '/' + that.version + '/private/' + method;
        if(!post_data)
        {
            post_data+= '&nonce='+nonce;
        }
        else
        {
            post_data = 'nonce='+nonce;
        }

        var tosign = new jsSHA("SHA-256", "TEXT");
        tosign.update(nonce+''+post_data);
        var tosign_value = tosign.getHash("B64");

        var sign = new jsSHA("SHA-512", "B64");
        sign.setHMACKey(that.private_key, "B64");
        sign.update(btoa(path));
        sign.update(tosign_value);

        var sign_value = sign.getHMAC("B64");

        var xhr = new XMLHttpRequest;
        xhr.open( "POST", that.url+path, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.addEventListener("error", reject);
        xhr.addEventListener("load", function(){
            try
            {
                ok(JSON.parse(this.responseText));
            }
            catch(err)
            {
                reject();
            }
        });
        xhr.setRequestHeader('API-Key', that.api_key);
        xhr.setRequestHeader('API-Sign', sign_value);
        xhr.send(post_data);
	}
	
	that.getCryptos = function(callback){
		var cryptos = [];
		that.QueryPrivate('Balance', false, function(r_balance){
			console.debug(r_balance);
			if (r_balance.error.length==0 ){
				console.debug('no errors on balance: callback=' + typeof callback);
				for(var key in r_balance.result) {
					if (r_balance.result.hasOwnProperty(key)) {
		                var value = r_balance.result[key];
		                
		                // Do not fetch data if irrelevant amount owned
		                if(value>0.000001)
		                {
		                	console.debug('exchange coin: ' + key + '=' + value);
				            
		                	var jsonc = {"amount": value, "address": ""};
		                	switch(key){
			                	case "XXBT": cryptos.push(new Bitcoin(jsonc));
	                				break;
			                	case "XLTC": cryptos.push(new Litecoin(jsonc));
	                				break;
			                	case "XETH": cryptos.push(new Ethereum(jsonc));
                					break;
			                	case "ZEUR": cryptos.push(new Euro(jsonc));
            						break;
			                	case "DASH": cryptos.push(new Dash(jsonc));
            						break;
		                	}
		                }
		            }
		        }
				if (typeof callback=='function'){
					console.debug('getCryptos callback');
					callback(cryptos);
				}
				
			}
		},
		function(){/*reject*/});
	}
	
	
	that.getNonce = function()
	{
	    var date = (new Date()).getTime()+'';
	    var rand1 = Math.ceil(Math.random()* 100000)+'';
	    var rand2 = Math.ceil(Math.random()* 100000)+'';

	    var noncet = date+rand1+rand2+rand1+rand2;
	    return (noncet).substr(0,16);
	}

	
	return that;
}

