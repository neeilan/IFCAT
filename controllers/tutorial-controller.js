var _ = require('underscore');

// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial');
    
// Retrieve list of tutorials for course
exports.getTutorials = function (req, res) { 
    Course.findById(req.params.course).populate('tutorials').exec(function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve any tutorials at this time (" + err.message + ").");
        }
        res.status(200).send(course.tutorials);
    });
};

// Retrieve specific tutorial for tutorial
exports.getTutorialById = function (req, res) { 
    Tutorial.findById(req.params.tutorial, function (err, tutorial) {
        if (err) {
            return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        } else if (!tutorial) {
            return res.status(404).send("This tutorial doesn't exist.");
        }
        res.status(200).send(tutorial);
    });
};

// Retrieve specific tutorial for tutorial
exports.getTutorialByNumber = function (req, res) { 
    Tutorial.findOne({ number: req.params.tutorial }, function (err, tutorial) {
        if (err) {
            return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        } else if (!tutorial) {
            return res.status(404).send("This tutorial doesn't exist.");
        }
        res.status(200).send(tutorial);
    });
};

// Add new tutorial for tutorial
exports.addTutorial = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }
        if (!course) {
            return res.status(404).send("This course doesn't exist.");
        }
        Tutorial.create(req.body, function (err, tutorial) {
            if (err) {
                return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
            }
            course.tutorials.push(tutorial);
            course.save(function (err) {
                if (err) {
                    return res.status(500).send("Unable to save course at this time (" + err.message + ").");
                }
                res.status(200).send(tutorial);
            });
        });
    });
};

// Update specific tutorial for course
exports.editTutorial = function (req, res) {
    Tutorial.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function (err, tutorial) {  
        if (err) {
            return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        }
        res.status(200).send(tutorial);
    });
};

// Delete specific tutorial for course
exports.deleteTutorial = function (req, res) {
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
};