import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Grid2,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const query = searchParams.get("q");

  // Fetch search results based on the query
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/search`, {
          params: { query },
        });
        setSearchResults(response.data.results || []);
      } catch {
        setError("An error occurred while fetching search results.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Navigate to the search results page with the updated query
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Download a specific PDF file
  const downloadPDF = async (pdfUrl, title) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/download_pdf`, {
        params: { pdf_url: pdfUrl, filename: title.replace(/\s+/g, "_") },
        responseType: "blob",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      console.error("Error downloading PDF.");
    }
  };

  return (
    <Box>
      {/* Header Section */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/")}
          >
            Home
          </Button>
          <TextField
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers..."
            sx={{ width: "300px" }}
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

      {/* Search Results Section */}
      <Box sx={{ padding: "16px" }}>
        <Typography variant="h5" component="h2" sx={{ marginBottom: "20px" }}>
          Search Results for "{query}"
        </Typography>

        {/* Display Error Message */}
        {error && (
          <Typography color="error" sx={{ marginBottom: "20px" }}>
            {error}
          </Typography>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : searchResults.length > 0 ? (
          <Grid2 container spacing={3}>
            {searchResults.map((result, index) => (
              <Grid2 item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ padding: "16px" }}>
                  <Typography
                    variant="h6"
                    component="a"
                    href={result.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    {result.title}
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    Authors: {result.authors}
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    {result.abstract}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => downloadPDF(result.pdf_url, result.title)}
                  >
                    Download PDF
                  </Button>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        ) : (
          !error && (
            <Typography
              variant="body1"
              sx={{ marginTop: "20px", textAlign: "center" }}
            >
              No results found.
            </Typography>
          )
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;
