var crawlPosts = require('./jobProcess/crawlPosts.js');

var kue = require('kue');
var jobs = kue.createQueue(
        {redis:{
            host: 'jobqueue-db'
        }}
    ); 
    
jobs.process('page', function (job, done){
    console.log(job.data);
    var id = job.data.id;
    var time_limit = job.data.time_limit;
    crawlPosts.crawlPosts(id,time_limit,job).then((succ)=>{
      done();
      console.log(succ);
    },
    (err)=>{
        console.log('error here',err.status);
        job.log('Error %s','av');
        done('Error token');
    });
});

