var _ = require('lodash'),
    async = require('async');

var models = require('../models');

// Retrieve course
exports.getTutorial = function (req, res, next, tutorial) {
    models.Tutorial.findById(tutorial, function (err, tutorial) {
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
        models.Course.populate(req.course, { 
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
        models.Course.find(req.params.course).populate('tutorials').exec(function (err, courses) { 
            res.render('student/tutorials', { course: course });
        });
    }
};

// Retrieve specific tutorial for tutorial
exports.getTutorialForm = function (req, res) { 
    models.Course.populate(req.course, {
        path: 'teachingAssistants',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }, function (err) {
        res.render('admin/course-tutorial', { course: req.course, tutorial: req.tutorial || new models.Tutorial() });
    });
};

// Add new tutorial for tutorial
exports.addTutorial = function (req, res) {
    models.Tutorial.create(req.body, function (err, tutorial) {

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
exports.deleteTutorial = function (req, res) {};