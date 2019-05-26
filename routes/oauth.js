const express = require('express'),
    router = express.Router();

router.get('/', (req, res) => {
    res.send('oauth')
} )

module.exports = router;