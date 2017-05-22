const _ = require('lodash'),
    async = require('async'),
    bcrypt = require('bcryptjs'),
    models = require('.'),
    mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            trim: true,
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
            trim: true,
            lowercase: true
        },
        number: {
            type: String,
            trim: true
        }
    },
    teachingPoints: {
        type: Number,
        default: 0
    },
    name: {
        first: {
            type: String,
            trim: true,
            set: function (first) {
                return _.startCase(_.toLower(first));
            }
        },
        last: {
            type: String,
            trim: true,
            set: function (last) {
                return _.startCase(_.toLower(last));
            }
        }
    },
    roles: [{
        type: String,
        enum: ['admin', 'instructor', 'teachingAssistant', 'student']
    }]
}, {
    toJSON: {
        virtuals: true
    }
});
// get full name
UserSchema.virtual('name.full').get(function () {
    return _.defaultTo(this.name.first, '') + ' ' + _.defaultTo(this.name.last, '');
});
// pre-save hook
UserSchema.pre('save', function (next) {
    let self = this;
    // hash password if it is present and has changed
    if (self.local.password && self.isModified('local.password')) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) 
                return next(err);
            bcrypt.hash(self.local.password, salt, function (err, hash) {
                if (err) 
                    return next(err);
                self.local.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// hook: delete cascade
UserSchema.pre('remove', function (next) {
    let self = this;
    async.series([
        function deleteFromCourse(done) {
            models.Course.update({
                $or: [
                    { instructors: { $in: [self._id] }},
                    { teachingAssistants: { $in: [self._id] }}, 
                    { students: { $in: [self._id] }}
                ]
            }, { 
                $pull: { instructors: self._id, teachingAssistants: self._id, students: self._id }
            }, {
                multi: true
            }).exec(done);
        },
        function deleteFromTutorials(done) {
            models.Tutorial.update({
                $or: [{ teachingAssistants: { $in: [self._id] }}, { students: { $in: [self._id] }}]
            }, { 
                $pull: { teachingAssistants: self._id, students: self._id }
            }, {
                multi: true
            }).exec(done);
        },
        function deleteFromGroups(done) {
            models.Group.find().or([{
                members: { $in: [self._id] }
            }, {
                driver: self._id
            }]).exec(function (err, groups) {
                if (err) 
                    return done(err);
                async.eachSeries(groups, function (group, done) {
                    group.members.pull(self.id);
                    if (group.driver && group.driver.toString() === self.id)
                        group.driver = undefined; // unset
                    group.save(done);
                }, done);
            });
        }
    ], next);
});
// check password given is valid
UserSchema.methods.checkPassword = function (password, callback) {
    bcrypt.compare(password, this.local.password, callback);
};
// check user's role
UserSchema.methods.hasRole = function (role) {
    return this.roles.indexOf(role) > -1;
};
//
UserSchema.methods.hasAnyRole = function (roles) {
    return !!_.intersection(this.roles, roles).length;
};
// find instructors
UserSchema.statics.findByRole = function (role) {
    return this.find({ roles: { $in: [role] }}).sort({ 'name.first': 1, 'name.last': 1 });
};
// Find users by search query
UserSchema.statics.findByQuery = function (query, done) {
    let $and = [];
    if (query.q) {
        let re = new RegExp('(' + query.q.replace(/\s/, '|').trim() + ')', 'i');
        $and.push({
            $or: [
                { 'name.first': re },
                { 'name.last': re },
                { 'student.UTORid': re },
                { 'student.number': re },
                { 'local.email': re }
            ]
        });
    }
    if (query.role) {
        $and.push({ 
            roles: { $in: [query.role] }
        });
    }
    return this.find().and($and).sort({ 'name.first': 1, 'name.last': 1 }).exec(done);
};

module.exports = mongoose.model('User', UserSchema);