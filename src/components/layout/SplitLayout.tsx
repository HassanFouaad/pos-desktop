import { Box, Divider, Paper, useMediaQuery, useTheme } from "@mui/material";
import { ReactNode } from "react";

export interface SplitLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
  leftWidth?: string | number;
  rightWidth?: string | number;
  showDivider?: boolean;
  leftPadding?: number | string;
  rightPadding?: number | string;
  stackOnMobile?: boolean;
}

export const SplitLayout = ({
  leftContent,
  rightContent,
  leftWidth = "50%",
  rightWidth = "50%",
  showDivider = true,
  leftPadding = 2,
  rightPadding = 2,
  stackOnMobile = true,
}: SplitLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Convert to vertical stack on mobile if requested
  const direction = isMobile && stackOnMobile ? "column" : "row";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: direction,
        width: "100%",
        height: "100%",
      }}
    >
      {/* Left side */}
      <Paper
        elevation={0}
        sx={{
          width: isMobile && stackOnMobile ? "100%" : leftWidth,
          height: isMobile && stackOnMobile ? "50%" : "100%",
          overflow: "auto",
          p: leftPadding,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {leftContent}
      </Paper>

      {/* Divider */}
      {showDivider && (
        <Divider
          orientation={isMobile && stackOnMobile ? "horizontal" : "vertical"}
          flexItem
        />
      )}

      {/* Right side */}
      <Paper
        elevation={0}
        sx={{
          width: isMobile && stackOnMobile ? "100%" : rightWidth,
          height: isMobile && stackOnMobile ? "50%" : "100%",
          overflow: "auto",
          p: rightPadding,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rightContent}
      </Paper>
    </Box>
  );
};
