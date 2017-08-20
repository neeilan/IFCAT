const fetch = require('node-fetch');
const config = require('./config').hub;
const baseUrl = config.port ? `${config.domain}:${config.port}/api` : `${config.domain}/api`; 
console.log(baseUrl)

function fetchAllUsers(cb) {
    
    fetch(baseUrl + '/users')
        .then(function(res) {
            cb(null, res.json());
        })
        .catch(function(err) {
            cb(err, null);
        });
}

module.exports = {
    fetchAllUsers : fetchAllUsers
}