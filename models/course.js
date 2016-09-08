var mongoose = require('mongoose');

var CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String,  required: true },
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, {
    timestamps: true
});

// populate tutorials
CourseSchema.methods.withTutorials = function () {
    return this.populate({
        path: 'tutorials',
        options: {
            sort: { number: 1 }
        }
    });
};

// populate quizzes
CourseSchema.methods.withQuizzes = function () {
    return this.populate({
        path: 'quizzes', 
        options: {
            sort: { name: 1 }
        }
    });
};

// populate files
CourseSchema.methods.withFiles = function () {
    return this.populate({ 
        path: 'files', 
        options: {
            sort: { name: 1 }
        }
    });
};

// find courses
CourseSchema.statics.findCourses = function () {
    return this.find({}).sort('code');
};

// find courses enrolled by student
CourseSchema.statics.findCoursesByStudent = function (id) {
    return this.find({ 'students': { $in: [id] } });
};

module.exports = mongoose.model('Course', CourseSchema);