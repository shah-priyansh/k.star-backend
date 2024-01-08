const router = require("express").Router();

router.use("/auth", require("./authRouter"));
router.use("/tender", require("./tenderRouter"));


module.exports = router;

