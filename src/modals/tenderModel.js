// tenderModel.js
const mongoose = require("mongoose");

const tenderSchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  status: String,
  lots: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lot" }],
});

const Tender = mongoose.model("Tender", tenderSchema);

module.exports = Tender;
