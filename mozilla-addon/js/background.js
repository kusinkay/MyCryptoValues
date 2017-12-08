/**
 * 
 */
var browser = browser || chrome;

browser.alarms.onAlarm.addListener(run);
browser.alarms.create('update', {periodInMinutes: 1 });

var cryptos,
	apis,
	exchanges;

var debugVar;

function getConf(){
	var g1 = new Promise(function(ok,  reject)
    {
        browser.storage.local.get("cryptos",function(result)
        {
            if(!result || !result.cryptos) {
            	console.debug('could not load background storage');
            	
            }else{
	            console.debug('loading cryptos from storage');
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
            	console.debug('could not load background storage apis');
            	
            }else{
	            console.debug('loading apis from storage');
	            apis = result.apis;
	            ok();
            }
        });
    });
	var g3 = new Promise(function(ok,  reject)
    {
        browser.storage.local.get("exchanges",function(result)
        {
            if(!result || !result.exchanges) {
            	console.debug('could not load background storage exchanges');
            	
            }else{
	            console.debug('loading exchanges from storage');
	            exchanges = result.exchanges;
            }
            ok();
        });
    });
	return Promise.all([g1, g2, g3]);
}

async function run(){
	var table = new CryptoTable({
		'completeGather': function(){
			var color = '#4e9b4e';
			if (!localStorage.getItem('evolution')){
				color = '#000000';
				console.debug('no history');
			}else{
				var last = localStorage.getItem('evolution');
				
				if (last>table.totalFiat){
					color = '#e12b2b';
				}
				
			}
			localStorage.setItem('evolution', table.totalFiat);
			
			browser.browserAction.setBadgeBackgroundColor({color:color});
			var value4chars = table.totalFiat;
			if (table.totalFiat>=10000){
				value4chars = table.totalFiat/1000 + '';
				value4chars = value4chars.split('.').join('K');
			}if (table.totalFiat>=1000000){
				value4chars = table.totalFiat/1000000 + '';
				value4chars = value4chars.split('.').join('M');
			}
		    browser.browserAction.setBadgeText({text: "" + value4chars });
		    browser.browserAction.setTitle({title:table.totalFiat+""});
		    
		    
		    
		}
	});
	
	await getConf();
	var result = {
		cryptos: cryptos,
		apis: apis,
		exchanges: exchanges
	};
	table.loadData(result, function(){
		table.gather();
	});
    
}

run();