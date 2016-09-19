var _ = require('lodash'),
    bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');
    
var UserSchema = new mongoose.Schema({
    local: {
        email: { 
            type: String,
            lowercase: true,
            unique: true
        },
        password: String
    },
    oauth: {
        id: String,
        token: String,
    },
    UTORid: String, // not sure if we are using it
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
        enum: ['admin', 'instructor', 'teachingAssistant', 'student'],
        default: 'student'
    }]
});
// get full name
UserSchema.virtual('name.full').get(function () {
    return this.name.first + ' ' + this.name.last;
});
// generate salt
UserSchema.methods.generateHash = function (s) {
    return bcrypt.hashSync(s, bcrypt.genSaltSync(10), null);
};
// check password is valid
UserSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.local.password);
};
// generate salt
UserSchema.methods.addRole = function (role) {
    if (this.hasRole(role) === false) {
        this.roles.push(role);
    }
};
// check user's role
UserSchema.methods.hasRole = function (role) {
    return this.roles.indexOf(role) !== -1;
};
// Save user
UserSchema.methods.store = function (obj, callback) {
    this.name.first = obj.name.first;
    this.name.last = obj.name.last;
    this.roles = obj.roles;
    this.UTORid = obj.UTORid;
    this.local.email = obj.local.email;
    if (obj.local.password) {
        this.local.password = this.generateHash(obj.local.password);
    }
    return this.save(callback);
};
// sort users by roles, first name, and last name
UserSchema.statics.sortByRole = function (users) {
    var roles = this.schema.path('roles').caster.enumValues;
    return _.sortBy(users, function (user) {
        var index = roles.indexOf(user.roles[0]);
        if (index > -1) {
            return index;
        }
        return roles.length; // highest number
    }, 'name.first', 'name.last');
};
// find instructors
UserSchema.statics.findUsersByRole = function (role) {
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
UserSchema.statics.findUsersBySearchQuery = function (query, role) {
    // build regular expression e.g. 'first last' => /(first|last)/i
    var regexp = new RegExp('(' + query.replace(/\s/, '|').trim() + ')', 'i');
    // query based on UTORid, name, or email
    return this.find().and([
        {
            roles: {
                $in: [role]
            }  
        }, 
        {
            $or: [
                { 'UTORid': regexp },
                { 'name.first': regexp },
                { 'last.first': regexp },
                { 'local.email': regexp }
            ]
        }
    ]).sort({
        'name.first': 1,
        'name.last': 1
    });
};
// find user by UTORid
UserSchema.statics.findUserByUTOR = function (UTORid) {
    return this.findOne({ UTORid: UTORid });
};
// find user by email address
UserSchema.statics.findUserByEmail = function (email) {
    return this.findOne({ 'local.email': email });
};

module.exports = mongoose.model('User', UserSchema);