import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "./assets/logo.png";

const Home = ({ username, onLogout }) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States for add/delete/upload functionality
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    if (!username) {
      navigate("/signin");
    } else {
      fetchUserInfo();
      fetchExpenses();
    }
  }, [username, navigate]);

  // Fetch user's full name
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/get_user_info?username=${username}`
      );
      const data = await response.json();
      if (data.success) {
        setFullName(data.name);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/get_expenses?username=${username}`
      );
      const data = await response.json();
      if (data.success) {
        // Format and sort by date desc
        const formattedExpenses = data.expenses.map((expense) => {
          const dateObj = new Date(expense.date);
          const formattedDate = `${
            ("0" + (dateObj.getMonth() + 1)).slice(-2)
          }-${("0" + dateObj.getDate()).slice(-2)}-${dateObj
            .getFullYear()
            .toString()
            .slice(-2)}`;

          return {
            ...expense,
            date: formattedDate,
            timestamp: dateObj.getTime(),
          };
        });

        // Sort newest first by default
        formattedExpenses.sort((a, b) => b.timestamp - a.timestamp);
        setExpenses(formattedExpenses);
        setFilteredExpenses(formattedExpenses);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  // SORT by date
  const handleSort = () => {
    const sortedExpenses = [...filteredExpenses].sort((a, b) =>
      isAscending ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );
    setFilteredExpenses(sortedExpenses);
    setIsAscending(!isAscending);
  };

  // SEARCH by name
  const handleSearch = () => {
    const filtered = expenses.filter((expense) =>
      expense.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  // RESET search
  const handleReset = () => {
    setFilteredExpenses(expenses);
    setSearchQuery("");
  };

  // Input changes in "Add Transaction" form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ADD transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = { ...formData, username };

    try {
      const response = await fetch("http://127.0.0.1:5000/api/add_expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        await fetchExpenses(); // Refresh
        setFormData({ name: "", amount: "", category: "", date: "" });
        setIsModalOpen(false);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error adding expense.");
    }
  };

  // CHECKBOX for deleting
  const handleCheckboxChange = (expenseId) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(expenseId)
        ? prevSelected.filter((id) => id !== expenseId)
        : [...prevSelected, expenseId]
    );
  };

  // DELETE selected transactions
  const handleDelete = async () => {
    if (!selectedExpenses.length) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the selected expenses?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/api/delete_expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense_ids: selectedExpenses }),
      });

      const data = await response.json();
      if (data.success) {
        setExpenses((prev) =>
          prev.filter((exp) => !selectedExpenses.includes(exp.id))
        );
        setFilteredExpenses((prev) =>
          prev.filter((exp) => !selectedExpenses.includes(exp.id))
        );
        setSelectedExpenses([]);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error deleting expenses.");
    }
  };

  // UPLOAD receipt
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploadMessage("Uploading receipt...");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("username", username);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload_expense", {
        method: "POST",
        body: uploadForm,
      });
      const data = await response.json();
      setUploadMessage(data.message);

      if (data.success) {
        await fetchExpenses();
        setTimeout(() => setIsUploadModalOpen(false), 1000);
      }
    } catch (error) {
      setUploadMessage("Error uploading receipt.");
    }
  };

  // ----------------------------------------------------------------------------------
  // STACKED BAR BY CATEGORY
  // ----------------------------------------------------------------------------------

  const categoriesMap = expenses.reduce((acc, expense) => {
    const cat = expense.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const totalSpent = Object.values(categoriesMap).reduce((sum, val) => sum + val, 0);

  const colorPalette = [
    "#4CAF50", // Green
    "#2196F3", // Blue
    "#FF9800", // Orange
    "#9C27B0", // Purple
    "#F44336", // Red
    "#795548", // Brown
    "#009688", // Teal
    "#673AB7", // Deep Purple
    "#E91E63", // Pink
    "#3F51B5", // Indigo
    "#00BCD4", // Cyan
    "#8BC34A", // Light Green
    "#FFC107", // Amber
    "#FF5722", // Deep Orange
    "#607D8B", // Blue Grey
    "#CDDC39", // Lime
    "#03A9F4", // Light Blue
    "#9E9E9E", // Grey
    "#FFEB3B", // Yellow
    "#E65100", // Dark Orange
    "#1A237E", // Dark Indigo
    "#4DD0E1", // Light Teal
    "#004D40", // Dark Teal
    "#D32F2F", // Dark Red
    "#F48FB1", // Light Pink
    "#CE93D8", // Light Purple
    "#37474F", // Dark Blue Grey
    "#AED581", // Light Lime Green
    "#FDD835", // Deep Yellow
    "#D1C4E9", // Lavender
    "#00796B", // Dark Tealish
    "#C51162", // Dark Pinkish
    "#FFF59D", // Very Light Yellow
    "#6D4C41", // Dark Brown
    "#263238", // Almost black (very dark grey)
  ];
  

  // We'll render each category as a segment in a flex container
  // Each segment's width => (categoryAmount / totalSpent) * 100
  // If totalSpent == 0 (edge case), skip the bar
  // ----------------------------------------------------------------------------------

  return (
    <div className="home-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
          ×
        </button>
        <h2>PennyWise</h2>
        <ul>
          <li>Home</li>
          <li onClick={() => navigate("/profile")}>Profile</li>
          <li>Set Alerts (Coming Soon)</li>
          <li onClick={() => setIsUploadModalOpen(true)}>Upload Receipt</li>
          <li>Link Bank (Coming Soon)</li>
        </ul>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Header */}
      <div className="header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          ☰
        </button>
        <div className="logo-container">
          <img src={logo} alt="PennyWise Logo" className="logo" />
          <h2>PennyWise</h2>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="welcome-message">
        <h1>Welcome, {fullName}!</h1>
      </div>

      {/* 
        ----------------------------------------------------------------------------------
        STACKED BAR (PER-CATEGORY)
        ----------------------------------------------------------------------------------
      */}
      {totalSpent > 0 && (
        <>
          {/* The bar itself */}
          <div className="category-bar-container">
            {Object.entries(categoriesMap).map(([cat, catAmount], idx) => {
              const fraction = (catAmount / totalSpent) * 100;
              const color = colorPalette[idx % colorPalette.length];
              return (
                <div
                  key={cat}
                  className="category-bar-segment"
                  style={{ width: fraction + "%", backgroundColor: color }}
                  title={`${cat}: $${catAmount.toFixed(2)} (${fraction.toFixed(1)}%)`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="category-legend">
            {Object.entries(categoriesMap).map(([cat, catAmount], idx) => {
              const fraction = (catAmount / totalSpent) * 100;
              const color = colorPalette[idx % colorPalette.length];
              return (
                <div className="legend-item" key={cat}>
                  <span
                    className="legend-color"
                    style={{ backgroundColor: color }}
                  />
                  <span className="legend-text">
                    {cat}: ${catAmount.toFixed(2)} ({fraction.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* If totalSpent == 0, you can show a small note or just hide the bar */}
      {totalSpent === 0 && (
        <p style={{ fontStyle: "italic", margin: "1rem 0" }}>
          No expenses yet, so no category breakdown to show.
        </p>
      )}

      {/* Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="control-btn search-btn" onClick={handleSearch}>
          Search
        </button>
        <button className="control-btn sort-btn" onClick={handleSort}>
          Sort by Date {isAscending ? "▲" : "▼"}
        </button>
        <button className="control-btn reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* Transactions Table */}
      <div className="expense-table-container">
        <h3>Transactions</h3>
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedExpenses.includes(expense.id)}
                      onChange={() => handleCheckboxChange(expense.id)}
                    />
                  </td>
                  <td>{expense.name}</td>
                  <td>${expense.amount}</td>
                  <td>{expense.category}</td>
                  <td>{expense.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>
                  No matching transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Delete Buttons */}
      <div className="action-buttons">
        <button
          className="add-line-btn"
          onClick={() => {
            setIsModalOpen(true);
            setIsUploadModalOpen(false);
          }}
        >
          Add Transaction
        </button>
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={!selectedExpenses.length}
        >
          Delete Transaction
        </button>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Expense</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Expense Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={formData.category}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <button type="submit">Add Expense</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}

      {/* Upload Receipt Modal */}
      {isUploadModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Upload Receipt</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="upload-input"
            />
            {uploadMessage && <p className="message">{uploadMessage}</p>}
            <button onClick={() => setIsUploadModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
