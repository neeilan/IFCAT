// Get list of teachingAssistants for course
exports.getTeachingAssistantsByCourse = function (req, res) { 
    /*models.Course.findById(req.params.course).populate('{
        path: 'teachingAssistants'
    }).exec(function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve any teachingAssistants at this time (" + err.message + ").");
        }
        res.status(200).send(course.teachingAssistants);
    });*/
};

// WRONG WAY: top-down only

// Retrieve list of teachingAssistants for tutorial
exports.getTeachingAssistantsByTutorial = function (req, res) { 
    async.series([
        function (cb) {
            models.Course.findById(req.params.course, cb);
        },
        function (cb) {
            models.Tutorial.findById(req.params.tutorial).populate({ 
                path: 'teachingAssistants', 
                options: { sort: { lastName: 1, firstName: 1 } } 
            }).exec(cb);
        }
    ], 
    function (err, results) {
        res.render('admin/teachingAssistants', { course: results[0], tutorial: results[1] });
    }); 
};

exports.addTeachingAssistantInCourse = function (req, res) { 
    async.series([
        function (cb) { 
            models.Course.findByIdAndUpdate(req.params.course, {
                $push: { teachingAssistants: req.params.ta } 
            }, { new: true }, cb);
        },
        function (cb) {
            TeachingAssistant.findByIdAndUpdate(req.params.ta, { 
                $push: { courses: req.params.course } 
            }, { new: true }, cb);
        }
    ],
    function (err, results) {

    });
};

// Add teachingAssistant in tutorial
exports.addTeachingAssistantInTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            models.Tutorial.findByIdAndUpdate(req.params.tutorial, {
                $push: { teachingAssistants: req.params.ta } 
            }, { new: true }, cb);
        },
        function (cb) {
            TeachingAssistant.findByIdAndUpdate(req.params.ta, { 
                $push: { tutorials: req.params.tutorial } 
            }, { new: true }, cb);
        }
    ],
    function (err, results) {

    });
};

// Delete teachingAssistant from course
exports.deleteTeachingAssistantFromCourse = function (req, res) { 
    async.series([
        function (cb) { 
            models.Course.findByIdAndUpdate(req.params.course, {
                $pull: { teachingAssistants: { _id: req.params.ta } } 
            }, { new: true }, cb);
        },
        function (cb) {
            TeachingAssistant.findByIdAndUpdate(req.params.ta, { 
                $pull: { courses: { _id: req.params.course } }
            }, { new: true }, cb);
        }
    ],
    function (err, results) {
        
    });
};

// Delete teachingAssistant from tutorial
exports.deleteTeachingAssistantFromTutorial = function (req, res) { 
    async.series([
        function (cb) { 
            models.Tutorial.findByIdAndUpdate(req.params.tutorial, {
                $pull: { teachingAssistants: { _id: req.params.ta } } 
            }, { new: true }, cb);
        },
        function (cb) {
            TeachingAssistant.findByIdAndUpdate(req.params.ta, { 
                $pull: { tutorials: { _id: req.params.tutorial } }
            }, { new: true }, cb);
        }
    ],
    function (err, results) {
        
    });
};