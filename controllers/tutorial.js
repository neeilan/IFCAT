var async = require('async');

// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial');
    
// Retrieve list of tutorials for course
exports.getTutorials = function (req, res) { 
    
    if (req.user.hasRole('admin')) {
        Course.findById(req.params.course).populate({
            path: 'tutorials', 
            options: { sort: { number: 1 }}
        }).exec(function (err, course) {
            res.render('admin/tutorials', { course: course });
        });
    } else if (req.user.hasRole('teachingAssistant')) {
        
    }
};

/*exports.getTutorialsByStudent = function (req, res) { // requires req.user object (ensure via middleware)
    User.findById(req.user._id).populate('student.tutorials')
    .populate({ path: 'student.tutorials', select: 'name number' })
    .exec(function (user) {

        res.render('student/tutorials', { tutorials: user.student.tutorials });
    })
    .catch(function(err){
        res.status(500).send("Unable to retrieve tutorials at this time (" + err.message + ").");
    });
};*/

// Retrieve all tutorials in a course
exports.getTutorialsByCourse = function (req,res) {
    //
};

// Retrieve specific tutorial for tutorial
exports.getNewTutorialForm = function (req, res) { 
    Course.findById(req.params.course, function (err, course) {
        res.render('admin/tutorial', { course: course, tutorial: new Tutorial() });
    });
};

// Retrieve specific tutorial for tutorial
exports.getTutorialForm = function (req, res) { 
    Course.findById(req.params.course, function (err, course) { 
        Tutorial.findById(req.params.tutorial, function (err, tutorial) {
            res.render('admin/tutorial', { course: course, tutorial: tutorial });
        });
    });
};

// Add new tutorial for tutorial
exports.addTutorial = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        /*if (err) {
            return res.send("Unable to retrieve course at this time (" + err.message + ").");
        }
        if (!course) {
            return res.send("This course doesn't exist.");
        }*/
        Tutorial.create(req.body, function (err, tutorial) {
            /*if (err) {
                return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
            }*/
            course.tutorials.push(tutorial);
            course.save(function (err) {
                /*if (err) {
                    return res.status(500).send("Unable to save course at this time (" + err.message + ").");
                }*/
                res.redirect('/admin/courses/' + course.id + '/tutorials');
            });
        });
    });
};

// Update specific tutorial for course
exports.editTutorial = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        Tutorial.findByIdAndUpdate(req.params.tutorial, { $set: req.body }, { new: true }, function (err, tutorial) {  
            /*if (err) {
                return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
            }*/
            res.redirect('/admin/courses/' + course.id + '/tutorials/' + tutorial.id + '/edit');
        });
    });
};

// Delete specific tutorial for course
exports.deleteTutorial = function (req, res) {
   /* 

   Course.findByIdAndUpdate(req.params.course, {
        $pull: { tutorials: { _id: req.params.tutorial } }
    }, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to delete tutorial at this time (" + err.message + ").");
        }
        Tutorial.findByIdAndRemove(req.params.tutorial, function (err, tutorial) {
            if (err) {
                return res.status(500).send("Unable to delete tutorial at this time (" + err.message + ").");
            }
            res.status(200).send({ 'responseText': 'The tutorial has successfully deleted' });
        });
    });*/
};