import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Modal,
  Paper,
  Grid2,
} from "@mui/material";
import axios from "axios";

const PapersPage = () => {
  const { category } = useParams(); // Get the category from the URL
  const navigate = useNavigate(); // For navigation
  const [papers, setPapers] = useState([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentSkip, setCurrentSkip] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch papers based on category and skip value
  const fetchPapers = async (category, skip) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/arxiv_papers?category=${category}&skip=${skip}`
      );
      setPapers(response.data.papers);
      setTotalEntries(response.data.total_entries);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  // Download a specific PDF file
  const downloadPDF = async (pdfUrl, title) => {
    setIsLoading(true);
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
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download all PDFs as a ZIP file
  const downloadAllPDFs = async () => {
    setIsLoading(true);
    try {
      const payload = papers.map((paper) => [paper.pdf_url, paper.title]);

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/download_all_pdfs`,
        payload,
        { responseType: "blob" }
      );

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", "papers.zip");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading all PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers(category, currentSkip);
  }, [category, currentSkip]);

  // Handle pagination click
  const handlePageClick = (skip) => setCurrentSkip(skip);

  // Render pagination controls
  const renderPagination = () => {
    const papersPerPage = 50;
    const totalPages = Math.ceil(totalEntries / papersPerPage);
    return Array.from({ length: totalPages }, (_, i) => {
      const skip = i * papersPerPage;
      const start = skip + 1;
      const end = Math.min(skip + papersPerPage, totalEntries);
      return (
        <Button
          key={i}
          onClick={() => handlePageClick(skip)}
          variant={skip === currentSkip ? "contained" : "outlined"}
          sx={{ margin: "0 5px" }}
        >
          {`${start}-${end}`}
        </Button>
      );
    });
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
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Papers for {category.replace("cs.", "").replace(".", " ")}
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </Box>

      {/* Loading Modal */}
      <Modal open={isLoading}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "300px",
            height: "200px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: 24,
            borderRadius: "10px",
            padding: "20px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <CircularProgress />
          <Typography
            sx={{ marginTop: "20px", fontSize: "16px", textAlign: "center" }}
          >
            Downloading Files...
          </Typography>
        </Box>
      </Modal>

      {/* Content Section */}
      <Box sx={{ padding: "16px" }}>
        <Typography variant="h6" sx={{ marginBottom: "10px" }}>
          Total of {totalEntries} entries
        </Typography>
        <Box sx={{ marginBottom: "20px" }}>{renderPagination()}</Box>

        <Button
          variant="contained"
          color="success"
          onClick={downloadAllPDFs}
          disabled={isLoading}
          sx={{ marginBottom: "20px" }}
        >
          {isLoading ? "Downloading..." : "Download All"}
        </Button>

        {papers.length === 0 ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid2 container spacing={3}>
            {papers.map((paper, index) => (
              <Grid2 item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={3} sx={{ padding: "16px" }}>
                  <Typography
                    variant="h6"
                    component="a"
                    href={paper.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      display: "block",
                      marginBottom: "10px",
                    }}
                  >
                    {paper.title}
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    Authors: {paper.authors}
                  </Typography>
                  <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                    Subjects: {paper.subjects}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => downloadPDF(paper.pdf_url, paper.title)}
                  >
                    Download PDF
                  </Button>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        )}
        <Box sx={{ marginTop: "20px" }}>{renderPagination()}</Box>
      </Box>
    </Box>
  );
};

export default PapersPage;
