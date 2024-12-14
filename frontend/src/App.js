import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PapersPage from "./pages/PapersPage";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";

function App() {
  return (
    <Router>
      {/* Define application routes */}
      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={<HomePage />} />

        {/* Papers Page Route: Dynamic route for categories */}
        <Route path="/:category" element={<PapersPage />} />

        {/* Search Page Route */}
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
