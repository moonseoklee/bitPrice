/*var request = require('request');
request('https://api.bitfinex.com/v2/tickers?symbols=ALL', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  let arr = {};
  data = JSON.parse(body);
  for(let i=0;i<data.length;i++){        
    arr[data[i][0]] = data[i];
    
}

});*/
arr = {'rate':1}
console.log(arr['rate']);









