var request = require("request");

exports.classify = function(message){
    if (message === undefined || message === null) {
     message ='';
    }

    var data ={data:message};
    return new Promise(function(resolve, reject) {
        request.post({
          headers: {
            'Content-Type': 'application/json'
          }, 
          url:     'http://text-classify:3000/text-classify',
          json:   data
        }, function(error, response, body){
            console.log(body.classify);
            resolve(body);
        });
    });
}