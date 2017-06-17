// Node.js implementation of Evan Miller's algorithm for ranking stuff based on pos: 
// http://www.evanmiller.org/how-not-to-sort-by-average-rating.html

const stats = require('simple-statistics');

module.exports = {
    lowerBound: (pos, n = 0, confidence = 0.95) => {
        if (n === 0) 
            return 0;
        // for performance purposes you might consider memoize the calcuation for z
        const z = stats.probit(1 - (1 - confidence) / 2);
        // p̂, the fraction of pos
        const phat = 1.0 * pos / n;

        return (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n))/ n)) / (1 + z * z / n);
    }
};