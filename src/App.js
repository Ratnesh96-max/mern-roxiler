import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MonthDropdown from "./components/MonthDropdown";
import TransactionsTable from "./components/TransactionsTable";
import StatisticsBox from "./components/StatisticsBox";
import BarChart from "./components/BarChart";

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState(3); // Default to March
  const [transactions, setTransactions] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [barChartData, setBarChartData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get(`/api/transactions`, {
        params: {
          month: selectedMonth,
          search: searchText,
          page: currentPage,
        },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [selectedMonth, searchText, currentPage]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get(`/api/statistics`, {
        params: { month: selectedMonth },
      });
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [selectedMonth]);

  const fetchBarChartData = useCallback(async () => {
    try {
      const response = await axios.get(`/api/bar-chart`, {
        params: { month: selectedMonth },
      });
      setBarChartData(response.data);
    } catch (error) {
      console.error("Error fetching bar chart data:", error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
  }, [fetchTransactions, fetchStatistics, fetchBarChartData]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setCurrentPage(1); // Reset to first page on month change
  };

  const handleSearchChange = (search) => {
    setSearchText(search);
    setCurrentPage(1); // Reset to first page on search change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <MonthDropdown
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
      />
      <StatisticsBox statistics={statistics} />
      <TransactionsTable
        transactions={transactions}
        handleSearchChange={handleSearchChange}
        searchText={searchText}
        handlePageChange={handlePageChange}
        currentPage={currentPage}
      />
      <BarChart data={barChartData} />
    </div>
  );
};

export default App;
