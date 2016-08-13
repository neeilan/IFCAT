var bcrypt = require('bcryptjs'),
    mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

    roles: {
        type: Array,
        enum: ['admin', 'instructor', 'teaching assistant', 'student']
    },
    lectures: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Lecture'  } ],
    tutorials: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Tutorial'  } ],
    groups: [ { type : mongoose.Schema.Types.ObjectId, ref: 'Tutorial'  } ]
});

// hash password using salt before saving
UserSchema.pre('save', function (next) {
    if (this.password) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(this.password, salt, function (err, hash) {
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
