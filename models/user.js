var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    _ = require('lodash');

var roles = ['student', 'teachingAssistant', 'instructor', 'admin'];


var UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            lowercase: true,
            trim: true
        },
        password: String
    },
    oauth: {
        id: String,
        token: String,
    },
    firstName: { 
        type: String,
        lowercase: true,
        trim: true
    },
    lastName: { 
        type: String,
        lowercase: true,
        trim: true
    },
    roles: {
        type: [ { type: String, enum: roles } ]
    },/*,
    instructor: {
        courses: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Course' } ],
    },
    teachingAssistant: {
        courses: [ { type: mongoose.Schema.Types.Mixed } ] // [0] => course ref, [1] tutorial ref
    },*/
    student: {
        courses: [ { type: mongoose.Schema.Types.Mixed } ] // [0] => course ref, [1] tutorial ref, [2] => group ref 
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



module.exports = mongoose.model('User', UserSchema);