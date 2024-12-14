import React from "react";
import { useNavigate } from "react-router-dom";
import { Grid2, Button, Typography, Box } from "@mui/material";
import categories from "./categories";

const CategoryList = () => {
  const navigate = useNavigate();

  // Handle category click by navigating to the category route
  const handleCategoryClick = (route) => {
    navigate(`/${route}`);
  };

  return (
    <Box sx={{ padding: "16px" }}>
      {/* Header for the category list */}
      <Typography variant="h5" component="h2" sx={{ marginBottom: "16px" }}>
        Computer Science
      </Typography>

      {/* Display categories in a responsive Grid2 */}
      <Grid2 container spacing={2}>
        {categories.map((category, index) => (
          <Grid2 item key={index}>
            <Button
              variant="outlined"
              onClick={() => handleCategoryClick(category.route)}
              sx={{
                textTransform: "none", // Keep the text in its original casing
                padding: "8px 16px", // Add padding for better button size
                whiteSpace: "nowrap", // Prevent text wrapping
              }}
            >
              {category.name}
            </Button>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
};

export default CategoryList;
