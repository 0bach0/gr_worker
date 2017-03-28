var baseUrl="https://graph.facebook.com/v2.8/";
var nodeRequest = require('./nodeRequest/nodeRequest.js');
var relationRequest = require('./nodeRequest/relationRequest.js');
var dbService = require('./services/dbService.js');

//relationRequest.getComments('1455693157795104',1).then((succ)=>{console.log('done here',succ);},(err)=>{console.log('error here',err);});
//relationRequest.getReactions('1455693157795104').then((succ)=>{console.log('done here',succ);},(err)=>{console.log('error here',err);});
nodeRequest.createNode('322844167911209').then((succ)=>{console.log(succ);},(err)=>{console.log(err);});

//331230823580420_1362327460470746 11k react, 700 comments


//dbService.demo();
