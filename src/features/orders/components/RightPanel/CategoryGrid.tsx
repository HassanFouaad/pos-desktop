import { Category as CategoryIcon } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionCard } from "../../../../components/cards/ActionCard";
import { drizzleDb } from "../../../../db";
import { categories } from "../../../../db/schemas/categories.schema";

const LIMIT = 10; // Load 10 categories at a time

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
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadCategories = useCallback(async (offset: number) => {
    setLoading(true);
    try {
      const result = await drizzleDb
        .select()
        .from(categories)
        .limit(LIMIT)
        .offset(offset);

      setCategoryList((prev) =>
        offset === 0
          ? (result as Category[])
          : [...prev, ...(result as Category[])]
      );
      setHasMore(result.length === LIMIT);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories(0);
  }, [loadCategories]);

  // Handle horizontal scroll to load more
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loading || !hasMore) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // Load more when scrolled to 80% of the width
    if (scrollLeft + clientWidth >= scrollWidth * 0.8) {
      loadCategories(categoryList.length);
    }
  }, [loading, hasMore, categoryList.length, loadCategories]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    onCategorySelect?.(categoryId);
  };

  if (categoryList.length === 0 && !loading) {
    return (
      <Grid container>
        <Grid size={12} sx={{ textAlign: "center", p: 4 }}>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.disabled,
            }}
          >
            No categories available
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container>
      <Grid size={12}>
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
      </Grid>

      <Grid size={12}>
        <Box
          ref={scrollContainerRef}
          sx={{
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "divider",
              borderRadius: 1,
            },
          }}
        >
          <Grid
            container
            spacing={1.5}
            wrap="nowrap"
            sx={{ minWidth: "max-content" }}
          >
            {categoryList.map((category) => (
              <ActionCard
                key={category.id}
                title={category.name}
                subtitle={category.description}
                icon={<CategoryIcon sx={{ fontSize: 32 }} />}
                iconColor={category.color || theme.palette.primary.main}
                selected={selectedCategoryId === category.id}
                onClick={() => handleCategoryClick(category.id)}
                gridSize={{ md: 4, lg: 2 }}
              />
            ))}
            {loading && (
              <Grid
                size="auto"
                sx={{ display: "flex", alignItems: "center", px: 2 }}
              >
                <CircularProgress size={24} />
              </Grid>
            )}
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};
