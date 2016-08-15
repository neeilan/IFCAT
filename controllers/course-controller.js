var _ = require('underscore');

// models
var Course = require('../models/course');

// Retrieve many courses
exports.getCourses = function (req, res) {

    // TODO: filter out courses based on user's role + permission + course!

    Course.find(function (err, courses) {
        if (err) {
            return res.status(500).send("Unable to retrieve any courses at this time (" + err.message + ").");
        }
        res.status(200).send(courses);
    });
};

// Retrieve course by ID
exports.getCourseById = function (req, res) {
    Course.findById(req.params.course, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }
        if (!course) {
            return res.status(404).send("This course doesn't exist.");
        }
        res.status(200).send(course);
    });
};

// Retrieve course by code
exports.getCourseByCode = function (req, res) {
    Course.findOne({ code: req.params.course }, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }
        if (!course) {
            return res.status(404).send("This course doesn't exist.");
        }
        res.status(200).send(course);
    });
};

// Add course model
exports.addCourse = function (req, res) {
    Course.create(req.body, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to save course at this time (" + err.message + ").");
        }
        res.status(200).send(course);
    });
};

// Update course
exports.editCourse = function (req, res) {
    Course.findByIdAndUpdate(req.params.course, { $set: req.body }, { new: true }, function (err, course) {  
        if (err) {
            return res.status(500).send("Unable to retrieve course at this time (" + err.message + ").");
        }
        res.status(200).send(course);
    });
};

// Delete course
exports.deleteCourse = function (req, res) {
    Course.findByIdAndRemove(req.params.course, function (err, course) {
        if (err) {
            return res.status(500).send("Unable to delete course at this time (" + err.message + ").");
        }
        res.status(200).send({ 'responseText': 'The course has successfully deleted.' });
    });
};