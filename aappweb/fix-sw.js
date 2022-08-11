var fs = require('fs');
var path = "../AAPPWebDeployment/public/ngsw-worker.js";

//Read in the service worker...
fs.readFile(path, "utf8", function(err, data) {
    if(err){
        console.error(err);
        return;
    }
    var regex = /onFetch\(event\) \{/g;
    var replacement = `onFetch(event) {
        //INJECTED TO FIX UPLOADS ON SAFARI
        if (event.request.url.indexOf('aapp-member-gallery.s3.us-east-2.amazonaws.com') > -1 || event.request.url.indexOf('aapp-instructors.s3.us-east-2.amazonaws.com') > -1 || event.request.url.indexOf('aapp-blogs.s3.us-east-2.amazonaws.com') > -1 || event.request.url.indexOf('aapp-class-materials.s3.us-east-2.amazonaws.com') > -1) { return; }
    `;

    var newData = data.replace(regex,replacement);
    fs.writeFileSync(path,newData,{encoding:'utf8',flag:'w'});
    console.log("Safari Service Worker fix applied.");

});