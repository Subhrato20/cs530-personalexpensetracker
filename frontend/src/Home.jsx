import React, { useState, useEffect } from "react";
import "./Home.css"; // Import CSS for styling

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

  // ✅ Retrieve username correctly
  const username = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (username) {
      fetchExpenses();
    }
  }, [username]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_expenses?username=${username}`);
      const data = await response.json();
      if (data.success) {
        setExpenses(data.expenses);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error fetching expenses.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
        fetchExpenses(); // ✅ Refresh expenses list
        setFormData({ name: "", amount: "", category: "", date: "" });
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error adding expense.");
    }
  };

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
        fetchExpenses(); // ✅ Refresh expenses list after successful upload
      }
    } catch (error) {
      setUploadMessage("Error uploading receipt.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // Clear session
    onLogout(); // Update state
    window.location.href = "/"; // ✅ Redirect to Landing Page
  };

  return (
    <div className="home-container">
      <div className="header">
        <h2>Welcome, {username ? username : "Guest"}!</h2> {/* ✅ Show correct username */}
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div className="content">
        {/* Left Side - Expense Form */}
        <div className="expense-form-container">
          <h3>Add New Expense</h3>
          <form onSubmit={handleSubmit} className="expense-form">
            <input type="text" name="name" placeholder="Expense Name" value={formData.name} onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            <button type="submit">Add Expense</button>
          </form>
          {message && <p className="message">{message}</p>}

          {/* Upload Receipt Button */}
          <h3>Upload Receipt</h3>
          <input type="file" accept="image/*" onChange={handleUpload} className="upload-input" />
          {uploadMessage && <p className="message">{uploadMessage}</p>}
        </div>

        {/* Right Side - Expenses Table */}
        <div className="expense-table-container">
          <h3>Your Expenses</h3>
          <div className="table-wrapper">
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
                {expenses.length > 0 ? (
                  expenses.map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.name}</td>
                      <td>${expense.amount}</td>
                      <td>{expense.category}</td>
                      <td>{expense.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">No expenses added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
