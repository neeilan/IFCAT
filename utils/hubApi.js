const fetch = require('node-fetch');
const config = require('./config').hub;
const baseUrl = config.port ? `${config.domain}:${config.port}/api` : `${config.domain}/api`; 
console.log(baseUrl)

function fetchAllUsers(cb) {
    
    fetch(baseUrl + '/users')
        .then(function(res) {
            return res.json();
        })
        .then(cb);
}

module.exports = {
    fetchAllUsers : fetchAllUsers
}