var tokenService = require("../services/tokenService.js");
var fbService = require("../services/requestFbService.js")
var nodeRequest = require('../nodeRequest/nodeRequest.js');
var relationRequest = require('../nodeRequest/relationRequest.js');
var dbService = require('../services/dbService.js');

function postDequy(id,url,limit){
    console.log(url);
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var commentList = data.data;
            var continueRecuision = true;
            
            if (commentList.length ==0) {
                resolve('Empty list');
                return;
            }
            
            let tmp = commentList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    nodeRequest.createNode(item.id,'post').then((succ)=>{resolve(succ)}).catch((err)=>{reject(err);console.log('error in ',err);});
                }));
            }, Promise.resolve());
            
            tmp.then(() => {
                if(data.paging.next!=undefined && continueRecuision)
                {
                    url = data.paging.next;
                    postDequy(id,url,limit).then((success)=>{
                        resolve(success);
                    },(fail)=>{
                        reject(fail);
                    });
                }
                else{
                    resolve('done');
                }    
            }).catch((err)=>{
                console.log('error here 60',err);
            });
        },(err)=>{reject(err)});    
    });
}

exports.crawlPosts = function(id,limit){
    
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/posts?limit=100&summary=true' + '&access_token='+ token;
            nodeRequest.createNode(id).then((succ)=>{
                console.log(succ);}).catch((err)=>{console.log(err);});
            postDequy(id,url,limit).then((succ)=>{
                resolve(succ);
            },(fail)=>{
                fail = JSON.stringify(fail);
    
                if(fail.indexOf('getaddrinfo') > -1) {
                    reject({status:'error',message:'lost connection'});
                }
                else{
                    if(fail.indexOf('Session has expired') > -1) {
                        reject({status:'error','message':{token:token}});       
                    }
                    else{
                        //console.log(fail);
                        reject(fail);
                    }
                } 
                
            });
        },
        (error)=>{
            //running out of token
            reject(error);
        });
    });
    
}

