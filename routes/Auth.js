const express = require("express");
const { createUser, updateUser, loginUser } = require("../controllers/Auth");
const { auth, isAdmin } = require("../middlewares/auth");
const router = express.Router();



router.route("/signup_user").post(auth , isAdmin , createUser);
router.route("/update_user/:id").put(auth , isAdmin ,updateUser);


router.route("/login_user").post(loginUser);



module.exports = router