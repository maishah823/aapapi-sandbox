const email = require('../../services/emailSvc');

module.exports = (payload,done)=>{

    const message = `This is notification that ${payload.firstName} ${payload.lastName} has updated their ${payload.type}. 
    \n\nThe quickbooks customer, ${payload.firstName} ${payload.lastName} (${payload.email}), has been updated in Quickbooks.`;
    console.log(`${payload.firstName} ${payload.lastName} has updated their ${payload.type}`);
    email.sendGeneralEmail([{email:'nom@policepolygraph.org',name:'AAPP NOM'}],message,'User updated information.','01001000 01000001 01001100');

    done();
}