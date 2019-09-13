let sorterFlag = true;
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
        $.get("https://api.bithumb.com/public/ticker/ALL", setData);
    } else if (choosen == "upbit") {
        $.get("https://api.upbit.com/v1/ticker?markets=KRW-BTC,KRW-NEO,KRW-MTL,KRW-LTC,KRW-STRAT,KRW-XRP,KRW-ETC,KRW-OMG,KRW-SNT,KRW-WAVES,KRW-PIVX,KRW-XEM,KRW-ZEC,KRW-XMR,KRW-QTUM,KRW-GNT,KRW-LSK,KRW-STEEM,KRW-XLM,KRW-ARDR,KRW-KMD,KRW-ARK,KRW-STORJ,KRW-GRS,KRW-VTC,KRW-REP,KRW-EMC2,KRW-ADA,KRW-SBD,KRW-TIX,KRW-POWR,KRW-MER,KRW-BTG,KRW-ICX,KRW-EOS,KRW-STORM,KRW-TRX,KRW-MCO,KRW-SC,KRW-GTO,KRW-IGNIS,KRW-ONT,KRW-DCR,KRW-ZIL,KRW-POLY,KRW-ZRX,KRW-SRN,KRW-LOOM,KRW-BCH,KRW-ADT,KRW-ADX,KRW-BAT,KRW-IOST", setDataUpbit);
    }

}

function setData(data, status,) {

    let coins = data.data;
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
        html += parseBithumb(coin, coins[coin]);
    }

    html += "</tbody>";
    
    if(sorterFlag){
        console.log('true');
        $('#price-data').html(html).tablesorter();
        sorterFlag = false;
    }
    else{
        console.log('false');
        $('#price-data').html(html).trigger('destroy');
        $('#price-data').html(html).tablesorter();
    }
    
    
    
    
    
    

}

function setDataUpbit(data, status) {
    var coins = data;
    var html;
    html = "<table border=1><thead><tr>";
    html += "<th scope='col' width='12%'>코인</th><th scope='col' width='25%'>시세</th><th scope='col'>변동률 (%)</th><th scope='col' width='20%'>거래금액</th>";
    html += "</tr></thead><tbody>";

    for (coin in coins) {
        html += parseUpbit(coin, coins[coin]);
    }

    html += "</tbody></table>";
    let price = $("#price-data");
    price.html(html);
}


function parseBithumb(coin, data) {
    let price = toCommaStringF(Number(data.closing_price).toFixed(2));
    let diff = data.closing_price - data.opening_price;
    let ratio = (diff / data.opening_price * 100).toFixed(2);
    let trade = parseInt(data.units_traded * data.closing_price / 100000000);
    let color;
    if (diff > 0)
        color = "red";
    else
        color = "blue";

    let html = "<tr><td scope='row' data-label='코인' class='center'>" + coin + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + color + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 억원 </td>";
    html += "</tr>";
    
    return html;
}

function parseUpbit(coin, data) {
    var price = parseInt(data.trade_price);
    var diff = data.trade_price - data.opening_price;
    var ratio = (diff / data.opening_price * 100).toFixed(2);
    var trade = parseInt(data.acc_trade_price_24h / 100000000);
    var add_style;
    if (diff > 0)
        add_style = "red";
    else
        add_style = "blue";

    var html = "<tr><td scope='row' data-label='코인' class='center'>" + data.market.substr(4) + "</td>";
    html += "<td data-label='시세' class='right'>" + price.toLocaleString() + " 원 </td>";
    html += "<td data-label='변동률 (%)' class='right " + add_style + "'>" + diff.toLocaleString() + " 원 (" + ratio + "%)</td>";
    html += "<td data-label='거래금액' class='right'>" + trade.toLocaleString() + " 억원 </td>";
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
    bithumb.onclick = function () { tab_change('bithumb'); }
    upbit.onclick = function () { tab_change('upbit'); }
});