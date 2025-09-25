import { Box, Paper, styled, useTheme } from "@mui/material";
import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TouchButton } from "./TouchButton";

// Styled components
const NavContainer = styled(Paper)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "space-around",
  padding: theme.spacing(1, 0), // Reduce horizontal padding
  zIndex: theme.zIndex.appBar,
  backgroundColor: "transparent", // Make background transparent
  boxShadow: "none", // Remove shadow, handled by theme
  borderRadius: 0,
}));

const NavButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
}));

export interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  disabled?: boolean;
}

interface TouchFooterNavProps {
  items: NavItem[];
  showLabels?: boolean;
}

export const TouchFooterNav = ({
  items,
  showLabels = true,
}: TouchFooterNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <NavContainer square elevation={3}>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavButtonContainer key={item.path}>
            <TouchButton
              onClick={() => handleNavigation(item.path)}
              color={isActive ? "primary" : "inherit"}
              variant={isActive ? "contained" : "text"} // Active button is contained
              disabled={item.disabled}
              size="small"
              sx={{
                flexDirection: "column",
                minWidth: "auto",
                width: 68,
                height: 64,
                p: 0.5,
                color: !isActive
                  ? theme.palette.text.secondary
                  : theme.palette.primary.contrastText,
              }}
            >
              {item.icon}
              {showLabels && (
                <Box
                  component="span"
                  sx={{
                    mt: 0.25,
                    lineHeight: 1,
                    fontSize: "0.75rem",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "inherit" : theme.palette.text.secondary,
                  }}
                >
                  {item.label}
                </Box>
              )}
            </TouchButton>
          </NavButtonContainer>
        );
      })}
    </NavContainer>
  );
};
