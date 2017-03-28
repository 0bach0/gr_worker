var dbService = require("../services/dbService.js");
var tokenService = require("../services/tokenService.js");
var fbService = require("../services/requestFbService.js");
var self = require('./relationRequest.js');

function likeDequy(id,url){
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var likeList = data.data;
            // console.log(likeList);
            
            // for(var i=0;i<likeList.length;i++){
            //     dbService.createReaction(likeList[i],id,'LIKE').then((succ)=>{
            //         console.log(succ);
            //     },(err)=>{console.log(err);});
            // }
            
            // function asyncFunction (item, cb) {
            //   setTimeout(() => {
            //     console.log('done with', item);
            //     cb();
            //   }, 100);
            // }
            
            // let requests = [1, 2, 3].reduce((promiseChain, item) => {
            //     return promiseChain.then(() => new Promise((resolve) => {
            //       asyncFunction(item, resolve);
            //     }));
            // }, Promise.resolve());
            // requests.then(() => console.log('done'))
            
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
                    resolve('done');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}
exports.getLikes = function(id){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/likes?limit=5000' + '&access_token='+ token;
            likeDequy(id,url).then((succ)=>{
                console.log(succ);
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
        })
    });
}

function reactionDequy(id,url){
    console.log(url);
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var reactionList = data.data;
            
            let tmp = reactionList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    var personData = {id:item.id,name:item.name};
                    console.log(personData);
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
                    resolve('done');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}
exports.getReactions = function(id){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/reactions?limit=5000' + '&access_token='+ token;
            reactionDequy(id,url).then((succ)=>{
                console.log(succ);
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
        })
    });
}

function commentDequy(id,url,level){
    console.log(url);
    return new Promise(function(resolve,reject){
        fbService.requestFb(url).then((data)=>{
            data = JSON.parse(data);
            var commentList = data.data;
            
            let tmp = commentList.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    console.log(item);
                    var nodeData ={created_time:item.created_time,message:item.message,id:item.id};
                    var userData = item.from;
                    
                    dbService.createNode(nodeData,'comment').then(
                        (succ)=>{
                                dbService.createNode(userData).then((succ)=>{
                                    dbService.createCommentRelationship(userData.id,nodeData.id,id).then(
                                            (succ)=>{
                                                if(level==1){
                                                        self.getComments(nodeData.id,2).then((succ)=>{
                                                            self.getLikes(nodeData.id).then((succ)=>{
                                                                console.log('Done get data in level 2 ',nodeData.id);
                                                            },(err)=>{console.log(err);});
                                                        },(err)=>{console.log(err);});
                                                        resolve(succ);
                                                    }
                                                    else{
                                                        resolve(succ);
                                                    }
                                            },(err)=>{reject(err);}
                                        );
                                },
                                (err)=>{
                                    err = JSON.stringify(err.message);
                            
                                    console.log('here 1');
                                    if(err.indexOf('already exists with label') > -1) {
                                        dbService.createCommentRelationship(userData.id,nodeData.id,id).then(
                                            (succ)=>{
                                                if(level==1){
                                                        self.getComments(nodeData.id,2).then((succ)=>{
                                                            self.getLikes(nodeData.id).then((succ)=>{
                                                                console.log('Done get data in level 2 ',nodeData.id);
                                                            },(err)=>{console.log(err);});
                                                        },(err)=>{console.log(err);});
                                                        resolve(succ);
                                                    }
                                                    else{
                                                        resolve(succ);
                                                    }
                                            },(err)=>{reject(err);}
                                        );
                                    }
                                    else{
                                    reject(err);
                                    }
                                }
                                );
                        },
                        (err)=>{
                            err = JSON.stringify(err.message);
                            
                            console.log('here 1');
                            if(err.indexOf('already exists with label') > -1) {
                                console.log('here 2');    
                                dbService.createNode(userData).then((succ)=>{
                                    dbService.createCommentRelationship(userData.id,nodeData.id,id).then(
                                            (succ)=>{
                                                if(level==1){
                                                        self.getComments(nodeData.id,2).then((succ)=>{
                                                            self.getLikes(nodeData.id).then((succ)=>{
                                                                console.log('Done get data in level 2 ',nodeData.id);
                                                            },(err)=>{console.log(err);});
                                                        },(err)=>{console.log(err);});
                                                        resolve(succ);
                                                    }
                                                    else{
                                                        resolve(succ);
                                                    }
                                            },(err)=>{reject(err);}
                                        );
                                },
                                (err)=>{
                                    console.log('here 3');
                                    err = JSON.stringify(err.message);
                                    if(err.indexOf('already exists with label') > -1) {
                                        console.log('here 4');
                                        dbService.createCommentRelationship(userData.id,nodeData.id,id).then(
                                                (succ)=>{
                                                    if(level==1){
                                                        self.getComments(nodeData.id,2).then((succ)=>{
                                                            self.getLikes(nodeData.id).then((succ)=>{
                                                                console.log('Done get data in level 2 ',nodeData.id);
                                                            },(err)=>{console.log(err);});
                                                        },(err)=>{console.log(err);});
                                                        resolve(succ);
                                                    }
                                                    else{
                                                        resolve(succ);
                                                    }
                                                },(err)=>{reject(err);}
                                            );                                        
                                    }
                                    else{
                                        reject(err);
                                    }
                                }
                                );
                            }
                            else{    
                                reject(err);    
                            }
                        });
                    
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
                    resolve('done');
                }    
            })
        },(err)=>{reject(err)});    
    });
    
}

exports.getComments = function(id,level){
    var baseUrl="https://graph.facebook.com/v2.8/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/comments?limit=100' + '&access_token='+ token;
            commentDequy(id,url,level).then((succ)=>{
                console.log(succ);
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
        })
    });
}
