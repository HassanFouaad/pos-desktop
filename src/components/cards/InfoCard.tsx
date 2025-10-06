import { Card, CardContent, Grid, Typography, useTheme } from "@mui/material";
import { ReactNode } from "react";

export interface InfoCardProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  icon?: ReactNode;
  iconColor?: string;
  backgroundColor?: "default" | "paper" | "section" | "elevated";
  bordered?: boolean;
  gridSize?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Information display card (non-interactive)
 * All styling handled by theme
 */
export const InfoCard = ({
  title,
  subtitle,
  children,
  icon,
  iconColor,
  backgroundColor = "paper",
  bordered = true,
  gridSize,
}: InfoCardProps) => {
  const theme = useTheme();

  const getBgColor = () => {
    switch (backgroundColor) {
      case "section":
        return theme.palette.background.section;
      case "elevated":
        return theme.palette.background.elevated;
      case "default":
        return theme.palette.background.default;
      default:
        return theme.palette.background.paper;
    }
  };

  const content = (
    <Card
      sx={{
        height: "100%",
        backgroundColor: getBgColor(),
        border: bordered ? `1px solid ${theme.palette.divider}` : "none",
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          {/* Icon with gradient background if provided */}
          {icon && (
            <Grid size={{ xs: 12 }}>
              <Grid container justifyContent="center">
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
                    borderRadius: theme.customShape.borderRadiusMedium,
                    width: 48,
                    height: 48,
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
                  }}
                >
                  {icon}
                </Grid>
              </Grid>
            </Grid>
          )}

          {/* Title and subtitle */}
          {(title || subtitle) && (
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={1}>
                {title && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {title}
                    </Typography>
                  </Grid>
                )}
                {subtitle && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      {subtitle}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}

          {/* Content */}
          {children && <Grid size={{ xs: 12 }}>{children}</Grid>}
        </Grid>
      </CardContent>
    </Card>
  );

  // Wrap in Grid if gridSize provided
  return gridSize ? <Grid size={gridSize}>{content}</Grid> : content;
};
