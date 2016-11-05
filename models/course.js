var async = require('async'),
    fs = require('fs-extra'),
    mongoose = require('mongoose');

var config = require('../lib/config'),
    models = require('.');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: 1, uppercase: 1 },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});
// Delete cascade
CourseSchema.pre('remove', function (next) {
    var course = this,
        path = config.uploadPath + '/' + course._id;
    async.parallel([
        function deleteRef1(done) {
            models.Tutorial.remove({ _id: { $in: course.tutorials }}, done);
        },
        function deleteRef2(done) {
            models.Quiz.remove({ _id: { $in: course.quizzes }}, done);
        },
        function deleteRef3(done) {
            models.File.remove({ _id: { $in: course.files }}, done);
        },
        // delete upload directory & files
        function rmdir(done) {
            fs.stat(path, function (err, stats) {
                if (err && err.code === 'ENOENT') {
                    done();
                } else if (err) {
                    done(err);
                } else if (stats.isDirectory()) {
                    fs.remove(path, done);  
                } else {
                    done();
                }
            });
        }
    ], next);
});
// Populate instructors
CourseSchema.methods.withInstructors = function () {
    return this.populate({
        path: 'instructors',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate teaching assistants
CourseSchema.methods.withTeachingAssistants = function () {
    return this.populate({
        path: 'teachingAssistants',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate students
CourseSchema.methods.withStudents = function () {
    return this.populate({ 
        path: 'students', 
        options: { 
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    });
};
// Populate tutorials
CourseSchema.methods.withTutorials = function (deep) {
    var obj = {
        path: 'tutorials',
        options: {
            sort: { number: 1 }
        }
    };
    if (deep) {
        obj.populate = {
            path: 'teachingAssistants', 
            options: { 
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        };
    }
    return this.populate(obj);
};
// Populate quizzes
CourseSchema.methods.withQuizzes = function () {
    return this.populate({
        path: 'quizzes', 
        options: {
            sort: { name: 1 }
        }
    });
};
// Populate files
CourseSchema.methods.withFiles = function () {
    return this.populate({ 
        path: 'files', 
        options: {
            sort: { name: 1 }
        }
    });
};
// Find courses enrolled by student
CourseSchema.statics.findByStudent = function (userId) {
    return this.find({ 
        'students': { 
            $in: [userId] 
        } 
    }).sort('code');
};

module.exports = mongoose.model('Course', CourseSchema);