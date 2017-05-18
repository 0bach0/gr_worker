var tokenRequest = require('../services/requestFbService.js');
exports.getToken = function(){
    return new Promise(function(resolve, reject) {
        tokenRequest.requestFb('http://token-manager:3000/token').then((succ)=>{
            succ = JSON.parse(succ);
            resolve(succ.message.access_token);
        }).catch((err)=>{
            console.log('Error in get token',err);
            reject(err);
        });
        
    });
}