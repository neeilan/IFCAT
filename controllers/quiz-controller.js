var _ = require('underscore');

var Quiz = require('../models/quiz');

// Retrieve many quizzes
exports.getQuizzes = function (req, res) {
    Quiz.find(function (err, quizzes) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve any quizzes at this time (" + err.message + ")");
        } else {
            res.status(200).send(quizzes);
        }
    });
};

// Retrieve quiz
exports.getQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve quiz at this time (" + err.message + ")");
        } else if (!quiz) {
            res.status(404).send("Sorry, that quiz doesn't exist; try reselecting from Browse view");
        } else {
            res.status(200).send(quiz);
        }
    });
};

// Start quiz
exports.startQuiz = function (req, res) {

};

// Add quiz model
exports.addQuiz = function (req, res) {
    var quiz = new Quiz(_.extend(req.body/*, { userId: req.session.userId }*/));
    quiz.save(function (err) {
        if (err) {
            res.status(500).send("Sorry, unable to save quiz at this time (" + err.message + ")");
        } else {
            res.status(200).send(quiz); 
        }
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    Quiz.findById(req.params.id, function (err, quiz) {  
        if (err) {
            res.status(500).send("Sorry, unable to retrieve quiz at this time (" + err.message + ")");
        } else if (!quiz) {
            res.status(404).send("Sorry, that quiz doesn't exist");
        /*} else if (req.session.userId !== quiz.userId) {
            res.status(500).send("You do not have permission to modify this record");
        */} else {
            _.extend(quiz, req.body).save(function (err) {

                if (err) {
                    res.status(500).send("Sorry, unable to save quiz at this time (" + err.message + ")");
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
            res.status(500).send("Sorry, unable to retrieve quiz at this time (" + err.message + ")");
        } else if (!quiz) {
            res.status(404).send("Sorry, that quiz doesn't exist");
        /*} else if (req.session.userId !== quiz.userId) {
            res.status(500).send("You do not have permission to modify this record");
        */} else {
            quiz.remove(function (err) {
                if (err) {
                    res.status(500).send("Sorry, unable to delete quiz at this time (" + err.message + ")");
                    return;
                }
                if (quiz.poster.indexOf(UPLOADS_PATH) === 0) {
                    fs.unlink(PUBLIC_DIR + quiz.poster, function (err) {
                        if (err) {
                            console.log("Error trying to unlink image: " + err.message);
                        }
                    });
                }
                res.status(200).send({ 'responseText': 'The quiz has successfully deleted' }); 
            });
        }   
    });
};