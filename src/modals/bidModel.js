const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  lotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  // Other bid properties you may need
}, { timestamps: true });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;