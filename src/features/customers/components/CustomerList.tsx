import { Add } from "@mui/icons-material";
import { CircularProgress, Grid, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { container } from "tsyringe";
import { TouchButton } from "../../../components/common/TouchButton";
import { CreateCustomerDTO } from "../schemas/create-customer.schema";
import { CustomersService } from "../services";
import { CustomerDTO } from "../types/customer.dto";
import { CreateCustomerForm } from "./CreateCustomerForm";
import { CustomerListItem } from "./CustomerListItem";
import { CustomerSearch } from "./CustomerSearch";

const customersService = container.resolve(CustomersService);

const LIMIT = 20;

export const CustomerList = () => {
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
    fetchCustomers(searchTerm, 0);
  }, [searchTerm, fetchCustomers]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCustomers(searchTerm, customers.length);
    }
  };

  const handleCreateCustomer = async (data: CreateCustomerDTO) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await customersService.createCustomer(data);
      setCreateModalOpen(false);
      // Re-fetch the list to show the new customer
      fetchCustomers(searchTerm, 0);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid
      container
      sx={{
        height: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search and Add Button - Fixed */}
      <Grid size={12} sx={{ flexShrink: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 9, md: 10 }}>
            <CustomerSearch
              onSearch={setSearchTerm}
              placeholder="Search customers by name, phone..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3, md: 2 }}>
            <TouchButton
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setCreateModalOpen(true)}
              startIcon={<Add />}
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
          pt: 2,
        }}
      >
        {loading && customers.length === 0 ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ height: 1 }}
          >
            <CircularProgress />
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
                  sx={{ textAlign: "center", p: 2, color: "text.secondary" }}
                >
                  No more customers to show.
                </Typography>
              }
              scrollableTarget="scrollableDivCustomers"
              style={{ overflow: "visible" }}
            >
              <Grid container spacing={2} sx={{ p: 2 }}>
                {customers.map((customer) => (
                  <CustomerListItem key={customer.id} customer={customer} />
                ))}
              </Grid>
            </InfiniteScroll>
          </Grid>
        )}
      </Grid>

      <CreateCustomerForm
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        isLoading={isSubmitting}
        error={submitError}
      />
    </Grid>
  );
};
