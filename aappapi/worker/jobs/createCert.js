
const pdf = require('../../services/pdfCreator');

function create(data,done){
    pdf.generateCert(data)
    .then(function(output){
        //TODO: SEND EMAIL WITH OUPUT
        console.log("Sending email with Cert File");
        done();
    })
    .catch(function(err){
        console.error('EMAIL CERT: ',err);
    });
}

module.exports = create;