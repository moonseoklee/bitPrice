
let sorterFlag = true;

$.tablesorter.addParser({ 
    // set a unique id 
    id: 'second',
    is: function(s) { 
        // return false so this parser is not auto detected 
        return false; 
    }, 
    format: function(s) {
        // format your data for normalization 
        
        return s.replace('원','').replace(/,/g,'');
    }, 
    // set type, either numeric or text 
    type: 'numeric' 
});  

$.tablesorter.addParser(
    { 
        // set a unique id 
        id: 'third',
        is: function(s) { 
            // return false so this parser is not auto detected 
            return false; 
        }, 
        format: function(s) {
            // format your data for normalization       
            
            return s.split('(')[1].split('%')[0];
        }, 
        // set type, either numeric or text 
        type: 'numeric' 
    }
);
$.tablesorter.addParser(
    { 
        // set a unique id 
        id: 'fourth',
        is: function(s) { 
            // return false so this parser is not auto detected 
            return false; 
        }, 
        format: function(s) {
            // format your data for normalization       
            
            return s.replace(' 만원','').replace(/,/g,'');
        }, 
        // set type, either numeric or text 
        type: 'numeric' 
    }
);



$(document).ready(function () {
    getData();    
    
    setInterval(getData,5000);
});

let choosen = "bithumb";

function toCommaStringF(number) { 
    var number_string = number.toString(); 
    var number_parts = number_string.split('.'); 
    var regexp = /\B(?=(\d{3})+(?!\d))/g; 
    if (number_parts.length > 1) { 
        return number_parts[0].replace(regexp, ',') + '.' + number_parts[1]; 
    }else { return number_string.replace(regexp, ','); } 


}



function getData() {
    
    if (choosen == "bithumb") {
        $.get({url:"https://api.bithumb.com/public/ticker/ALL"}, setData);
    } else if (choosen == "upbit") {
        $.get("https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-NEO,KRW-MTL,KRW-LTC,KRW-STRAT,KRW-XRP,KRW-ETC,KRW-OMG,KRW-SNT,KRW-WAVES,KRW-PIVX,KRW-XEM,KRW-ZEC,KRW-XMR,KRW-QTUM,KRW-GNT,KRW-LSK,KRW-STEEM,KRW-XLM,KRW-ARDR,KRW-KMD,KRW-ARK,KRW-STORJ,KRW-GRS,KRW-VTC,KRW-REP,KRW-EMC2,KRW-ADA,KRW-SBD,KRW-TIX,KRW-POWR,KRW-MER,KRW-BTG,KRW-ICX,KRW-EOS,KRW-STORM,KRW-TRX,KRW-MCO,KRW-SC,KRW-GTO,KRW-IGNIS,KRW-ONT,KRW-DCR,KRW-ZIL,KRW-POLY,KRW-ZRX,KRW-SRN,KRW-LOOM,KRW-BCH,KRW-ADT,KRW-ADX,KRW-BAT,KRW-IOST", setData);
    }else if(choosen=="coinone"){
        $.get('https://api.coinone.co.kr/ticker/?currency=ALL',setData);
    }else if(choosen=="bitfinex"){        
        $.get({url:'https://api.bitfinex.com/v2/tickers?symbols=ALL'},setBitfinex);
    }

}

function setBitfinex(data,status){
    let arr = {};
    let rate;
    for(let i=0;i<data.length;i++){  
        
        if(data[i][0].slice(data[i][0].length-3,data[i][0].length)=='USD' && data[i][0][0]=='t'){

        arr[data[i][0].slice(1,data[i][0].length-3)] = data[i];
        }
    }
    
    $.getJSON('https://api.exchangeratesapi.io/latest?base=USD')
    .done(function(data){
        arr['rate'] = data.rates.KRW;
    })
    
    
    setData(arr,status);
        
    
        
    
    
}





