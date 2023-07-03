var https = require('https');
var body = '';

var options = {
    headers: {
      'Authorization': 'Bearer lip_QRSo1o94PzkkLJXz1PEK'
    }
  };

https.get("https:/lichess.org/api/stream/event", options, function(res) {
  res.on('data', function(chunk) {
    body += chunk;
    console.log(chunk.toString());
  });
  res.on('end', function() {
    // all data has been downloaded
    console.log("END");
  });
});