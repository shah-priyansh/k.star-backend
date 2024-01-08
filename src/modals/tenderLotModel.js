// tenderModel.js
const mongoose = require("mongoose");

const lotSchema = new mongoose.Schema({
  lot_num: {
    type: String,
    required: true,
  },
  description: String,
  total_carat: Number,
  no_stone: Number,
  size: String,
  tenderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tender", // Reference to the Tender model
    required: true,
  },
});

const Lot = mongoose.model("Lot", lotSchema);

module.exports = Lot;
