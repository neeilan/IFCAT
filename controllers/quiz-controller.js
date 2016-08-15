var _ = require('underscore');

// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial'),
    Quiz = require('../models/quiz');

// Retrieve many quizzes
exports.getQuizzesByCourse = function (req, res) {
    Course.findById(req.params.course).find(function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }
        res.status(200).send(course.quizzes);
    });
};

// Retrieve quiz
exports.getQuiz = function (req, res) {
    return Quiz.findById(req.params.id).populate('questions')
    .exec().then(function(quiz){
        res.status(200).send(quiz);
    })
    .catch(function(err){
        res.status(505).send("Unable to retrieve quiz at this time (" + err.message + ").");
    })
};

// Add quiz to course
exports.addQuizToCourse = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        } else if (!course) {
            return res.status(404).send("This course doesn't exist.");
        }
        Quiz.create(req.body, function (err, quiz) {
            if (err) {
                return res.status(500).send("Unable to save quiz at this time (" + err.message + ").");
            }
            // add quiz to course
            course.quizzes.push(quiz);
            course.save(function (err) {
                if (err) {
                    return res.status(500).send("Unable to save course at this time (" + err.message + ").");
                }
                res.status(200).send(quiz);
            });
        });
    });
};

// Add quiz to tutorial
exports.addQuizToTutorial = function (req, res) {
    Quiz.findById(req.params.quiz, function (err, quiz) {
        if (err) {
            return res.status(500).send("Unable to find quiz at this time (" + err.message + ").");
        }
        Tutorial.findByIdAndUpdate(req.params.tutorial, { 
            $push: { quizzes: quiz._id } 
        }, { 
            new: true 
        }, function (err, tutorial) {
            if (err) {
                return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
            }
            res.status(200).send(tutorial);
        });
    });
};

// Delete quiz from tutorial
exports.deleteQuizFromTutorial = function (req, res) {
    Quiz.findById(req.params.quiz, function (err, quiz) {
        if (err) {
            return res.status(500).send("Unable to find quiz at this time (" + err.message + ").");
        }
        Tutorial.findByIdAndUpdate(req.params.tutorial, { 
            $pull: { quizzes: quiz } 
        }, { 
            new: true 
        }, function (err, tutorial) {
            if (err) {
                return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
            }
            res.status(200).send(tutorial);
        });
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    Quiz.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true }, function (err, quiz) {  
        if (err) {
            return res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } 
        res.status(200).send(quiz);
    });
};

// Delete quiz
exports.deleteQuizFromCourse = function (req, res) {
    Course.findByIdAndUpdate(req.params.course, {
        $pull: { quizzes: { _id: req.params.quiz } }
    }, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to delete course at this time (" + err.message + ").");
        }
        Quiz.findByIdAndRemove(req.params.quiz, function (err, quiz) {
            if (err) {
                return res.status(500).send("Unable to delete quiz at this time (" + err.message + ").");
            }
            res.status(200).send({ 'responseText': 'The quiz has successfully deleted' });
        });
    });
};