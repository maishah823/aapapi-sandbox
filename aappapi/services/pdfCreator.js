var fillPdf = require('fill-pdf');
var q = require('q');

module.exports = {
    generateCert: GenerateCert
};

function GenerateCert(data){
    var formPath = '/forms/checkout.pdf';
    var deferred = q.defer();
    var timer = setTimeout(()=>{
        deferred.reject("PDF Generator Timeout");
    },8000);
    try{
        fillPdf.generatePdf(data, formPath, ['flatten'], function(err,output){
            clearTimeout(timer);
            if(err){
                deferred.reject(err);
            }else{
                if(!output){
                    deferred.reject("No file");
                }else{
                    deferred.resolve(output);
                }
            }
        });
    }catch(e){
        clearTimeout(timer);
        deferred.reject(e);
    }

    return deferred.promise;
}