var reportService = require("../services/reportService.js");
var commentCount = 0;

function createData(){
    var timeNow = new Date();
    var epochNow = Math.round(timeNow.getTime() / 1000);
    var data = {id:'123122222222',created_time:epochNow,comment:commentCount};
    reportService.requestElastic(data);
    console.log(commentCount);
    commentCount++;
}

setInterval(createData,1000);