var _ = require('lodash'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');
    
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
    UTORid: String, // not sure if we are using it
    name: {
        first: String,
        last: String
    },
    roles: [{
        type: String,
        enum: ['admin', 'instructor', 'teachingAssistant', 'student'],
        default: 'student'
    }]
});

// get full name
UserSchema.virtual('name.full').get(function () {
    return this.name.first + ' ' + this.name.last;
});

UserSchema.methods.generateHash = function (s) {
    return bcrypt.hashSync(s, bcrypt.genSaltSync(10), null);
};

UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};

UserSchema.methods.hasRole = function (role) {
    return this.roles.indexOf(role) !== -1;
};

// Sort users by roles;
// - if users have same roles, sort users by first names;
// - otherwise, sort users by last names;
UserSchema.statics.compareRoles = function (a, b) {
/*
    ['admin', 'instructor', 'teachingAssistant', 'student'].forEach(function (role) {
        var aHasRole = a.hasRole(role), bHasRole = b.hasRole(role);
        if (aHasRole && bHasRole) {
            return compareFirstNames(a, b);
        } else if (aHasRole) {
            return 1;
        } else if (bHasRole) {
            return -1;
        }
    });

    function compareFirstNames (a, b) {
        var aFirstName = _.lowerCase(a.name.first), bFirstName = _.lowerCase(b.name.first);
        if (aFirstName === bFirstName) {
            return compareLastNames(a, b);
        }
        return aFirstName > bFirstName ? 1 : -1;
    }
    
    function compareLastNames (a, b) {
        var aLastName = _.lowerCase(a.name.last), bLastName = _.lowerCase(b.name.last);
        if (aLastName === bLastName) {
            return 0;
        }
        return aLastName > bLastName ? 1 : -1;
    }
    */
};

// find instructors
UserSchema.statics.findInstructors = function () {
    return this.find({ 
        roles: { 
            $in: ['instructor'] 
        } 
    }).sort({
        'name.first': 1,
        'name.last': 1
    });
};

// find teaching assistants
UserSchema.statics.findTeachingAssistants = function () {
    return this.find({ 
        roles: { 
            $in: ['teachingAssistant'] 
        } 
    }).sort({
        'name.first': 1,
        'name.last': 1
    });
};


module.exports = mongoose.model('User', UserSchema);