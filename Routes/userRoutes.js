const express = require("express")
const router = express.Router();
const userController = require('../Controllers/userController')

router.route('/register').post(userController.Register);
router.route('/login').post(userController.Login);

router.route('/conversation').post(userController.CreateConversationFunction)
router.route('/conversation/:userId').get(userController.GetConversationFunction)

router.route('/message').post(userController.CreateMessageFunction)
router.route('/message/:conversationId').get(userController.GetMessageFunction)

router.route('/users').get(userController.GetAllUsers)
router.route('/user/:token').get(userController.GetUser)





module.exports = router;