module.exports = {
    db: {
        url : 'mongodb://localhost:27017/uteach'
    },
    session: {
        name: null,
        secret: 'thisismysecret'
    },
    auth0 : {
        domain : 'uteachiqc.auth0.com',
        clientId : 'G2iMUTLxNL8kDGPxZxSwQafhMPeEgBao' ,
        clientSecret : 'xCqS5e5W2qshO4LlYQIJXWrNfGSqpJ5Y4glJ-3QHsFkrBZp1crNKcdvWnZU8bJTr',
        callbackUrl : 'https://backend-projects-neeilan.c9users.io/login/callback'
    }
};