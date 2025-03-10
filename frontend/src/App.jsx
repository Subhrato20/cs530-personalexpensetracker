import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import Signup from "./Signup";
import Auth from "./Auth";
import Home from "./Home"; // Import Home

function App() {
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem("loggedInUser") || null);

  const handleLogin = (username) => {
    setLoggedInUser(username);
    localStorage.setItem("loggedInUser", username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Auth onLogin={handleLogin} />} />
        <Route path="/home" element={<Home username={loggedInUser} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

export default App;