function setHtml(data,status){
    let coins;
    
    if(choosen=="bithumb"){
        coins = data.data;        
    }else{coins=data;}

    let html;
    let updatedAt;
    html = "<thead><tr>";
    html += "<th scope='col' width='12%'>코인</th><th scope='col' width='25%'>시세</th><th scope='col'>변동률 (%)</th><th scope='col' width='20%'>거래금액</th>";
    html += "</tr></thead><tbody>";
    
    for (coin in coins) {
        
        if (coin == "date") {
            updatedAt = coins[coin];
            continue;
        }
        if(choosen=="bithumb"){
        html += parseBithumb(coin, coins[coin]);
        }else if(choosen=="upbit"){
            html+=parseUpbit(coin,coins[coin]);
        }else if(choosen=="coinone"){
            if(coin!='errorCode' && coin!='result'&&coin!='timestamp'){                
            html+=parseCoinone(coin,coins[coin]);
        }
        }else if(choosen=="bitfinex"){
            html+=parseBitfinex(coin,coins[coin],coins['rate']);
        }
    }

    html += "</tbody>";

    return html;
}

function setData(data, status) {
    
    let html = setHtml(data,status);
    
    
    if(sorterFlag){      
        
        $('#price-data').html(html).tablesorter({
            headers:{
                1:{
                    sorter:'second'
                },
                2:{
                    sorter : 'third'
                }
            }
        }).trigger('update');
        sorterFlag = false;
    }
    else{    
         
        //$('#price-data').html(html).trigger('destroy')
        $('#price-data').html(html).trigger('updateAll',[true,]);
    }    

}


function parseBithumb(coin, data) {
    let price = toCommaStringF(Number(data.closing_price).toFixed(2));
    let diff = data.closing_price - data.opening_price;
    let ratio = (diff / data.opening_price * 100).toFixed(2);
    let trade = parseInt(data.units_traded * data.closing_price / 10000);
    let color;
    if (diff > 0)
        color = "red";
    else
        color = "blue";

    let html = "<tr><td scope='row' data-label='코인' class='center'>" + coin + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + color + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 만원 </td>";
    html += "</tr>";
    
    return html;
}

function parseUpbit(coin, data) {
    var price = parseInt(data.trade_price);
    var diff = data.trade_price - data.opening_price;
    var ratio = (diff / data.opening_price * 100).toFixed(2);
    var trade = parseInt(data.acc_trade_price_24h / 10000);
    var add_style;
    if (diff > 0)
        add_style = "red";
    else
        add_style = "blue";

    var html = "<tr><td scope='row' data-label='코인' class='center'>" + data.market.substr(4) + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + add_style + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 만원 </td>";
    html += "</tr>";
    return html;
}
function parseCoinone(coin, data) {
    
    let price = toCommaStringF(Number(data.last).toFixed(2));
    let diff = data.last - data.first;
    let ratio = (diff / data.first * 100).toFixed(2);
    let trade = parseInt(data.volume * data.last / 10000);
    let color;
    if (diff > 0)
        color = "red";
    else
        color = "blue";

    let html = "<tr><td scope='row' data-label='코인' class='center'>" + coin.toUpperCase() + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + color + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 만원 </td>";
    html += "</tr>";
    
    return html;
}

function parseBitfinex(coin,data,rate){
    console.log(data);
    let price = toCommaStringF(Number(data[7]*rate).toFixed(2));
    let diff = data.closing_price - data.opening_price;
    let ratio = (diff / data.opening_price * 100).toFixed(2);
    let trade = parseInt(data.volume * data.closing_price / 10000);
    let color;
    if (diff > 0)
        color = "red";
    else
        color = "blue";

    let html = "<tr><td scope='row' data-label='코인' class='center'>" + coin.toUpperCase() + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + color + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 만원 </td>";
    html += "</tr>";
    
    return html;
}
window.addEventListener(`dragover`, (evt = event) => {
    evt.preventDefault();
    evt.dataTransfer.effectAllowed = `none`;
    evt.dataTransfer.dropEffect = `none`;
}, false);


function tab_change(tab) {
    
    choosen = tab;
    getData();
}

document.addEventListener('DOMContentLoaded', function () {
    var bithumb = document.getElementById('bithumb');
    var upbit = document.getElementById('upbit');
    var coinone = document.getElementById('coinone');
    var bitfinex = document.getElementById('bitfinex');
    bithumb.onclick = function () { tab_change('bithumb'); }
    upbit.onclick = function () { tab_change('upbit'); }
    coinone.onclick = function () { tab_change('coinone'); }
    bitfinex.onclick = function () { tab_change('bitfinex'); }
});