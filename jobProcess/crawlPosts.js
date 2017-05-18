var tokenService = require("../services/tokenService.js");
var fbService = require("../services/requestFbService.js");
var reportService = require("../services/reportService.js");
var textClassify = require("../services/textClassify.js");


function postDequy(id,url,limit){
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
                    if(continueRecuision){
                        var myDate = new Date(item.created_time);
                        console.log(item.created_time);
                        var postTime = Math.round(myDate.getTime() / 1000);
                        
                        limit = parseInt(limit);
                        
                        if(postTime<limit){
                            continueRecuision = false;
                            resolve();
                        }
                        else{
                            var timeNow = new Date();
                            var epochNow = Math.round(timeNow.getTime() / 1000);
                            console.log(item.id);
                            var dataElastic = {
                                id:item.id,
                                created_time: postTime,
                                from_id: item.from.id,
                                from_name: item.from.name,
                                message:item.message
                            }
                            
                            reportService.checkExist(item.id).then((exist)=>{
                                if(!exist){
                                    return textClassify.classify(item.message);
                                }
                                else{
                                    continueRecuision = false;
                                    resolve();}
                            }).then( (data)=>{
                                if(data === undefined){
                                    continueRecuision = false;
                                    resolve();
                                }
                                else{
                                    console.log('Data here ',data);
                                    dataElastic.type = data.type;
                                    dataElastic.type_text = data.classify;
                                    reportService.requestElastic(dataElastic);    
                                    resolve();
                                }
                            })
                            .catch((err)=>{console.log("Error in process",err)});
                            
                            // textClassify.classify(item.message).then((data)=>{
                            //     dataElastic.type = data.type;
                            //     dataElastic.type_text = data.classify;
                            //     return reportService.checkExist(item.id);
                                
                            // })
                            // .then((exist)=>{
                            //     if(!exist){
                            //         reportService.requestElastic(dataElastic);    
                            //         resolve();
                            //     }
                            //     else{resolve();}
                            // })
                            // .catch((err)=>{console.log("Error in classify",err)});
                            
                        }
                    }
                    else{
                        resolve();
                    }
                    
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
    
    var baseUrl="https://graph.facebook.com/v2.9/";
    
    return new Promise(function(resolve, reject) {
        tokenService.getToken().then((token)=>{
            var url = baseUrl + id +'/posts?limit=100&fields=id,created_time,from,message';
            url += '&access_token='+ token;
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

