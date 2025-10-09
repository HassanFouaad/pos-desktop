import { Category as CategoryIcon } from "@mui/icons-material";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { ActionCard } from "../../../../components/cards/ActionCard";
import { drizzleDb } from "../../../../db";
import { categories } from "../../../../db/schemas/categories.schema";

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface CategoryGridProps {
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryGrid = ({ onCategorySelect }: CategoryGridProps) => {
  const theme = useTheme();
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await drizzleDb.select().from(categories);

      setCategoryList(result as Category[]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onCategorySelect?.(categoryId);
  };

  if (categoryList.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: theme.palette.text.disabled,
          }}
        >
          No categories available
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: theme.palette.text.primary,
        }}
      >
        Categories
      </Typography>

      <Grid container spacing={1.5}>
        {categoryList.map((category) => (
          <ActionCard
            key={category.id}
            title={category.name}
            subtitle={category.description}
            icon={<CategoryIcon sx={{ fontSize: 32 }} />}
            iconColor={category.color || theme.palette.primary.main}
            selected={selectedCategoryId === category.id}
            onClick={() => handleCategoryClick(category.id)}
            gridSize={{ xs: 6, sm: 4, md: 3, lg: 3, xl: 2 }}
          />
        ))}
      </Grid>
    </>
  );
};
