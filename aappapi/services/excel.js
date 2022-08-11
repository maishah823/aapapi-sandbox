const xl = require('excel4node');
const moment = require('moment');


module.exports = {
    generateRegistrationReport:RegistrationReport,
    generateApplicationReport: ApplicationReport
}

function ApplicationReport(){

}
function RegistrationReport(attendees) {
    var workbookOptions = {
        jszip: {
            compression: 'DEFLATE'
        },
        defaultFont: {
            size: 12,
            name: 'Helvetica',
            color: '000000',
            bold: true
        }
    };
    var worksheetOptions = {
        'margins': {
            'bottom': 1,
            'top': 1,
            'left': 1,
            'right': 1
        },
        'printOptions': {
            'centerHorizontal': true,
            'printGridLines': false,
            'printHeadings': false,
        },
        'pageSetup': {
            'fitToHeight': 1,
            'fitToWidth': 1,
            'paperHeight': '11in',
            'paperWidth': '8.5in'

        },
        'sheetView': {
            'showGridLines': false
        }

    }

    var wb = new xl.Workbook(workbookOptions);
    var cellStyleCenter = wb.createStyle({ alignment: { horizontal: 'center' } });
    var cellStyleTitle = wb.createStyle({ alignment: { horizontal: 'center' }, font: { size: 20 } });
    var cellStyleRight = wb.createStyle({ alignment: { horizontal: 'right' } });
    var cellStyleBlack = wb.createStyle({
        alignment: { horizontal:'left' },
        font: {
            color: 'FFFFFF'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '000000'
        }

    })
    
    var report = wb.addWorksheet('Applications', worksheetOptions);
    //Columns
    report.column(1).setWidth(20);
    report.column(2).setWidth(12);
    report.column(3).setWidth(10);
    report.column(4).setWidth(10);
    report.column(5).setWidth(12);
    report.column(6).setWidth(10);


    //Report
    var row = 1
    report.cell(row, 1, row, 6, true).string('Conference Registrations').style(cellStyleTitle);
    row = row + 1;
    report.cell(row, 1, row, 6, true).string(`As of ${moment().format('MM/DD/YYYY HH:mm Z')}`).style(cellStyleCenter);
    row = row + 1;
    report.cell(row,1).string('Name').style(cellStyleBlack);
    report.cell(row,2).string('Reg Date').style(cellStyleBlack);
    report.cell(row,3).string('Approved').style(cellStyleBlack);
    report.cell(row,4).string('Member').style(cellStyleBlack);
    report.cell(row,5).string('Conference').style(cellStyleBlack);
    report.cell(row,6).string('Paid').style(cellStyleBlack);
    row = row + 1;
    attendees.forEach(attendee=>{
        report.cell(row,1).string(attendee.user.fullname);
        report.cell(row,2).string(moment(attendee.created_at).format('MM/DD/YYYY'));
        report.cell(row,3).string(attendee.finalApproved?'Yes':'No');
        report.cell(row,4).string(attendee.user.isMember?'Yes':'No');
        report.cell(row,5).string(attendee.conference.city);
        report.cell(row,6).string(attendee.invoiceRef.paid?'Yes':'No');

        row = row + 1;
    });
    
    return wb.writeToBuffer();

}







