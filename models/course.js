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
// Add instructor
CourseSchema.methods.addInstructor = function (user) {
    if (this.instructors.indexOf(user) === -1) {
        this.instructors.push(user);
    }
};
// Add teaching assistant
CourseSchema.methods.addTeachingAssistant = function (user) {
    if (this.teachingAssistants.indexOf(user) === -1) {
        this.teachingAssistants.push(user);
    }
};
// Add student
CourseSchema.methods.addStudent = function (user) {
    if (this.students.indexOf(user) === -1) {
        this.students.push(user);
    }
};
// Delete isntructor
CourseSchema.methods.deleteInstructor = function (user) {
    var index = this.instructors.indexOf(user);
    if (index !== -1) {
        this.instructors.splice(index, 1);
    }
};
// Delete teaching assistant
CourseSchema.methods.deleteTeachingAssistant = function (user) {
    var index = this.teachingAssistants.indexOf(user);
    if (index !== -1) {
        this.teachingAssistants.splice(index, 1);
    }
};
// Delete student
CourseSchema.methods.deleteStudent = function (user) {
    var index = this.students.indexOf(user);
    if (index !== -1) {
        this.students.splice(index, 1);
    }
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