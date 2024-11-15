const controller = require ("./user.controllers");
const router = require("express").Router();
const { checkToken } = require("../../auth/auth.token");

router.post("/login",controller.login);


module.exports = router;