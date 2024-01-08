const cron = require("node-cron");
const Tender = require("../modals/tenderModel");

// Function to update tender statuses based on current date
const updateTendersStatus = async () => {
  const currentDate = new Date();
  try {
    await Tender.updateMany(
      {
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      },
      { $set: { status: "ACTIVE" } }
    );

    await Tender.updateMany(
      {
        startDate: { $gt: currentDate },
        endDate: { $gt: currentDate },
      },
      { $set: { status: "INQUE" } }
    );

    await Tender.updateMany(
      { endDate: { $lt: currentDate } }, // End date before current date
      { $set: { status: "EXPIRED" } }
    );

    console.log("Tenders statuses updated successfully.");
  } catch (error) {
    console.error("Error updating tenders statuses:", error);
  }
};

// Schedule the cron job to run every day at midnight (adjust the schedule as needed)
cron.schedule("0 * * * *", () => {
  updateTendersStatus();
});
