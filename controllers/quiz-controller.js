var _ = require('underscore');

// models
var Course = require('../models/course'),
    Quiz = require('../models/quiz');

// Retrieve many quizzes
exports.getQuizzes = function (req, res) {
    Course.findById(req.params.course).populate('quizzes').find(function (err, quizzes) {
        if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }
        res.status(200).send(course.quizzes);
    });
};

// Retrieve quiz
exports.getQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            return res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } else if (!quiz) {
            return res.status(404).send("This quiz doesn't exist.");
        }
        res.status(200).send(quiz);
    });
};

// Add quiz model
exports.addQuiz = function (req, res) {
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
exports.deleteQuiz = function (req, res) {
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