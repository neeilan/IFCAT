// Get list of students for course
exports.getStudentsByCourse = function (req, res) { 
    /*Course.findById(req.params.course).populate('{
        path: 'students'
    }).exec(function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve any students at this time (" + err.message + ").");
        }
        res.status(200).send(course.students);
    });*/
};

// Import list of students for course
exports.importStudents = function (req, res) { 

};

// Retrieve list of students for tutorial
exports.getStudentsByTutorial = function (req, res) { 
    async.series([
        function (cb) {
            Course.findById(req.params.course, cb);
        },
        function (cb) {
            Tutorial.findById(req.params.tutorial).populate({ path: 'students', options: { sort: { name: 1 } } }).exec(cb);
        }
    ], 
    function (err, results) {
        res.render('admin/students', { course: results[0], tutorial: results[1] });
    }); 
};

exports.addStudentInCourse = function (req, res) { 
    async.series([
        function (cb) { 
            Course.findByIdAndUpdate(req.params.course, {
                $push: { students: req.params.student } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $push: { courses: req.params.course } 
            }, { new: true }, cb);
        }
    ],
    function (err, results) {

    });
};

// Add student in tutorial
exports.addStudentInTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            Tutorial.findByIdAndUpdate(req.params.tutorial, {
                $push: { students: req.params.student } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $push: { tutorials: req.params.tutorial } 
            }, { new: true }, cb);
        }
    ],
    function (err, results) {

    });
};

exports.addStudentInGroup = function (req, res) { 
    async.series([
        function (cb) { 
            Group.findByIdAndUpdate(req.params.group, {
                $push: { students: req.params.student } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $push: { groups: req.params.group } 
            }, { new: true }, cb);
        }
    ],
    function (err, results) {

    });
};

// Delete student from course
exports.deleteStudentFromCourse = function (req, res) { 
    async.series([
        function (cb) { 
            Course.findByIdAndUpdate(req.params.course, {
                $pull: { students: { _id: req.params.student } } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $pull: { courses: { _id: req.params.course } }
            }, { new: true }, cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete student from tutorial
exports.deleteStudentFromTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            Tutorial.findByIdAndUpdate(req.params.tutorial, {
                $pull: { students: { _id: req.params.student } } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $pull: { tutorials: { _id: req.params.tutorial } }
            }, { new: true }, cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete student from group
exports.deleteStudentFromGroup = function (req, res) { 
    async.series([
        function (cb) { 
            Group.findByIdAndUpdate(req.params.group, {
                $pull: { students: { _id: req.params.student } } 
            }, { new: true }, cb);
        },
        function (cb) {
            Student.findByIdAndUpdate(req.params.student, { 
                $pull: { groups: { _id: req.params.group } }
            }, { new: true }, cb);
        }
    ],
    function (err, results) {
        res.render('admin/group-student', { group: results[0], student: results[1] });
    });
};