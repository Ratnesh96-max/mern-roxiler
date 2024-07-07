const axios = require("axios");
const Transaction = require("../models/Transaction");

const THIRD_PARTY_API_URL =
  "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get(THIRD_PARTY_API_URL);
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    res.status(200).send("Database initialized with seed data.");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// List all transactions with search and pagination
const listTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = "", month } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { price: new RegExp(search, "i") },
    ];
  }

  if (month) {
    query.dateOfSale = {
      $regex: new RegExp(`-${month}-`, "i"),
    };
  }

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const count = await Transaction.countDocuments(query);

    res.status(200).json({ transactions, count });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Statistics API
const getStatistics = async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = {
      $regex: new RegExp(`-${month}-`, "i"),
    };
  }

  try {
    const totalSaleAmount = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: "$price" } } },
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      ...query,
      sold: true,
    });
    const totalNotSoldItems = await Transaction.countDocuments({
      ...query,
      sold: false,
    });

    res.status(200).json({
      totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Bar chart data API
const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = {
      $regex: new RegExp(`-${month}-`, "i"),
    };
  }

  const priceRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: "301-400", min: 301, max: 400 },
    { range: "401-500", min: 401, max: 500 },
    { range: "501-600", min: 501, max: 600 },
    { range: "601-700", min: 601, max: 700 },
    { range: "701-800", min: 701, max: 800 },
    { range: "801-900", min: 801, max: 900 },
    { range: "901-above", min: 901, max: Infinity },
  ];

  try {
    const barChartData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          ...query,
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      })
    );

    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Pie chart data API
const getPieChartData = async (req, res) => {
  const { month } = req.query;
  const query = {};

  if (month) {
    query.dateOfSale = {
      $regex: new RegExp(`-${month}-`, "i"),
    };
  }

  try {
    const pieChartData = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Combined data API
const getCombinedData = async (req, res) => {
  try {
    const [
      transactionsResponse,
      statisticsResponse,
      barChartResponse,
      pieChartResponse,
    ] = await Promise.all([
      listTransactions(req, res),
      getStatistics(req, res),
      getBarChartData(req, res),
      getPieChartData(req, res),
    ]);

    res.status(200).json({
      transactions: transactionsResponse,
      statistics: statisticsResponse,
      barChart: barChartResponse,
      pieChart: pieChartResponse,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
  getCombinedData,
};
