import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./assets/logo.png";  // Ensure this path is correct

const Home = ({ onLogout }) => {
  const [fullName, setFullName] = useState("");
  const [expenses, setExpenses] = useState([]); // Original data
  const [filteredExpenses, setFilteredExpenses] = useState([]); // Displayed data
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    date: "",
  });
  const [message, setMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true); // Sorting order

  // Retrieve username
  const username = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (username) {
      fetchUserInfo();
      fetchExpenses();
    }
  }, [username]);

  // Fetch the User's Full Name
  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_user_info?username=${username}`);
      const data = await response.json();
      if (data.success) {
        setFullName(data.name);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch all Expenses (once) and store in state
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_expenses?username=${username}`);
      const data = await response.json();

      if (data.success) {
        // Format dates & store timestamps for sorting
        const formattedExpenses = data.expenses.map((expense) => {
          let dateObj = new Date(expense.date);
          let formattedDate = `${
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

        // Default sort: latest first
        formattedExpenses.sort((a, b) => b.timestamp - a.timestamp);
        setExpenses(formattedExpenses);
        setFilteredExpenses(formattedExpenses);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error fetching expenses.");
    }
  };

  // Handle input changes for manual expense addition
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle manual expense submission
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
        // Refresh expenses and reset form
        await fetchExpenses();
        setFormData({ name: "", amount: "", category: "", date: "" });
        setIsModalOpen(false);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error adding expense.");
    }
  };

  // Sort by date (ascending/descending)
  const handleSort = () => {
    const sortedExpenses = [...filteredExpenses].sort((a, b) =>
      isAscending ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );
    setFilteredExpenses(sortedExpenses);
    setIsAscending(!isAscending); // Toggle order
  };

  // Search by Name
  const handleSearch = () => {
    const filtered = expenses.filter((expense) =>
      expense.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExpenses(filtered);
  };

  // Handle checkbox selection
  const handleCheckboxChange = (expenseId) => {
    setSelectedExpenses((prevSelected) =>
      prevSelected.includes(expenseId)
        ? prevSelected.filter((id) => id !== expenseId)
        : [...prevSelected, expenseId]
    );
  };

  // Handle delete confirmation
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
        setExpenses(expenses.filter((exp) => !selectedExpenses.includes(exp.id)));
        setFilteredExpenses(filteredExpenses.filter((exp) => !selectedExpenses.includes(exp.id)));
        setSelectedExpenses([]); // Clear selection
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error deleting expenses.");
    }
  };

  // Reset search and sort (go back to original data)
  const handleReset = () => {
    setFilteredExpenses(expenses);
    setSearchQuery("");
  };

  // Upload Receipt
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadMessage("Uploading receipt...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", username);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/upload_expense", {
        method: "POST",
        body: formData,
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

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  };

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
          <li>Profile</li>
          <li>Set Alerts</li>
          <li
            onClick={() => {
              setIsUploadModalOpen(true);
              setIsModalOpen(false); // Close "Add Line" modal if open
            }}
          >
            Upload Receipt
          </li>
          <li>Link Bank (Coming Soon)</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>
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

      {/* Search, Sort, and Reset Controls */}
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

      {/* Add Line Button */}
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

      {/* Add Line Modal */}
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
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
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
