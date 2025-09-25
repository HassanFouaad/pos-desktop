import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
  // borderRadius is handled by the theme
  // boxShadow is handled by the theme
  transition: "transform 0.2s, background-color 0.2s",
  "&:active": {
    transform: "scale(0.98)",
  },
  position: "relative",
  backgroundColor: "transparent",
}));

const CardBadge = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 2,
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.03)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0,
  transition: "opacity 0.2s",
  "&:active": {
    opacity: 1,
  },
}));

// Props interface
export interface TouchCardProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageHeight?: number | string;
  imageAlt?: string;
  onClick?: () => void;
  badge?: ReactNode;
  overlay?: ReactNode;
  contentComponent?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
}

export const TouchCard = ({
  title,
  subtitle,
  imageSrc,
  imageHeight = 140,
  imageAlt = "card image",
  onClick,
  badge,
  overlay,
  contentComponent,
  disabled = false,
  selected = false,
}: TouchCardProps) => {
  return (
    <StyledCard
      sx={{
        border: selected ? (theme) => `2px solid ${theme.palette.primary.main}` : "none",
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <CardActionArea onClick={onClick} disabled={disabled} sx={{ height: "100%", borderRadius: 2 }}>
        {/* Badge (if provided) */}
        {badge && <CardBadge>{badge}</CardBadge>}

        {/* Image (if provided) */}
        {imageSrc && (
          <CardMedia
            component="img"
            height={imageHeight}
            image={imageSrc}
            alt={imageAlt}
          />
        )}

        {/* Custom content or default content */}
        {contentComponent ? (
          contentComponent
        ) : (
          <CardContent>
            {title && (
              <Typography gutterBottom variant="h6" component="div" noWrap>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </CardContent>
        )}

        {/* Overlay for visual feedback (if provided) */}
        {overlay && <CardOverlay>{overlay}</CardOverlay>}
      </CardActionArea>
    </StyledCard>
  );
};
