var _ = require('underscore');

// models
var Tutorial = require('../models/tutorial');

// Retrieve list of tutorials for tutorial
TutorialController.getTutorials = function (req, res) { 
    Tutorial.find(function (err, tutorials) {
        if (err) {
            res.status(500).send("Unable to retrieve any tutorials at this time (" + err.message + ").");
        } else {
            res.status(200).send(tutorials);
        }
    });
};

// Retrieve specific tutorial for tutorial
TutorialController.getTutorial = function (req, res) { 
    Tutorial.findById(req.params.tutorial, function (err, tutorial) {
        if (err) {
            res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        } else if (!tutorial) {
            res.status(404).send("This tutorial doesn't exist.");
        } else {
            res.status(200).send(tutorial);
        }
    });
};

// Add new tutorial for tutorial
TutorialController.addTutorial = function (req, res) { 
    var tutorial = new Tutorial(_.extend(req.body, { }));
    tutorial.save(function (err) {
        if (err) {
            res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
        } else {
            res.status(200).send(tutorial); 
        }
    });
};

// Update specific tutorial for tutorial
TutorialController.editTutorial = function (req, res) {
    Tutorial.findById(req.params.tutorial, function (err, tutorial) {  
        if (err) {
            res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        } else if (!tutorial) {
            res.status(404).send("This tutorial doesn't exist.");
        } else {
            _.extend(tutorial, req.body).save(function (err) {
                if (err) {
                    res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
                } else {
                    res.status(200).send(tutorial); 
                }
            });
        }
    });
};

// Delete specific tutorial for tutorial
TutorialController.deleteTutorial = function (req, res) { 
    Tutorial.findById(req.params.tutorial, function (err, tutorial) {
        if (err) {
            res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        } else if (!tutorial) {
            res.status(404).send("This tutorial doesn't exist.");
        } else {
            tutorial.remove(function (err) {
                if (err) {
                    res.status(500).send("Unable to delete tutorial at this time (" + err.message + ").");
                    return;
                }
                res.status(200).send({ 'responseText': 'The tutorial has successfully deleted' }); 
            });
        }   
    });
};