import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./assets/logo.png";

const Home = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  // Retrieve username
  const username = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (username) {
      fetchExpenses();
    }
  }, [username]);

  // Fetch Expenses and Format Dates
  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/get_expenses?username=${username}`
      );
      const data = await response.json();

      if (data.success) {
        const formattedExpenses = data.expenses.map((expense) => {
          let dateObj = new Date(expense.date);
          let formattedDate = `${
            ("0" + (dateObj.getMonth() + 1)).slice(-2)
          }-${("0" + dateObj.getDate()).slice(-2)}-${dateObj
            .getFullYear()
            .toString()
            .slice(-2)}`;

          return { ...expense, date: formattedDate };
        });

        setExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  // Handle Search
  const filteredExpenses = expenses.filter((expense) =>
    expense.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Sorting
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    let valueA, valueB;

    if (sortField === "date") {
      valueA = new Date(a.date);
      valueB = new Date(b.date);
    } else {
      valueA = a.name.toLowerCase();
      valueB = b.name.toLowerCase();
    }

    return sortOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });

  return (
    <div className="home-container">
      {/* Header */}
      <div className="header">
        <button className="menu-btn">☰</button>
        <div className="logo-container">
          <img src={logo} alt="PennyWise Logo" className="logo" />
          <h2>PennyWise</h2>
        </div>
      </div>

      {/* Transactions Table with Search & Sort on Top */}
      <div className="expense-table-container">
        <h3>Transactions</h3>

        {/* Search & Sort Controls */}
        <div className="search-sort-container">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar"
          />

          <select
            className="sort-dropdown"
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>

          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            {sortOrder === "asc" ? "⬆ Asc" : "⬇ Desc"}
          </button>
        </div>

        {/* Transactions Table */}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.name}</td>
                <td>${expense.amount}</td>
                <td>{expense.category}</td>
                <td>{expense.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
