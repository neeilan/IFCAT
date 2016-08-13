var _ = require('underscore');

// models
var Quiz = require('../models/quiz');

// Retrieve many quizzes
exports.getQuizzes = function (req, res) {
    Quiz.find(function (err, quizzes) {
        if (err) {
            res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        } else {
            res.status(200).send(quizzes);
        }
    });
};

// Retrieve quiz
exports.getQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } else if (!quiz) {
            res.status(404).send("This quiz doesn't exist.");
        } else {
            res.status(200).send(quiz);
        }
    });
};

// Add quiz model
exports.addQuiz = function (req, res) {
    var quiz = new Quiz(_.extend(req.body/*, { userId: req.session.userId }*/));
    quiz.save(function (err) {
        if (err) {
            res.status(500).send("Unable to save quiz at this time (" + err.message + ").");
        } else {
            res.status(200).send(quiz); 
        }
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {  
        if (err) {
            res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } else if (!quiz) {
            res.status(404).send("This quiz doesn't exist");
        /*} else if (req.session.userId !== quiz.userId) {
            res.status(500).send("You do not have permission to modify this record");
        */} else {
            _.extend(quiz, req.body).save(function (err) {

                if (err) {
                    res.status(500).send("Unable to save quiz at this time (" + err.message + ").");
                } else {
                    res.status(200).send(quiz); 
                }
            });
        }
    });
};

// Delete quiz
exports.deleteQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
        } else if (!quiz) {
            res.status(404).send("This quiz doesn't exist");
        /*} else if (req.session.userId !== quiz.userId) {
            res.status(500).send("You do not have permission to modify this record");
        */} else {
            quiz.remove(function (err) {
                if (err) {
                    res.status(500).send("Unable to delete quiz at this time (" + err.message + ").");
                    return;
                }
                res.status(200).send({ 'responseText': 'The quiz has successfully deleted' }); 
            });
        }   
    });
};