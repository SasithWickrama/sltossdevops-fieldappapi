const controller = require ("./customer.controllers");
const router = require("express").Router();
const { checkToken } = require("../../auth/auth.token");

router.post("/getservices",controller.services);
router.post("/getdetails",controller.details);
router.post("/getbill",controller.bills);
router.post("/getpendingFaults",controller.pendingFaults);
router.post("/getbroadbandusage", controller.broadBandUsage);
router.post("/getbroadbandpwreset", controller.broadBandPwReset);
router.post("/getpeotvbind", controller.peoTvBind);


module.exports = router;