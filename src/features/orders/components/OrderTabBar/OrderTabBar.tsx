import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { Chip, Grid, IconButton, useTheme } from "@mui/material";
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

export const TAB_BAR_HEIGHT = 68; // TAB_HEIGHT + padding

export const OrderTabBar = () => {
  const theme = useTheme();
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
    <Grid
      container
      spacing={1}
      sx={{
        p: 1.5,
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        overflowX: "auto",
        overflowY: "hidden",
        height: TAB_BAR_HEIGHT,
        WebkitOverflowScrolling: "touch",
      }}
      wrap="nowrap"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const itemCount = tab.cartItems.length;

        return (
          <Grid size="auto" key={tab.id}>
            <Chip
              label={`${tab.label}${itemCount > 0 ? ` (${itemCount})` : ""}`}
              onClick={() => handleTabClick(tab.id)}
              onDelete={(e: any) => handleCloseTab(tab.id, e)}
              deleteIcon={<CloseIcon />}
              sx={{
                height: TAB_HEIGHT,
                minWidth: 120,
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.875rem",
                ...(isActive
                  ? {
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      border: `2px solid ${theme.palette.primary.main}`,
                      "&:hover": {
                        bgcolor: theme.palette.primary.dark,
                      },
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.primary.contrastText,
                        "&:hover": {
                          color: theme.palette.primary.contrastText,
                          opacity: 0.8,
                        },
                      },
                    }
                  : {
                      bgcolor: "transparent",
                      color: theme.palette.text.primary,
                      border: `2px solid ${theme.palette.divider}`,
                      "&:hover": {
                        bgcolor: theme.palette.action.hover,
                        borderColor: theme.palette.primary.light,
                      },
                      "& .MuiChip-deleteIcon": {
                        color: theme.palette.text.secondary,
                        "&:hover": {
                          color: theme.palette.error.main,
                        },
                      },
                    }),
              }}
            />
          </Grid>
        );
      })}

      <Grid size="auto">
        <IconButton
          onClick={handleNewTab}
          disabled={tabs.length >= MAX_TABS}
          sx={{
            minWidth: TAB_HEIGHT,
            height: TAB_HEIGHT,
            color: theme.palette.primary.main,
            border: `2px solid ${theme.palette.divider}`,
            borderRadius: 2,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
              borderColor: theme.palette.primary.main,
            },
            "&:disabled": {
              color: theme.palette.action.disabled,
              borderColor: theme.palette.divider,
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
