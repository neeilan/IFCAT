// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial'),
    Quiz = require('../models/quiz');

// Retrieve many quizzes
exports.getQuizzesByCourse = function (req, res) {
    Course.findById(req.params.course).populate({
        path: 'quizzes', 
        options: { sort: { name: 1 } }
    }).exec(function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve any quizzes at this time (" + err.message + ").");
        }*/
        res.render('admin/quizzes', { course: course });
    });
};

// Retrieve quiz form
exports.getNewQuizForm = function (req, res) {
    Course.findById(req.params.course, function (err, course) { 
        res.render('admin/quiz', { course: course, quiz: new Quiz() });
    });
};

// Retrieve quiz form
exports.getQuizForm = function (req, res) {
    Course.findById(req.params.course, function (err, course) { 
        Quiz.findById(req.params.quiz, function (err, quiz) {
            res.render('admin/quiz', { course: course, quiz: quiz });
        });
    });
};

// Add quiz to tutorial
exports.addQuizToTutorial = function (req, res) {

};

// Add quiz to course
exports.addQuizToCourse = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        /*if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        } else if (!course) {
            return res.status(404).send("This course doesn't exist.");
        }*/
        Quiz.create(req.body, function (err, quiz) {
            /*if (err) {
                return res.status(500).send("Unable to save quiz at this time (" + err.message + ").");
            }*/
            // add quiz to course
            course.quizzes.push(quiz);
            course.save(function (err) {
                /*if (err) {
                    return res.status(500).send("Unable to save course at this time (" + err.message + ").");
                }*/
                res.redirect('/admin/courses/' + course.id + '/quizzes');
            });
        });
    });
};

// Update quiz
exports.editQuiz = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        Quiz.findByIdAndUpdate(req.params.quiz, { $set: req.body }, { new: true }, function (err, quiz) {  
            /*if (err) {
                return res.status(500).send("Unable to retrieve quiz at this time (" + err.message + ").");
            } */
            res.redirect('/admin/courses/' + course.id + '/quizzes/' + quiz.id + '/edit');
        });
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