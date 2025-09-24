import { Box, Tab, Tabs, styled } from "@mui/material";
import { ReactNode, SyntheticEvent, useState } from "react";

// Styled components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
  minHeight: "56px",
  "& .MuiTabs-indicator": {
    height: "4px",
    borderRadius: "2px",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: "56px",
  fontSize: "1rem",
  fontWeight: 500,
  textTransform: "none",
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(1.5),
  "&.Mui-selected": {
    fontWeight: 700,
  },
}));

export interface TabItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TouchTabsProps {
  tabs: TabItem[];
  initialValue?: string;
  onChange?: (value: string) => void;
  variant?: "fullWidth" | "scrollable" | "standard";
  orientation?: "horizontal" | "vertical";
  centered?: boolean;
  showTextLabels?: boolean;
}

export const TouchTabs = ({
  tabs,
  initialValue,
  onChange,
  variant = "standard",
  orientation = "horizontal",
  centered = false,
  showTextLabels = true,
}: TouchTabsProps) => {
  const [value, setValue] = useState(initialValue || tabs[0]?.value || "");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StyledTabs
        value={value}
        onChange={handleChange}
        variant={variant}
        orientation={orientation}
        centered={centered}
        aria-label="touch tabs"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <StyledTab
            key={tab.value}
            label={showTextLabels ? tab.label : undefined}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
            disabled={tab.disabled}
          />
        ))}
      </StyledTabs>
    </Box>
  );
};
