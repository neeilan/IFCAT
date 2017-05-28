module.exports = {
    db: {
        url : 'mongodb://localhost:27017/ifcat'
    },
    session: {
        name: null,
        secret: 'thisismysecret'
    },
    auth0: {
        domain: 'uteachiqc.auth0.com',
        clientId: 'G2iMUTLxNL8kDGPxZxSwQafhMPeEgBao' ,
        clientSecret: 'xCqS5e5W2qshO4LlYQIJXWrNfGSqpJ5Y4glJ-3QHsFkrBZp1crNKcdvWnZU8bJTr',
        callbackUrl: 'localhost:8080/login/callback'
    },
    uploadPath: __dirname + '/../public/upl'
};
