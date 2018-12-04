const express = require('express'),
    router = express.Router();
const ROUTE_V1_PATH = APP_ROUTE_PATH + "v1/";
router.use('/auth', require(ROUTE_V1_PATH + 'auth'));
router.use('/users', require(ROUTE_V1_PATH + 'user'));
router.use('/threads', require(ROUTE_V1_PATH + 'thread'));
router.use('/comments', require(ROUTE_V1_PATH + 'comment'));

module.exports = router;