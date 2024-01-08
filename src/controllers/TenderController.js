const Tender = require("../modals/tenderModel");
const Lot = require("../modals/tenderLotModel");

const TenderController = {
  createTender: async (req, res) => {
    try {
      const { name, startDate, endDate, lots } = req.body;

      // Step 1: Create a new tender instance
      const newTender = new Tender({
        name,
        startDate,
        endDate,
        status: getStatus(startDate, endDate),
      });

      // Step 2: Save the new tender to the database
      const savedTender = await newTender.save();

      // Step 3: Create lots and associate them with the saved tender
      const lotsToInsert = lots.map((lot) => ({
        ...lot,
        tenderId: savedTender._id,
        status: "pending",
      }));
      const createdLots = await Lot.insertMany(lotsToInsert);

      // Update the tender with the created lots
      savedTender.lots = createdLots.map((lot) => lot._id);
      await savedTender.save();

      res.status(201).json(savedTender); // Return the saved tender with lots as JSON
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getActiveTender: async (req, res) => {
    try {
      const currentDate = new Date();

      // Find all active tenders with an end date greater than the current date
      const activeTenders = await Tender.find({
        endDate: { $gt: currentDate },
        status: "ACTIVE",
      }).lean();

      // Calculate remaining time for each active tender
      activeTenders.forEach((tender) => {
        const endDate = new Date(tender.endDate);
        const remainingTime = endDate.getTime() - currentDate.getTime(); // Remaining time in milliseconds
        const hoursRemaining = Math.floor(remainingTime / (1000 * 60 * 60)); // Convert milliseconds to hours

        tender.remainingTime = hoursRemaining; // Add remaining time to the tender object
      });

      res.status(200).json(activeTenders);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  editTender: async (req, res) => {
    try {
      const { tenderId } = req.params;
      const { name, startDate, endDate, status } = req.body;

      // Find the existing tender by ID
      const existingTender = await Tender.findById(tenderId);

      if (!existingTender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      // Update the tender details if provided in the request
      if (name) {
        existingTender.name = name;
      }

      if (startDate) {
        existingTender.startDate = startDate;
      }

      if (endDate) {
        existingTender.endDate = endDate;
      }

      if (status) {
        // Update status to 'closed' if provided
        if (status.toLowerCase() === "mark as close") {
          existingTender.status = "closed";
        } else {
          // Handle other status updates if needed
          existingTender.status = status;
        }
      }

      // Save the updated tender details
      const updatedTender = await existingTender.save();

      res.status(200).json(updatedTender); // Return the updated tender details as JSON
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  editTenderLots: async (req, res) => {
    try {
      const { lotId } = req.params;

      const updatedFields = req.body; // Fields to be updated for the lot

      // Find the lot by ID and update its details
      const lot = await Lot.findByIdAndUpdate(
        lotId,
        { $set: updatedFields },
        { new: true }
      );

      if (!lot) {
        return res.status(404).json({ message: "Lot not found" });
      }

      res
        .status(200)
        .json({ message: "Lot details updated successfully", lot });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getAlluserBids: async (req, res) => {
    try {
      const { lotId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const sortCriteria = { price: -1 }; // Sort by price in descending order

      const query = { lotId };

      const bidsCount = await Bid.countDocuments(query);
      const totalPages = Math.ceil(bidsCount / limit);
      const skip = (page - 1) * limit;

      const userBids = await Bid.find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();

      res.status(200).json({
        totalPages,
        currentPage: page,
        userBids,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  getTenderbyId: async (req, res) => {
    try {
      const { tenderId } = req.params;

      // Find the tender by ID including all lots
      const foundTender = await Tender.findById(tenderId).populate("lots");

      if (!foundTender) {
        return res.status(404).json({ message: "Tender not found" });
      }

      res.status(200).json(foundTender); // Return the tender with associated lots as JSON
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

const getStatus = (startDate, endDate) => {
  const currentDate = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start > currentDate) {
    return "INQUE";
  } else if (start <= currentDate && end >= currentDate) {
    return "ACTIVE";
  } else {
    return "EXPIRED";
  }
};

module.exports = TenderController;
