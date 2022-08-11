const PDF = require('pdfkit');
const q = require('q');
const moment = require('moment');

module.exports = {
    application: Application,
    schedule: Schedule
}

function Schedule(res, classes, conference, name) {
   
    var title = name || 'AAPP Conference Classes';

    const deferred = q.defer();
    const startDate = moment(conference.startDateTime).tz(conference.timezone).format('MM/DD/YYYY');
    const endDate = moment(conference.endDateTime).tz(conference.timezone).format('MM/DD/YYYY');
    var doc = makeDoc(title, `${conference.city}, ${conference.state} (${startDate} - ${endDate})`);
    doc.on('end', (stream) => {
        return deferred.resolve(stream);
    })
    doc.pipe(res);

    classes.forEach((classevent)=>{
        doc.fontSize(14)
        .fillColor('darkblue')
        .text(classevent.name)
        .fillColor('darkred')
        .text(moment(classevent.startDateTime).tz(conference.timezone).format('dddd MM/DD/YYYY h:mm A') + ' - ' + moment(classevent.endDateTime).tz(conference.timezone).format('h:mm A'))
        .fontSize(12)
        .fillColor('black')
        .text(classevent.description);
        var instructors = '';
        for(var i=0; i < classevent.instructors.length; i++){
            const instructor = classevent.instructors[i].firstName + ' ' + classevent.instructors[i].lastName;
            if(i == 0){
                instructors = instructor;
            }else{
                instructors = instructors + ', ' + instructor;
            }
        }
        doc.text('Instructors: ' + instructors)
        .moveDown();
    });


    doc.end();

    

    return deferred.promise;
}

