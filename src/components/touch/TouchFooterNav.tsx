import { Box, Paper, styled } from "@mui/material";
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
  padding: theme.spacing(1, 2),
  zIndex: theme.zIndex.appBar,
  boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
  borderRadius: `${theme.spacing(2)} ${theme.spacing(2)} 0 0`,
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
              variant={isActive ? "contained" : "text"}
              disabled={item.disabled}
              size="small"
              sx={{
                minWidth: "auto",
                borderRadius: "50%",
                width: 56,
                height: 56,
                p: 0,
              }}
            >
              {item.icon}
            </TouchButton>
            {showLabels && (
              <Box
                component="span"
                sx={{
                  mt: 0.5,
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "primary.main" : "text.secondary",
                }}
              >
                {item.label}
              </Box>
            )}
          </NavButtonContainer>
        );
      })}
    </NavContainer>
  );
};
