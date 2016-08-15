var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    utorId: String,
    roles: {
        type: Array,
        enum: ['admin', 'instructor', 'teachingAssistant', 'student']
    },
    teachingAssistant: {
        tutorials: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Tutorial'  } ],
    },
    instructor: {
        courses: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Course'  } ],
    },
    student: {
        courses: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Course'  } ],
        tutorials: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Tutorial'  } ],
        groups: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Group'  } ]
    }
});

// hash password using salt before saving
UserSchema.pre('save', function (next) {
    if (this.password) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) throw err;
            bcrypt.hash(this.password, salt, function (err, hash) {
                if (err) throw err;
                this.password = hash;
                next();
            });
        });
    }
});

UserSchema.methods = {
    authenticate: function (password, callback) {
        bcrypt.compare(password, this.password, callback);
    }
};

module.exports = mongoose.model('User', UserSchema);