function Application(res, application) {

    const deferred = q.defer();

    var doc = makeDoc(`AAPP Member Application - ${application.user.lastName}`, `For ${application.user.fullname}`);
    doc.pipe(res);

    doc
    .text("APPLICANT",{underline:true});
    if(application.user.memberNumber){
        doc
        .text(`Member #: ${application.user.memberNumber}`);
    }
    doc
    .text(`${application.user.firstName} ${application.user.lastName}`)
    .text(application.user.email)
    .text(application.user.address.street1)
    .text(application.user.address.street2)
    .text(`${application.user.address.city}, ${application.user.address.state} ${application.user.address.zip || ''}`)
    .text(application.user.address.country)
    .text(`Cell: ${application.user.address.cellPhone}, Work: ${application.user.address.workPhone}`)
    .moveDown(1)
    .text(`Member Level: ${application.memberClass}`)
    .moveDown(1)

    .text(`Citizen: ${application.citizen? 'YES' : 'NO'}`)
    .text(`Is Licensed: ${application.isLicensed? 'YES': 'NO'}`)
    .text(`License Number: ${application.licenseNumber || 'N/A'}`)
    .text(`License List: ${application.licenseList || 'N/A'}`)
    .moveDown(1)
    .text("SCHOOL",{underline:true});
    if(application.school ){
        doc.text(application.school.name)
        .text(application.school.address.street)
        .text(`${application.school.address.city}, ${application.school.address.state}, ${application.school.address.zip}`)
        .text(application.school.address.country)
        .text(`Director: ${application.school.director}`)
        .text(`Phone: ${application.school.phone}`);
        
    }else if(application.schoolName){
        doc.text(application.schoolName)
        .text(application.schoolStreet)
        .text(`${application.schoolCity}, ${application.schoolState} ${application.schoolZip}`)
        .text(`Director: ${application.schoolDirector}`)
        .text(`Phone: ${application.schoolPhone}`);
    }
    doc.text(`Graduated: ${moment(application.graduationDate).format('MM/DD/YYYY')}`)
    .moveDown(1)
    .text("EXPERIENCE",{underline:true})
    .text(`Years Experience: ${application.yearsExperience || '0'}`)
    .text(`Exams Conducted: ${application.examsConducted || '0'}`)
    .text(`Techniques Used:  ${application.techniques}`)
    .text(`Other Organizations: ${application.otherOrgs}`)
    .text(`Has been denied membership: ${application.beenDenied? 'YES' : 'NO'}`);
    if(application.denialExplaination){
        doc.text(`Explanation: ${application.denialExplaination}`);
    }
    doc.moveDown(1)
    .text("EMPLOYMENT",{underline:true})
    .text(`Employment Status: ${application.employmentStatus}`)
    .text(`Agency: ${application.employmentAgency}`);

    if(application.employmentAddress){
        doc.text(application.employmentAddress.street1)
        .text(application.employmentAddress.street2)
        .text(`${application.employmentAddress.city}, ${application.employmentAddress.state} ${application.employmentAddress.zip}`)
        .text(application.employmentAddress.country)
        .text(`Phone: ${application.employmentAddress.workPhone}`);
    }

    doc.text(`Supervisor Name: ${application.supervisorName || 'None'}`)
    .text(`Supervisor Phone: ${application.supervisorPhone}`)
    .text(`Supervisor Email: ${application.supervisorEmail || 'Not Provided'}`)
    .text(`Seperation Date: ${application.seperationDate ? moment(application.seperationDate).format('MM/DD/YYYY') : 'N/A'}`)
    .text(`Seperation Type: ${application.seperationType || 'N/A'}`);

    doc.moveDown(1)
    .text("BACKGROUND",{underline:true})
    .text(`Convicted of a crime: ${application.convicted ? 'YES' : 'NO'}`)
    .text(`Discharged from Gov. Agency: ${application.dischargedGov ? 'YES' : 'NO'}`)
    .text(`Discharged from Organization: ${application.dischargedOrg ? 'YES' : 'NO'}`);
    
    if(application.ref1 && application.ref1.hasOwnProperty('name')){
    doc.moveDown(1)
    .text("REFERENCE 1",{underline:true})
    .text(application.ref1.name)
    .text(application.ref1.agency)
    .text(application.ref1.email)
    .text(application.ref1.phone);
    }
    if(application.ref2 && application.ref2.hasOwnProperty('name')){
        doc.moveDown(1)
        .text("REFERENCE 2",{underline:true})
        .text(application.ref2.name)
        .text(application.ref2.agency)
        .text(application.ref2.email)
        .text(application.ref2.phone);
        }
        if(application.ref3 && application.ref3.hasOwnProperty('name')){
            doc.moveDown(1)
            .text("REFERENCE 3",{underline:true})
            .text(application.ref3.name)
            .text(application.ref3.agency)
            .text(application.ref3.email)
            .text(application.ref3.phone);
            }
        var invoice = application.invoiceRef || {};

        doc.moveDown(1)
        .fontSize(10)
        .text(`Submitted: ${moment(application.created_at).format('MM/DD/YYYY')}, Paid: ${invoice.paid? 'YES' : 'NO'}, ${invoice.invoiceNumber? 'Invoice: '+invoice.invoiceNumber+',' : ''} Approved: ${application.finalApproved? 'YES': 'NO'}`);

    doc.end();

    doc.on('end', (stream) => {
        return deferred.resolve(stream);
    })

    return deferred.promise;

}



function makeDoc(title,subtitle) {
    var pageNumber = 1;
    var doc = new PDF({
        tile: title,
        margin: 50,
        size: [576, 792]
    });

    doc.fontSize(20)
        .image(__dirname + '/logo_white.jpg', 50, 50, { width: 100 })
        .text(title, 200, 60, { width: 276, align: 'center' })
        .fontSize(12)
        .text(subtitle, 200, 85, { width: 276, align: 'center' })
        .fontSize(10)
        .text(`(Page ${pageNumber}, Printed on ${moment().format('MM/DD/YYYY HH:mm')} EST)`, 200, 105, { width: 276, align: 'center' })
        .fontSize(12)
        .moveTo(50, 140)
        .lineTo(526, 140)
        .stroke()
        .text("", 50, 150,{width:476});

    

    doc.on('pageAdded', () => {
        pageNumber++;
        doc.fontSize(20)
        .image(__dirname + '/logo_white.jpg', 50, 50, { width: 100 })
        .text(title, 200, 60, { width: 276, align: 'center' })
        .fontSize(12)
        .text(subtitle, 200, 85, { width: 276, align: 'center' })
        .fontSize(10)
        .text(`(Page ${pageNumber}, Printed on ${moment().format('MM/DD/YYYY HH:mm')} EST)`, 200, 105, { width: 276, align: 'center' })
        .fontSize(12)
        .moveTo(50, 140)
        .lineTo(526, 140)
        .stroke()
        .text("", 50, 150,{width:476});

    });

    return doc;
}