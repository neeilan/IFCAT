var _ = require('underscore');

// models
var Course = require('../models/course');

// Retrieve many courses
exports.getCourses = function (req, res) {
    Course.find(function (err, courses) {
        if (err) {
            res.status(500).send("Unable to retrieve any courses at this time (" + err.message + ").");
        } else {
            res.status(200).send(courses);
        }
    });
};

// Retrieve course
exports.getCourse = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        if (err) {
            res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        } else if (!course) {
            res.status(404).send("This course doesn't exist.");
        } else {
            res.status(200).send(course);
        }
    });
};

// Add course model
exports.addCourse = function (req, res) {
    var course = new Course(_.extend(req.body));
    course.save(function (err) {
        if (err) {
            res.status(500).send("Unable to save course at this time (" + err.message + ").");
        } else {
            res.status(200).send(course); 
        }
    });
};

// Update course
exports.editCourse = function (req, res) {
    Course.findById(req.params.course, function (err, course) {  
        if (err) {
            res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        } else if (!course) {
            res.status(404).send("This course doesn't exist");
        } else {
            _.extend(course, req.body).save(function (err) {
                if (err) {
                    res.status(500).send("Unable to save course at this time (" + err.message + ").");
                } else {
                    res.status(200).send(course); 
                }
            });
        }
    });
};

// Delete course
exports.deleteCourse = function (req, res) {
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        } else if (!course) {
            res.status(404).send("This course doesn't exist.");
        } else {
            course.remove(function (err) {
                if (err) {
                    res.status(500).send("Unable to delete course at this time (" + err.message + ").");
                    return;
                }
                res.status(200).send({ 'responseText': 'The course has successfully deleted' }); 
            });
        }   
    });
};