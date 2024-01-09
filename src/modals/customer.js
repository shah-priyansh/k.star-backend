const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
   customerName: { type: String, required: true },
   fatherName: { type: String, required: true },
   surname: { type: String, required: true },
   mobileNumber: { type: String, required: true, unique: true },
   villageName: { type: String, required: true },
   agentName: { type: String, required: true },
   profile_photo: { type: String, required: true },
   otp: { type: String } 
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
