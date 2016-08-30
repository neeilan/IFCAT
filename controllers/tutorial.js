var async = require('async'),
    _ = require('lodash');

// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial'),
    TutorialQuiz = require('../models/tutorialQuiz');

// Retrieve course
exports.getTutorial = function (req, res, next, tutorial) {
    Tutorial.findById(tutorial, function (err, tutorial) {
        if (err) {
            return next(err);
        }
        if (!tutorial) {
            return next(new Error('No tutorial is found.'));
        }
        console.log('got tutorial');
        req.tutorial = tutorial;
        next();
    });
};

// Retrieve list of tutorials for course
exports.getTutorialList = function (req, res) { 
    if (req.user.hasRole('admin')) {
        Course.populate(req.course, { 
            path: 'tutorials', 
            options: { 
                sort: { number: 1 }
            },
            populate: {
                path: 'teachingAssistants', 
                options: { 
                    sort: { 'name.first': 1, 'name.last': 1 }
                }
            }
        }, function (err, course) {
            res.render('admin/course-tutorials', { course: course });
        });
    


    } else {
        Course.find(req.params.course).populate('tutorials').exec(function (err, courses) { 
            res.render('student/tutorials', { course: course });
        });
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

// Retrieve specific tutorial for tutorial
exports.getTutorialForm = function (req, res) { 
    res.render('admin/course-tutorial', { 
        course: req.course, 
        tutorial: req.tutorial || new Tutorial() 
    });
};

// Add new tutorial for tutorial
exports.addTutorial = function (req, res) {
    Tutorial.create(req.body, function (err, tutorial) {
        console.log(err);
        /*if (err) {
            return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
        }*/
        req.course.tutorials.push(tutorial);
        req.course.save(function (err) {

            /*if (err) {
                return res.status(500).send("Unable to save course at this time (" + err.message + ").");
            }*/
            res.redirect('/admin/courses/' + req.course.id + '/tutorials');
        });
    });
};

// Update specific tutorial for course
exports.editTutorial = function (req, res) {    
    _.extend(req.tutorial, req.body).save(function (err) {  
        /*if (err) {
            return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        }*/
        res.redirect(
            '/admin/courses/' + req.course.id + 
            '/tutorials/' + req.tutorial.id + 
            '/edit'
        );
    });
};

// Delete specific tutorial for course
/* exports.deleteTutorial = function (req, res) {
   

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
    });
};*/