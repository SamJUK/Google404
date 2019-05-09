var pdf = new (require('pdfkit'))({autoFirstPage: false});

// Write doc to file
var fs = require('fs');
pdf.pipe(fs.createWriteStream('output.pdf'));


var files = fs.readdirSync('./ss/').filter(e=>!['.DS_Store','.gitkeep','.','..'].includes(e));

let ogOffset = [10, 20];
let offset = ogOffset;
let docsize = null;
for(var i=0;i<files.length;i++) {
    var imgF = files[i];
    var img = pdf.openImage(`./ss/${imgF}`);
    if (i%4==0) {
        if(docsize === null) {
            docsize = [(img.width*2)+30, (img.height*2)+60];
        }
        console.log(`page ${docsize[0]}x${docsize[1]}`);
        pdf.addPage({size: docsize});
    }

    pdf.image(img, offset[0], offset[1]);
    console.log(`writing ${imgF} @ ${offset[0]}x${offset[1]}`);
    // pdf.text(imgF, offset[0], offset[1]+img.height+5, {align: 'center', width:img.width});

    offset[0] = (i%2==0) ? img.width + 15 : 10;
    offset[1] = (img.height * Math.floor((((i+1)%4))/2)) + 20;
}
pdf.end();
console.log('Finished Writing PDF');
