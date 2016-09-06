var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose'),
    _ = require('lodash');

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
        first: {
            type: String,
            lowercase: true
        },
        last: { 
            type: String,
            lowercase: true
        }
    },
    roles: [{
        type: String,
        enum: ['student', 'teachingAssistant', 'instructor', 'admin'],
        default: 'student'
    }]
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
    return group.driver && this.id === group.driver.id;
};

/*
UserSchema.static.sort = function (users) {

    function byRoles (a, b) {
        ['admin', 'instructor', 'teachingAssistant', 'student'].forEach(function (role) {
            if (a.has(role) && b.is(role)) {
                return byFirstName(a, b);
            } else if (a.has(role)) {
                return 1;
            } else if (b.has(role)) {
                return -1;
            }
        });
    };

    function byFirstName (a, b) {
        if (a.name.first === b.name.first) {
            return byLastName(a, b);
        }
        return a.name.first > b.name.first ? 1 : -1;
    }

    function byLastName (a, b) {
        if (a.name.last === b.name.last) {
            return 0;
        }
        return a.name.last > b.name.last ? 1 : -1;
    }

    return users.sort(byRoles);
};
*/

module.exports = mongoose.model('User', UserSchema);