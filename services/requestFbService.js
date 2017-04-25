function requestFb(url){
    var request = require('request');
    
    return new Promise(function(resolve, reject) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(response.body);
            }
        });          
            
            
    })
}

exports.requestFb =function(url){
    console.log('Load ',url);
    var request = require('request');
    
    return new Promise(function(resolve, reject) {
        
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(response.body);
            }
            else{
                return requestFb(url);
            }
        });          
            
            
    })
    
}

