const mongoose = require("mongoose");

const connectDB = () => {
  const url =
    "mongodb+srv://k_star:ZyKwsAlvbZmAHKvK@cluster0.zivy5.mongodb.net/k_star";

  try {
    mongoose.connect(url);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log(`Database connected sucessfully`);
  });

  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
};
module.exports = connectDB;
