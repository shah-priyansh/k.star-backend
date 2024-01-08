const router = require("express").Router();
const BidController = require("../../controllers/BidController");
const TenderController = require("../../controllers/TenderController");


//admin route
router.post("/", TenderController.createTender);
router.post("/active", TenderController.getActiveTender);
router.put("/:tenderId", TenderController.editTender);
router.get("/:tenderId", TenderController.getTenderbyId);

router.get("/lots/:lotId/all-user-bids", TenderController.getAlluserBids);
router.put("/lots/:lotId", TenderController.editTenderLots);

router.post("/bids/:bidId/mark", BidController.markAsWon);

//customer route
router.post("/lots/:lotId/bids", BidController.createBid);
router.get("/user/:userId/bid-history", BidController.getuserBids);



module.exports = router;
