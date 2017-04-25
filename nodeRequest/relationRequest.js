var dbService = require("../services/dbService.js");
var tokenService = require("../services/tokenService.js");
var fbService = require("../services/requestFbService.js");
var self = require('./relationRequest.js');

function likeDequy(id,url){
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var likeList = data.data;
            
            if (likeList.length ==0) {
                resolve('Empty list');
                return;
            }
            
            let tmp = likeList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                  dbService.createReaction(item,id,'LIKE').then((succ)=>{resolve();},(err)=>{reject(err);})
                }));
            }, Promise.resolve());
            
            tmp.then(() => {
                if(data.paging.next!=undefined)
                {
                    url = data.paging.next;
                    likeDequy(id,url).then((success)=>{
                        resolve(success);
                    },(fail)=>{
                        reject(fail);
                    });
                }
                else{
                    resolve('done in like de quy');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}
exports.getLikes = function(id){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/likes?limit=5000&summary=true' + '&access_token='+ token;
            likeDequy(id,url).then((succ)=>{
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
                        console.log(fail);
                        reject(fail);
                    }
                } 
                
            });
        },
        (error)=>{reject(error);})
    });
}

function reactionDequy(id,url){
    console.log('Get reactions ',id);
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var reactionList = data.data;
            
            if (reactionList.length ==0) {
                resolve('Empty list');
                return;
            }
            
            let tmp = reactionList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    var personData = {id:item.id,name:item.name};
                    //console.log(personData);
                    dbService.createReaction(personData,id,item.type).then((succ)=>{resolve();},(err)=>{reject(err);})
                }));
            }, Promise.resolve());
            
            tmp.then(() => {
                if(data.paging.next!=undefined)
                {
                    url = data.paging.next;
                    reactionDequy(id,url).then((success)=>{
                        resolve(success);
                    },(fail)=>{
                        reject(fail);
                    });
                }
                else{
                    resolve('done in reaction dequy');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}
exports.getReactions = function(id){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/reactions?limit=5000&summary=true' + '&access_token='+ token;
            reactionDequy(id,url).then((succ)=>{
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
                        console.log(fail);
                        reject(fail);
                    }
                } 
                
            });
        },
        (error)=>{reject(error);})
    });
}

function commentDequy(id,url,level){
    console.log('Get comment ',id);
    
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var commentList = data.data;
            
            if (commentList.length ==0) {
                resolve('Empty list');
                return;
            }
            
            
            
            let tmp = commentList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    //console.log(item);
                    var nodeData ={created_time:item.created_time,message:item.message,id:item.id};
                    var userData = item.from;
                    
                    
                    dbService.createNode(nodeData,'comment').then(()=>{
                        return dbService.createNode(userData,'user');
                    }).then(()=>{
                        return dbService.createCommentRelationship(userData.id,nodeData.id,id);
                    }).then(()=>{
                        if(level==1){
                            self.getComments(nodeData.id,2).then(()=>{
                                    return self.getLikes(nodeData.id);
                                });
                        }
                        else{
                            return new Promise(function(resolve,reject){resolve('Done in the box');})
                        }
                    }).then((succ)=>{resolve(succ);})
                    .catch((succ)=>{reject(succ);})
                       
                    
                    // dbService.createReaction(personData,id,item.type).then((succ)=>{resolve();},(err)=>{reject(err);})
                }));
            }, Promise.resolve());
            
            tmp.then(() => {
                if(data.paging.next!=undefined)
                {
                    url = data.paging.next;
                    commentDequy(id,url).then((success)=>{
                        resolve(success);
                    },(fail)=>{
                        reject(fail);
                    });
                }
                else{
                    resolve('done in comment de quy');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}

exports.getComments = function(id,level){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/comments?limit=100&summary=true' + '&access_token='+ token;
            
            commentDequy(id,url,level).then((succ)=>{
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
                        console.log(fail);
                        reject(fail);
                    }
                } 
                
            });
        },
        (error)=>{reject(error);})
    });
}
