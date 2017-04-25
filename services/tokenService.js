var tokenRequest = require('../services/requestFbService.js');
exports.getToken = function(){
    return new Promise(function(resolve, reject) {
        tokenRequest.requestFb('http://tokenmanager:3000/gettoken').then((succ)=>{
            succ = JSON.parse(succ);
            resolve(succ.access_token);
        }).catch((err)=>{
            console.log('Error in get token',err);
            reject(err);
        });
        
    });
}