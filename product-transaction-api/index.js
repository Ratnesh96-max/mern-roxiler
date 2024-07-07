const express = require("express");
const mongoose = require("mongoose");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/productTransactionDB")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

app.use("/api", transactionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
