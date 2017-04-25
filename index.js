var crawlPosts = require('./jobProcess/createData.js');

// var kue = require('kue');
// var jobs = kue.createQueue(
//         {redis:{
//             host: 'kue'
//         }}
//     ); 
// jobs.process('updatedata', function (job, done){
//     console.log(job.data);
    
//     switch (job.data.jobType) {
//         case 'update_feed':
//             var id = job.data.id;
//             var time_limit = job.data.timeLimit;
//             crawlPosts.crawlFeeds(id,time_limit,job).then((succ)=>{
//                 done();
//                 console.log(succ);
//             },
//                 (err)=>{
//                     console.log('error here',err.status);
//                     job.log('Error %s','av');
//                     done('Error token');
//                 });
//             break;
        
//         default:
//             // code
//     }
// });

//relationRequest.getComments('350006241681991_1735254759823792',1).then((succ)=>{console.log('done here',succ);},(err)=>{console.log('error here',err);});
//relationRequest.getReactions('350006241681991_1735254759823792').then((succ)=>{console.log('done here');},(err)=>{console.log('error here',err);});
//nodeRequest.createNode('952630044768087_1455693157795104').then((succ)=>{console.log(succ);},(err)=>{console.log(err);});
 crawlPosts.crawlPosts('1470174553229556',1).then(
    ()=>{return crawlPosts.crawlPosts('1471491439781390',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('1494801207455252',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('449542875117541',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('443475742343686',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('413368988854765',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('357321631058548',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('337787452991902',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('1677637749155310',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('160391583981664',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('363207983792559',1)}
    ).then(
    ()=>{return crawlPosts.crawlPosts('375483755834215',1)}
    ).catch((err)=>{console.log(err);})


