var _ = require('lodash'),
    mongoose = require('mongoose');

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
// Find courses
CourseSchema.statics.findCourses = function () {
    return this.find().sort('code').populate([{
        path: 'instructors',
        options: {
            sort: { 'name.first': 1, 'name.last': 1 }
        }
    }, {
        path: 'tutorials',
        options: {
            sort: 'number'
        },
        populate: {
            path: 'teachingAssistants',
            options: {
                sort: { 'name.first': 1, 'name.last': 1 }
            }
        }
    }]);
};
// Find courses taught by instructor
CourseSchema.statics.findCoursesByInstructor = function (user) {
    return this.find({
        'instructors': { 
            $in: [user] 
        } 
    }).sort('code');
};
// Find courses taught by teaching assistant
CourseSchema.statics.findCoursesByTeachingAssistant = function (user) {
    return this.find({
        'teachingAssistants': { 
            $in: [user] 
        } 
    }).sort('code');
};
// Find courses enrolled by student
CourseSchema.statics.findCoursesByStudent = function (user) {
    return this.find({ 
        'students': { 
            $in: [user] 
        } 
    }).sort('code');
};

module.exports = mongoose.model('Course', CourseSchema);