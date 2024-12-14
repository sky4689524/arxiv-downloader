import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography } from "@mui/material";
import CategoryList from "../components/CategoryList";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Update search query state
  const handleSearch = (e) => setSearchQuery(e.target.value);

  // Navigate to the search results page
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Box>
      {/* Header with title and search bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
          Simple Arxiv
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search papers..."
            sx={{
              width: "300px",
              marginRight: "10px",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchSubmit}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Category list section */}
      <CategoryList />
    </Box>
  );
};

export default HomePage;
