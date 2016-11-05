var _ = require('lodash'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');
    
var models = require('.');

var UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            lowercase: true
        },
        password: {
            type: String,
            set: function (password) {
                return password || this.local.password;
            }
        }
    },
    oauth: {
        id: String,
        token: String,
    },
    student: {
        UTORid: {
            type: String,
            lowercase: true
        },
        number: String
    },
    teachingPoints: {
        type: Number,
        default: 0
    },
    name: {
        first: String,
        last: String
    },
    roles: [{
        type: String,
        enum: ['admin', 'instructor', 'teachingAssistant', 'student']
    }]
});

// get full name
UserSchema.virtual('name.full').get(function () {
    return _.defaultTo(this.name.first, '') + ' ' + _.defaultTo(this.name.last, '');
});
// hook: hash password if one is given
UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('local.password')) 
        return next();
    bcrypt.genSalt(function (err, salt) {
        if (err) 
            return next(err);
        bcrypt.hash(user.local.password, salt, function (err, hash) {
            if (err) 
                return next(err);
            user.local.password = hash;
            next();
        });
    });
});

// hook: delete cascade
UserSchema.pre('remove', function (next) {
    var conditions = {
        $or: [
            { instructors: { $in: [this._id] }},
            { teachingAssistants: { $in: [this._id] }}, 
            { students: { $in: [this._id] }}
        ]
    },  doc = { 
        $pull: {
            instructors: this._id,
            teachingAssistants: this._id,
            students: this._id
        }
    }, options = {
        multi: true
    };
    async.parallel([
        function delRef1(done) {
            models.Course.update(conditions, doc, options).exec(done);
        },
        function delRef2(done) {
            models.Tutorial.update(conditions, doc, options).exec(done);
        }
    ], next);
});
// check password given is valid
UserSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.local.password, callback);
};
// check user's role
UserSchema.methods.hasRole = function (role) {
    return this.roles.indexOf(role) !== -1;
};
// sort users by roles, first name, and last name
UserSchema.statics.sortByRole = function (users) {
    var roles = this.schema.path('roles').caster.enumValues;
    return _.sortBy(users, function (user) {
        var index = roles.indexOf(user.roles[0]);
        return index > -1 ? index : roles.length; // highest number
    }, 'name.first', 'name.last');
};
// find instructors
UserSchema.statics.findByRole = function (role) {
    return this.find({ 
        roles: { 
            $in: [role] 
        } 
    }).sort({
        'name.first': 1,
        'name.last': 1
    });
};
// find teaching assistants by search query
UserSchema.statics.findBySearchQuery = function (query, role) {
    // build regular expression e.g. 'first last' => /(first|last)/i
    var re = new RegExp('(' + query.replace(/\s/, '|').trim() + ')', 'i');
    // query based on UTORid, name, or email
    return this.find().and([
        {
            roles: {
                $in: [role]
            }  
        }, 
        {
            $or: [
                { 'name.first': re },
                { 'name.last': re },
                { 'student.UTORid': re },
                { 'student.number': re },
                { 'local.email': re }
            ]
        }
    ]).sort({
        'name.first': 1,
        'name.last': 1
    });
};

module.exports = mongoose.model('User', UserSchema);