function reference(data) {
    //RETURNS PROMISE
    //     var workbookOptions = {
    //         jszip:{
    //             compression:'DEFLATE'
    //         },
    //         defaultFont: {
    //             size:16,
    //             name: 'Calibri',
    //             color: '000000',
    //             bold:true
    //         }
    //     };

    //     var worksheetOptions = {
    //         'margins':{
    //             'bottom': 1,
    //             'top': 1,
    //              'left':1,
    //              'right':1
    //         },
    //         'printOptions':{
    //             'centerHorizontal':true,
    //             'printGridLines':false,
    //             'printHeadings':false,
    //         },
    //         'pageSetup':{
    //             'fitToHeight':1,
    //             'fitToWidth':1,
    //             'paperHeight':'11in',
    //             'paperWidth':'8.5in'

    //         },
    //         'sheetView':{
    //             'showGridLines': false
    //         }

    //     }

    //     var wb = new xl.Workbook(workbookOptions);
    //     var cellStyleCenter = wb.createStyle({alignment:{horizontal:'center'}});
    //     var cellStyleTitle = wb.createStyle({alignment:{horizontal:'center'},font:{size:20}});
    //     var cellStyleRight = wb.createStyle({alignment:{horizontal:'right'}});
    //     var cellStyleBlack = wb.createStyle({
    //         alignment:{indent: 10},
    //         font:{
    //             color:'FFFFFF'
    //         },
    //         fill:{
    //             type:'pattern',
    //             patternType:'solid',
    //             bgColor:'000000'
    //         }

    //     })
    //     var cid = wb.addWorksheet('Criminal Investigations',worksheetOptions);
    //     cid.column(1).setWidth(30);
    //     cid.column(2).setWidth(30);
    //     var psd = wb.addWorksheet('Professional Standards', worksheetOptions);
    //     psd.column(1).setWidth(30);
    //     psd.column(2).setWidth(30);
    //     var other = wb.addWorksheet('Other', worksheetOptions);
    //     other.column(1).setWidth(30);
    //     other.column(2).setWidth(30);

    //     //CID
    //     var row = 1
    //     cid.cell(row,1,row,2,true).string('Criminal Investigations Division').style(cellStyleTitle);
    //     row = row + 1;
    //     cid.cell(row,1,row,2,true).string('Attendance for ' + moment().subtract(1,'day').format('MMM DD, YYYY')).style(cellStyleCenter);
    //     row = row + 1;
    //     Object.keys(result).filter(cidFilter).sort().forEach(
    //         shift=>{
    //             cid.cell(row,1,row,2,true).string(shift).style(cellStyleBlack);
    //             row = row + 1;
    //             Object.keys(result[shift]).sort().forEach(key=>{
    //                 cid.cell(row,1).string(key);
    //                 cid.cell(row,2).string(result[shift][key]).style(cellStyleRight);
    //                 row = row +1;
    //             })
    //         }
    //     )


    //     //PSD
    //     row = 1
    //     psd.cell(row,1,row,2,true).string('Professional Standards Division').style(cellStyleTitle);
    //     row = row + 1;
    //     psd.cell(row,1,row,2,true).string('Attendance for ' + moment().subtract(1,'day').format('MMM DD, YYYY')).style(cellStyleCenter);
    //     row = row + 1;
    //     Object.keys(result).filter(psdFilter).sort().forEach(
    //         shift=>{
    //             psd.cell(row,1,row,2,true).string(shift).style(cellStyleBlack);
    //             row = row + 1;
    //             Object.keys(result[shift]).sort().forEach(key=>{
    //                 psd.cell(row,1).string(key);
    //                 psd.cell(row,2).string(result[shift][key]).style(cellStyleRight);
    //                 row = row +1;
    //             })
    //         }
    //     )

    //      //PSD
    //      row = 1
    //      other.cell(row,1,row,2,true).string('Misc. Divisions - Flexible Shift').style(cellStyleTitle);
    //      row = row + 1;
    //      other.cell(row,1,row,2,true).string('Attendance for ' + moment().subtract(1,'day').format('MMM DD, YYYY')).style(cellStyleCenter);
    //      row = row + 1;
    //      Object.keys(result).filter(otherFilter).sort().forEach(
    //          shift=>{
    //              other.cell(row,1,row,2,true).string(shift).style(cellStyleBlack);
    //              row = row + 1;
    //              Object.keys(result[shift]).sort().forEach(key=>{
    //                  other.cell(row,1).string(key);
    //                  other.cell(row,2).string(result[shift][key]).style(cellStyleRight);
    //                  row = row +1;
    //              })
    //          }
    //      )


    //     return wb.writeToBuffer();
    //  }

    //  function cidFilter(key){
    //      switch(key){
    //         case 'Det - 1st Shift':
    //         case 'Det - 2nd Shift':
    //         case 'Conditions':
    //         case 'Special Services':
    //         case 'Youth Bureau':
    //         case 'Forensics':
    //         case 'Records':
    //          return true;
    //          default:
    //          return false;
    //      }

    //  }
    //  function psdFilter(key){
    //     switch(key){
    //         case 'Support Services':
    //         case 'Training':
    //         case 'Traffic':
    //          return true;
    //          default:
    //          return false;
    //      }

    //  }
    //  function otherFilter(key){
    //     switch(key){
    //         case 'Det - 1st Shift':
    //         case 'Det - 2nd Shift':
    //         case 'Conditions':
    //         case 'Special Services':
    //         case 'Youth Bureau':
    //         case 'Forensics':
    //         case 'Records':
    //         case 'Support Services':
    //         case 'Training':
    //         case 'Traffic':
    //          return false;
    //          default:
    //          return true;
    //      }
}