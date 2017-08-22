const fetch = require('node-fetch');
const config = require('./config').hub;
const baseUrl = config.port ? `${config.domain}:${config.port}/api` : `${config.domain}/api`; 

function fetchAllUsers(cb) {
    
    fetch(baseUrl + '/users')
        .then(function(res) {
            return res.json();
        })
        .then(function(users){
            cb(null, users);
        })
        .catch(function(err) {
            cb(err, null);
        });
}


module.exports = {
    fetchAllUsers : fetchAllUsers
}