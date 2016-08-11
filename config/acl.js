var acl = require('acl'),
    mongoose = require('mongoose');

acl = new acl(new acl.mongodbBackend(mongoose.connection.db, 'acl_'));

// define roles
acl.allow([
    {
        roles: 'admin',
        allows: [
            { resources: '/admin', permissions: '*' }
        ]
    }, {
        roles: 'instructor',
        allows: []
    }, {
        roles: 'teaching assistant',
        allows: []
    }, {
        roles: 'student',
        allows: []
    }, {
        roles: 'guest',
        allows: []
    }
]);

// inherit roles
acl.addRoleParents('admin', 'instructor');
acl.addRoleParents('instructor', 'teaching assistant');
acl.addRoleParents('teaching assistant', 'student');
acl.addRoleParents('students', 'guest');

module.exports = acl;