var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    _ = require('lodash');

var roles = ['student', 'teachingAsst', 'instructor', 'admin'];


var UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            lowercase: true
        },
        password: String
    },
    oauth: {
        id: String,
        token: String,
    },
    UTORid: String,
    name: {
        first: {
            type: String,
            lowercase: true
        },
        last: { 
            type: String,
            lowercase: true
        }
    },
    roles: Array,
    instructor: {
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    },
    teachingAsst: {
        courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        //tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }]
    },
    student: {
        courses: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Course' } ],
        //tutorials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }],
        //groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }]
    }
});

UserSchema.methods.generateHash = function (s) {
    return bcrypt.hashSync(s, bcrypt.genSaltSync(10), null);
};

UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

UserSchema.methods.hasRole = function () {
    return _.intersection(this.roles, arguments).length > 0;
};

UserSchema.methods.addRole = function () {
    this.roles = _.union(this.roles, arguments);
};

UserSchema.methods.removeRole = function () {
    this.roles = _.pull(this.roles, arguments);
};

UserSchema.methods.getFullName = function () {
    return this.name.first + ' ' + this.name.last;
};

UserSchema.methods.isRepresentativeOf = function (group) {
    return group.representative && this.id === group.representative.id;
};


module.exports = mongoose.model('User', UserSchema);