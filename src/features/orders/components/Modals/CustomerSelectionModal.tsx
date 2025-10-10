import { Add as AddIcon } from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { container } from "tsyringe";
import { ResponsiveDialog } from "../../../../components/common/ResponsiveDialog";
import { TouchButton } from "../../../../components/common/TouchButton";
import { CreateCustomerForm } from "../../../customers/components/CreateCustomerForm";
import { CustomerListItem } from "../../../customers/components/CustomerListItem";
import { CustomerSearch } from "../../../customers/components/CustomerSearch";
import { CustomerSkeleton } from "../../../customers/components/CustomerSkeleton";
import { CreateCustomerDTO } from "../../../customers/schemas/create-customer.schema";
import { CustomersService } from "../../../customers/services";
import { CustomerDTO } from "../../../customers/types/customer.dto";

const customersService = container.resolve(CustomersService);

const LIMIT = 20;

interface CustomerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerDTO) => void;
}

export const CustomerSelectionModal = ({
  open,
  onClose,
  onSelectCustomer,
}: CustomerSelectionModalProps) => {
  const theme = useTheme();
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async (search: string, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCustomers = await customersService.getCustomers(
        search,
        LIMIT,
        offset
      );
      setCustomers((prev) =>
        offset === 0 ? fetchedCustomers : [...prev, ...fetchedCustomers]
      );
      setHasMore(fetchedCustomers.length === LIMIT);
    } catch (err) {
      setError("Failed to load customers.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchCustomers(searchTerm, 0);
    }
  }, [searchTerm, open, fetchCustomers]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCustomers(searchTerm, customers.length);
    }
  };

  const handleCustomerClick = (customer: CustomerDTO) => {
    onSelectCustomer(customer);
    onClose();
  };

  const handleCreateCustomer = async (data: CreateCustomerDTO) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newCustomer = await customersService.createCustomer(data);
      setCreateModalOpen(false);
      // Automatically select the newly created customer
      onSelectCustomer(newCustomer);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <ResponsiveDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        showCloseButton
        title={
          <Typography variant="h5" fontWeight={600}>
            Select Customer
          </Typography>
        }
        titleSx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Grid
          container
          sx={{
            height: "70vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Search and Add Button - Fixed */}
          <Grid size={12} sx={{ flexShrink: 0, pb: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 9 }}>
                <CustomerSearch
                  onSearch={setSearchTerm}
                  placeholder="Search customers by name, phone..."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TouchButton
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setCreateModalOpen(true)}
                  startIcon={<AddIcon />}
                  size="large"
                >
                  New
                </TouchButton>
              </Grid>
            </Grid>
          </Grid>

          {/* Scrollable Customers List - Takes remaining space */}
          <Grid
            size={12}
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {loading && customers.length === 0 ? (
              <Grid container spacing={2}>
                {[...Array(5)].map((_, index) => (
                  <CustomerSkeleton key={index} />
                ))}
              </Grid>
            ) : error ? (
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                sx={{ height: 1 }}
              >
                <Typography color="error">{error}</Typography>
              </Grid>
            ) : customers.length === 0 ? (
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                sx={{ height: 1 }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" color="text.disabled" sx={{ mb: 2 }}>
                    No customers found
                  </Typography>
                  <TouchButton
                    variant="contained"
                    color="primary"
                    onClick={() => setCreateModalOpen(true)}
                    startIcon={<AddIcon />}
                  >
                    Add First Customer
                  </TouchButton>
                </Box>
              </Grid>
            ) : (
              <Grid
                id="scrollableDivCustomers"
                sx={{
                  height: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <InfiniteScroll
                  dataLength={customers.length}
                  next={loadMore}
                  hasMore={hasMore}
                  loader={
                    <Grid
                      container
                      justifyContent="center"
                      alignItems="center"
                      sx={{ p: 2 }}
                    >
                      <CircularProgress />
                    </Grid>
                  }
                  endMessage={
                    <Typography
                      sx={{
                        textAlign: "center",
                        p: 2,
                        color: "text.secondary",
                      }}
                    >
                      No more customers to show.
                    </Typography>
                  }
                  scrollableTarget="scrollableDivCustomers"
                  style={{ overflow: "visible" }}
                >
                  <Grid container spacing={2}>
                    {customers.map((customer) => (
                      <CustomerListItem
                        key={customer.id}
                        customer={customer}
                        onClick={handleCustomerClick}
                      />
                    ))}
                  </Grid>
                </InfiniteScroll>
              </Grid>
            )}
          </Grid>
        </Grid>
      </ResponsiveDialog>

      {/* Create Customer Form Modal */}
      <CreateCustomerForm
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        isLoading={isSubmitting}
        error={submitError}
      />
    </>
  );
};
