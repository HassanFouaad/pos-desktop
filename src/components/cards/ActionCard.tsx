import {
  Badge,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";

export interface ActionCardProps {
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  badge?: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  selected?: boolean;
  disabled?: boolean;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Interactive action card for dashboard and grid views
 * All styling handled by theme - no custom styling
 */
export const ActionCard = ({
  title,
  subtitle,
  onClick,
  badge,
  icon,
  iconColor,
  selected = false,
  disabled = false,
  gridSize = { xs: 12, sm: 6, md: 4 },
}: ActionCardProps) => {
  const theme = useTheme();

  const cardContent = (
    <>
      {/* Icon with gradient background if provided */}
      {icon && (
        <Grid container justifyContent="center" sx={{ pt: 2, pb: 1 }}>
          <Grid
            sx={{
              background: iconColor
                ? theme.palette.mode === "light"
                  ? `linear-gradient(135deg, ${iconColor}22 0%, ${iconColor}33 100%)`
                  : `linear-gradient(135deg, ${iconColor}33 0%, ${iconColor}22 100%)`
                : theme.palette.mode === "light"
                ? `linear-gradient(135deg, ${theme.palette.primary.alpha8} 0%, ${theme.palette.primary.alpha16} 100%)`
                : `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)`,
              color: iconColor || theme.palette.primary.main,
              borderRadius: theme.customShape.borderRadiusLarge,
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${
                iconColor
                  ? `${iconColor}${
                      theme.palette.mode === "light" ? "40" : "55"
                    }`
                  : theme.palette.mode === "light"
                  ? theme.palette.primary.alpha12
                  : "rgba(59, 130, 246, 0.2)"
              }`,
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {icon}
          </Grid>
        </Grid>
      )}

      {/* Title and subtitle */}
      <CardContent>
        <Grid container spacing={1}>
          {title && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" align="center" noWrap fontWeight={600}>
                {title}
              </Typography>
            </Grid>
          )}
          {subtitle && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                noWrap
              >
                {subtitle}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </>
  );

  // Render the card with appropriate Grid wrapper
  return (
    <Grid size={gridSize}>
      {badge ? (
        <Badge badgeContent={badge} color="primary" sx={{ width: 1 }}>
          <Card
            sx={{
              height: "100%",
              width: "100%",
              border: selected
                ? `2px solid ${theme.palette.primary.main}`
                : "none",
              opacity: disabled ? 0.6 : 1,
              transform: selected ? "scale(1.02)" : "scale(1)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: selected ? "scale(1.02)" : "scale(1.01)",
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0 8px 32px rgba(0, 0, 0, 0.04)"
                    : "0 8px 32px rgba(0, 0, 0, 0.3)",
              },
            }}
          >
            {onClick ? (
              <CardActionArea
                onClick={onClick}
                disabled={disabled}
                sx={{ height: "100%" }}
              >
                {cardContent}
              </CardActionArea>
            ) : (
              cardContent
            )}
          </Card>
        </Badge>
      ) : (
        <Card
          sx={{
            height: "100%",
            width: "100%",
            border: selected
              ? `2px solid ${theme.palette.primary.main}`
              : "none",
            opacity: disabled ? 0.6 : 1,
            transform: selected ? "scale(1.02)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: selected ? "scale(1.02)" : "scale(1.01)",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 8px 32px rgba(0, 0, 0, 0.04)"
                  : "0 8px 32px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          {onClick ? (
            <CardActionArea
              onClick={onClick}
              disabled={disabled}
              sx={{ height: "100%" }}
            >
              {cardContent}
            </CardActionArea>
          ) : (
            cardContent
          )}
        </Card>
      )}
    </Grid>
  );
};
