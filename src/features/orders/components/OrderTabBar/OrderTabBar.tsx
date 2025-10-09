import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { Box, Chip, IconButton } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  closeTab,
  createNewTab,
  selectActiveTabId,
  selectTabs,
  switchTab,
} from "../../../../store/orderSlice";

const MAX_TABS = 10;
const TAB_HEIGHT = 44;

export const OrderTabBar = () => {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector(selectTabs);
  const activeTabId = useAppSelector(selectActiveTabId);

  const handleTabClick = (tabId: string) => dispatch(switchTab(tabId));
  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(closeTab(tabId));
  };
  const handleNewTab = () => dispatch(createNewTab());

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        p: 1.5,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const itemCount = tab.cartItems.length;

        return (
          <Chip
            key={tab.id}
            label={`${tab.label}${itemCount > 0 ? ` (${itemCount})` : ""}`}
            onClick={() => handleTabClick(tab.id)}
            onDelete={(e: any) => handleCloseTab(tab.id, e)}
            deleteIcon={<CloseIcon />}
            color={isActive ? "primary" : "default"}
            variant={isActive ? "filled" : "outlined"}
            sx={{ height: TAB_HEIGHT, minWidth: 120 }}
          />
        );
      })}

      <IconButton
        onClick={handleNewTab}
        disabled={tabs.length >= MAX_TABS}
        color="primary"
        sx={{ minWidth: TAB_HEIGHT, height: TAB_HEIGHT }}
      >
        <AddIcon />
      </IconButton>
    </Box>
  );
};
