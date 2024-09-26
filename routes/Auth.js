const express = require("express");
const { createUser, updateUser, loginUser, loadUser, logoutUser } = require("../controllers/Auth");
const { auth, isAdmin } = require("../middlewares/auth");
const router = express.Router();



router.route("/signup_user").post(auth , isAdmin , createUser);
router.route("/update_user/:id").put(auth , isAdmin ,updateUser);


router.route("/login_user").post(loginUser);
router.route("/load_user").get( auth , loadUser);
router.route("/logout").post( logoutUser);



module.exports = router