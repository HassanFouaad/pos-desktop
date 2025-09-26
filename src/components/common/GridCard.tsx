import {
  Badge,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";

export interface GridCardProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageHeight?: number | string;
  imageAlt?: string;
  onClick?: () => void;
  badge?: ReactNode;
  icon?: ReactNode;
  iconBackground?: string;
  selected?: boolean;
  disabled?: boolean;
  gridProps?: {
    size?: {
      xs?: number;
      sm?: number;
      md?: number;
      lg?: number;
      xl?: number;
    };
  };
}

export const GridCard = ({
  title,
  subtitle,
  imageSrc,
  imageHeight = 140,
  imageAlt = "card image",
  onClick,
  badge,
  icon,
  iconBackground,
  selected = false,
  disabled = false,
  gridProps = { size: { xs: 12, sm: 6, md: 4, lg: 3 } },
}: GridCardProps) => {
  const theme = useTheme();

  // Card content to display
  const cardContent = (
    <>
      {/* Image if provided */}
      {imageSrc && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={imageSrc}
          alt={imageAlt}
        />
      )}

      {/* Icon with background if provided */}
      {icon && (
        <Grid container justifyContent="center" sx={{ pt: 2, pb: 1 }}>
          <Grid
            component="div"
            sx={{
              bgcolor: iconBackground
                ? `${iconBackground}22`
                : `${theme.palette.primary.main}22`,
              color: iconBackground || theme.palette.primary.main,
              borderRadius: "50%",
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Grid>
        </Grid>
      )}

      {/* Title and subtitle */}
      <CardContent>
        <Grid container direction="column" spacing={1}>
          {title && (
            <Grid>
              <Typography
                variant="h6"
                align="center"
                noWrap
                sx={{ fontWeight: 600 }}
              >
                {title}
              </Typography>
            </Grid>
          )}
          {subtitle && (
            <Grid>
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

  // Render the card with appropriate Grid item wrapper
  return (
    <Grid component="div" {...gridProps}>
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
              transition: "transform 0.2s ease",
              "&:active": {
                transform: "scale(0.98)",
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
            transition: "transform 0.2s ease",
            "&:active": {
              transform: "scale(0.98)",
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
