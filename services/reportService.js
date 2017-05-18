if (process.env.ELASTIC_URL === undefined || process.env.ELASTIC_URL === null) {
    console.error("Not found elastic url");
}
if (process.env.ELASTIC_USERNAME === undefined || process.env.ELASTIC_USERNAME === null) {
    console.error("Not found elastic user");
}
if (process.env.ELASTIC_PASSWORD === undefined || process.env.ELASTIC_PASSWORD === null) {
    console.error("Not found elastic password");
}

var elastic_url = process.env.ELASTIC_URL;
var elastic_user = process.env.ELASTIC_USERNAME;
var elastic_password = process.env.ELASTIC_PASSWORD;
var auth = "Basic " + new Buffer(elastic_user + ":" + elastic_password).toString("base64");

var request = require('request');

exports.requestElastic =function(data){
    request.post({
      headers: {
        'Content-Type': 'application/json',
        "Authorization" : auth
      }, 
      url:     elastic_url + '/fb_map',
      json:   data
    }, function(error, response, body){
        console.log('Report to elastic',body);
    });
}

exports.checkExist = function(id){
    var url = elastic_url + '/_search?q=id:'+id+'&pretty';
    return new Promise(function(resolve, reject) {
        request.get({
          headers: {
            'Content-Type': 'application/json',
            "Authorization" : auth
          }, 
          url: url
        }, function(error, response, body){
            if (!error && response.statusCode == 200){
                var result = JSON.parse(body);
                // console.log("Total ",typeof result.hits.total);
                if(result.hits.total===0){
                    resolve(false);
                }
                else{resolve(true);}
            }
            else{reject(error);}
        });
    });
}