import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css"; // Ensure correct path
import logo from "./assets/logo.png"; // Ensure correct path

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ name: "", username: "", email: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({ name: "", email: "", password: "" });

  const username = localStorage.getItem("loggedInUser");

  useEffect(() => {
    if (!username) {
      navigate("/signin"); // Redirect to login if not logged in
    } else {
      fetchUserProfile();
    }
  }, [username, navigate]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/get_user_info?username=${username}`);
      const data = await response.json();
      if (data.success) {
        setUserInfo({ name: data.name, username: username, email: data.email });
        setEditedUserInfo({ name: data.name, email: data.email, password: "" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          name: editedUserInfo.name, 
          email: editedUserInfo.email,
          password: editedUserInfo.password || null // Only update password if changed
        }),
      });

      const result = await response.json();
      if (result.success) {
        setUserInfo({ ...editedUserInfo, username: userInfo.username, password: "" });
        alert(result.message);
        setIsEditing(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
        <h2>PennyWise</h2>
        <ul>
          <li onClick={() => navigate("/home")}>Home</li>
          <li>Profile</li>
          <li onClick={() => navigate("/threshold")}>Set Alerts</li> {/* Updated */}
          <li onClick={() => {
              sessionStorage.setItem("openUploadModal", "true");
              navigate("/home");
            }}>Upload Receipt
          </li>
          <li>Link Bank (Coming Soon)</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Header */}
      <div className="header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
        <div className="logo-container">
          <img src={logo} alt="PennyWise Logo" className="logo" />
          <h2>PennyWise</h2>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-container">
        <h2>User Profile</h2>
        <div className="profile-details">
        {isEditing ? (
  <div className="edit-profile-form">
    <div className="input-group">
      <label>Name</label>
      <input 
        type="text" 
        value={editedUserInfo.name} 
        onChange={(e) => setEditedUserInfo({ ...editedUserInfo, name: e.target.value })}
      />
    </div>

    <div className="input-group">
      <label>Email</label>
      <input 
        type="email" 
        value={editedUserInfo.email} 
        onChange={(e) => setEditedUserInfo({ ...editedUserInfo, email: e.target.value })}
      />
    </div>

    <div className="input-group">
      <label>New Password</label>
      <input 
        type="password" 
        value={editedUserInfo.password} 
        onChange={(e) => setEditedUserInfo({ ...editedUserInfo, password: e.target.value })}
        placeholder="Leave blank to keep old password"
      />
    </div>

    <div className="profile-buttons">
      <button className="save-btn" onClick={handleUpdateProfile}>Save Changes</button>
      <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
    </div>
  </div>
) : (
  <div className="view-profile">
    <p><strong>Name:</strong> {userInfo.name}</p>
    <p><strong>Username:</strong> {userInfo.username}</p>
    <p><strong>Email:</strong> {userInfo.email}</p>
    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default Profile;
