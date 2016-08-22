// models
var Course = require('../models/course'),
    Tutorial = require('../models/tutorial'),
    Group = require('../models/group');

// Retrieve list of groups for tutorial
exports.getGroupsByTutorial = function (req, res) { 
    async.series([
        function (cb) {
            Course.findById(req.params.course, cb);
        },
        function (cb) {
            Tutorial.findById(req.params.quiz).populate({ path: 'groups', options: { sort: { number: 1 } } }).exec(cb);
        }
    ], 
    function (err, results) {
        res.render('admin/groups', { course: results[0], tutorial: results[1] });
    });
};

// Retrieve group for tutorial
exports.getNewGroupForm = function (req, res) { 
    Group.findById(req.params.group).populate('members').exec(function (err, group) {
        if (err) {
            return res.status(500).send("Unable to retrieve group at this time (" + err.message + ").");
        }
        res.status(200).send(group);
    });
};

// Create new group for tutorial
exports.addGroupToTutorial = function (req, res) { 
    Tutorial.findById(req.params.tutorial, function (err, tutorial) {
        if (err) {
            return res.status(500).send("Unable to retrieve tutorial at this time (" + err.message + ").");
        }
        if (!tutorial) {
            return res.status(404).send("This tutorial doesn't exist.");
        }
        Group.create(req.body, function (err, group) {
            if (err) {
                return res.status(500).send("Unable to retrieve group at this time (" + err.message + ").");
            }
            tutorial.groups.push(group);
            tutorial.save(function (err) {
                if (err) {
                    return res.status(500).send("Unable to save tutorial at this time (" + err.message + ").");
                }
                res.status(200).send(group);
            });
        });
    });
};

// Delete group
exports.deleteGroupFromTutorial = function (req, res) {
    Tutorial.findByIdAndUpdate(req.params.tutorial, {
        $pull: { groups: { _id: req.params.group } }
    }, function (err, tutorial) {
        if (err) {
            return res.status(500).send("Unable to delete tutorial at this time (" + err.message + ").");
        }
        Group.findByIdAndRemove(req.params.group, function (err, group) {
            if (err) {
                return res.status(500).send("Unable to delete group at this time (" + err.message + ").");
            }
            res.status(200).send({ 'responseText': 'The group has been deleted.' });
        });
    });
};