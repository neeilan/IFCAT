var fs = require('fs');

var csv = require('csv'),
    _ = require('lodash');

var Course = require('../models/course'),
    Tutorial = require('../models/tutorial');

// Import list of students for course
exports.importStudents = function (req, res) { 
    var output = [];
    var parser = csv.parse({ delimiter: ',' });

    parser.on('readable', function() {
        while (record = parser.read()) {
            output.push(record);
        }
    });

    parser.on('error', function (err) {
        console.log(err.message);
    });

    parser.on('finish', function () {
        console.log(output);
    });

    parser.end();
};

// Retrieve list of students for course
exports.getStudentsByCourse = function (req, res) { 
    Course.populate(req.course, [{
        path: 'tutorials'
    }, { 
        path: 'students', 
        options: { 
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }], function (err, course) {
        // add tutorial #'s of students
        course.students = _.map(course.students, function (student) { 
            student.tut = null;
            _.forEach(course.tutorials, function (tutorial) {
                if (tutorial.students.indexOf(student.id) !== -1) {
                    student.tut = tutorial.getTUT();
                    return;
                }
            });
            return student;
        });

        res.render('admin/course-students', { course: req.course });
    }); 
};

// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) { 
    Tutorial.populate(req.tutorial, { 
        path: 'students', options: { sort: { 'name.first': 1 } }
    }, function (err) {
        res.render('admin/students', { course: req.course, tutorial: req.tutorial });
    }); 
};


// EVERYTHING BELOW IS ALL WRONG: go top-down only!

exports.addStudentInCourse = function (req, res) { 
    async.series([
        function (cb) { 
            req.course.push(req.student.id);
            req.course.save(cb);
        },
        function (cb) {
            req.student.push(req.course.id);
            req.student.save(cb);
        }
    ],
    function (err, results) {

    });
};

// Add student in tutorial
exports.addStudentInTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            req.tutorial.push(req.student.id);
            req.tutorial.save(cb);
        },
        function (cb) {
            req.student.push(req.tutorial.id);
            req.student.save(cb);
        }
    ],
    function (err, results) {

    });
};

exports.addStudentInGroup = function (req, res) { 
    async.series([
        function (cb) { 
            req.group.push(req.student);
            req.group.save(cb);
        },
        function (cb) {
            req.student.push(req.group);
            req.student.save(cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete student from course
exports.deleteStudentFromCourse = function (req, res) { 
    async.series([
        function (cb) { 
            req.course.pull(req.student.id);
            req.course.save(cb);
        },
        function (cb) {
            req.student.pull(req.course.id);
            req.student.save(cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete student from tutorial
exports.deleteStudentFromTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            req.tutorial.pull(req.student.id);
            req.tutorial.save(cb);
        },
        function (cb) {
            req.student.pull(req.tutorial.id);
            req.student.save(cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete student from group
exports.deleteStudentFromGroup = function (req, res) { 
    async.series([
        function (cb) { 
            req.group.pull(req.student.id);
            req.group.save(cb);
        },
        function (cb) {
            req.student.pull(req.group.id);
            req.student.save(cb);
        }
    ],
    function (err, results) {
        
    });
};