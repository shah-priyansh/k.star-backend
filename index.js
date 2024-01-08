// index.js

const express = require('express');
const cors = require('cors');
const router = require('./src/routes');
const connectDB = require('./src/config/db');

const app = express();

const port = process.env.PORT || 5000;


// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow cors
app.use(cors());

// mongoose connection
connectDB();

// Apply the middleware globally for all routes
app.use(router);


// Routes

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
 const error = new Error("Not Found");
 error.status = 404;
 next(error);
});

// Development error handler
// Will print stacktrace
if (app.get("env") === "development") {
 app.use(function (error, req, res, next) {
    res.status(error.status || 500);
    res.send({
      message: error.message,
      error: error,
    });
 });
}

// Production error handler
// No stacktraces leaked to user
app.use(function (error, req, res, next) {
 res.status(error.status || 500);
 res.send({
    message: error.message,
    error: error,
 });
});

app.listen(port, () =>
 console.log(`Server is running on  http://localhost:${port}`)
);
