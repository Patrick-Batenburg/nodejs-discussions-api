const router = require('express').Router();
const ThreadController = require(APP_CONTROLLER_PATH + 'thread');
let threadController = new ThreadController();

router.get('/', threadController.getAll);
router.get('/:id', threadController.get);
router.post('/', threadController.create);
router.delete('/:threadId/:userId', threadController.remove);
router.put('/:id', threadController.update);

module.exports = router;