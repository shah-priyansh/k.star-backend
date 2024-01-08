const Bid = require("../modals/bidModel");
const Lot = require("../modals/tenderLotModel");

const BidController = {
  createBid: async (req, res) => {
    try {
      const { price } = req.body;
      const { lotId } = req.params;

      // Assuming you have a way to get the userId (e.g., from authentication middleware)
      const userId = req.userId;

      // Validate the price or any other bid details

      // Create a new bid instance
      const newBid = new Bid({
        lotId,
        userId,
        price,
        status: "pending",
      });

      // Save the new bid to the database
      const savedBid = await newBid.save();

      res.status(201).json(savedBid); // Respond with the saved bid details
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getuserBids: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      // Fetch all bids made by the user
      const userBids = await Bid.find({ userId }).populate({
        path: "lotId",
        model: "Lot",
        populate: {
          path: "tenderId",
          model: "Tender",
        },
      });

      // Filter bids based on status
      const filteredBids =
        status === "won"
          ? userBids.filter((bid) => bid.lotId.status === "won")
          : userBids;

      res.status(200).json(filteredBids);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  markAsWon: async () => {
    try {
      const { bidId } = req.params;
      const { status } = req.body;

      // Find the bid by ID
      const bid = await Bid.findById(bidId);

      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      // Fetch all bids for the lot associated with the current bid
      const allBidsForLot = await Bid.find({ lotId: bid.lotId });

      if (status === "won") {
        // Mark the current bid as 'won' and update the lot status to 'done'
        bid.status = "won";

        const lot = await Lot.findOne({ _id: bid.lotId });

        if (!lot) {
          return res.status(404).json({ message: "Lot not found" });
        }

        lot.status = "done";

        // Mark all other bids for this lot as 'rejected'
        await Promise.all(
          allBidsForLot.map(async (otherBid) => {
            if (otherBid._id.toString() !== bidId) {
              otherBid.status = "rejected";
              await otherBid.save();
            }
          })
        );
      } else if (status === "rejected") {
        // Mark the current bid as 'rejected'
        bid.status = "rejected";
      } else {
        return res.status(400).json({ message: "Invalid status provided" });
      }

      await bid.save();

      res.status(200).json({ message: "Bid status updated" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = BidController;
