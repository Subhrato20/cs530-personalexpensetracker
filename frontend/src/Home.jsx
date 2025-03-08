import React, { useState, useEffect } from "react";
import "./Home.css";
import logo from "./assets/logo.png";  // Ensure this path is correct

const Home = ({ onLogout }) => {
  const [expenses, setExpenses] = useState([]);
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
  const [filterYear, setFilterYear] = useState("2025");

  // Retrieve username
  const username = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (username) {
      fetchExpenses();
    }
  }, [username]);

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/get_expenses?username=${username}`
      );
      const data = await response.json();

      if (data.success) {
        // Format dates to MM-DD-YY
        const formattedExpenses = data.expenses.map(expense => {
          let dateObj = new Date(expense.date);
          let formattedDate = `${
            ("0" + (dateObj.getMonth() + 1)).slice(-2)
          }-${("0" + dateObj.getDate()).slice(-2)}-${dateObj.getFullYear().toString().slice(-2)}`;

          return { ...expense, date: formattedDate };
        });

        setExpenses(formattedExpenses);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error fetching expenses.");
    }
  };

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Manual Expense Submission
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
        fetchExpenses();
        setFormData({ name: "", amount: "", category: "", date: "" });
        setIsModalOpen(false); // Close modal on success
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error adding expense.");
    }
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
      const response = await fetch(
        "http://127.0.0.1:5000/api/upload_expense",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      setUploadMessage(data.message);

      if (data.success) {
        fetchExpenses();
        setTimeout(() => setIsUploadModalOpen(false), 1000); // Auto-close modal after success
      }
    } catch (error) {
      setUploadMessage("Error uploading receipt.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "/";
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
          <li onClick={() => {
            setIsUploadModalOpen(true);
            setIsModalOpen(false); // Close "Add Line" modal if open
          }}>
            Upload Receipt
          </li>
          <li>Link Bank (Coming Soon)</li>
          <li>Settings</li>
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

      {/* Transactions Table */}
      <div className="expense-table-container">
        <h3>Transactions</h3>
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
            {expenses
              .filter((expense) =>
                expense.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((expense, index) => (
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

      {/* Add Line Button */}
      <button className="add-line-btn" onClick={() => {
        setIsModalOpen(true);
        setIsUploadModalOpen(false); // Close upload modal if open
      }}>
        Add Line
      </button>

      {/* Add Line Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Expense</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Expense Name" value={formData.name} onChange={handleChange} required />
              <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
              <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              <button type="submit">Add Expense</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </form>
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
