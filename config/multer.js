var fs = require('fs'),
    path = require('path');

var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dest = __dirname + '/../public/upl/' + req.params.course;
        fs.mkdir(dest, function (e) {
            if (e && e.code !== 'EEXIST') {
                console.log(e);
            } else {
                cb(null, dest);  
            }
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

module.exports = multer({ storage: storage });