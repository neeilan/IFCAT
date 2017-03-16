module.exports = {
    db: {
        url : 'mongodb://selvali2:selvali2@localhost:27017/IQC'
    },
    session: {
        name: null,
        secret: 'thisismysecret'
    },
    auth0: {
        domain: 'uteachiqc.auth0.com',
        clientId: 'G2iMUTLxNL8kDGPxZxSwQafhMPeEgBao' ,
        clientSecret: 'xCqS5e5W2qshO4LlYQIJXWrNfGSqpJ5Y4glJ-3QHsFkrBZp1crNKcdvWnZU8bJTr',
        callbackUrl: 'http://142.1.97.144:8080/login/callback'
    },
    uploadPath: __dirname + '/../public/upl'
};
