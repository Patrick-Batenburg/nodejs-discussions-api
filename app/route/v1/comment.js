const router = require('express').Router();
const CommentController = require(APP_CONTROLLER_PATH + 'comment');
let commentController = new CommentController();

router.get('/', commentController.getAll);
router.get('/:id', commentController.get);
router.post('/:id', commentController.create);
router.delete('/:id', commentController.remove);
router.put('/:id', commentController.update);

module.exports = router;