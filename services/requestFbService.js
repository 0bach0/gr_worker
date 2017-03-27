exports.requestFb =function(url){
    var request = require('request');
    
    return new Promise(function(resolve, reject) {
        request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            resolve(response.body);
        }
        else{
            if(error){
                reject(error);
            }
            else{
                reject(response.body);
            }
        }
        });        
    })
    
}

