import { Add } from "@mui/icons-material";
import {
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Snackbar,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { customersRepository } from "../repositories/customers.repository";
import { CreateCustomerDTO } from "../schemas/create-customer.schema";
import { CustomerDTO } from "../types/customer.dto";
import { CreateCustomerForm } from "./CreateCustomerForm";
import { CustomerListItem } from "./CustomerListItem";
import { CustomerSearch } from "./CustomerSearch";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchCustomers = useCallback(async (search: string, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedCustomers = await customersRepository.getCustomers(
        search,
        LIMIT,
        offset
      );
      setCustomers((prev) =>
        offset === 0 ? fetchedCustomers : [...prev, ...fetchedCustomers]
      );
      setHasMore(fetchedCustomers.length > 0);
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
      await customersRepository.createCustomer(data);
      setCreateModalOpen(false);
      setSnackbarOpen(true);
      // Re-fetch the list to show the new pending customer if desired
      fetchCustomers(searchTerm, 0);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container rowSpacing={2}>
      <Grid size={{ md: 11, sm: 12, xs: 12 }}>
        <CustomerSearch
          onSearch={setSearchTerm}
          placeholder="Search customers by name, phone..."
        />
      </Grid>

      <Grid
        size={{ md: 1, sm: 12, xs: 12 }}
        sx={{ textAlign: "center", alignItems: "center" }}
      >
        <IconButton onClick={() => setCreateModalOpen(true)}>
          <Add />
        </IconButton>
      </Grid>

      {loading && customers.length === 0 ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <CircularProgress />
        </Grid>
      ) : error ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ p: 4 }}
        >
          <Typography color="error">{error}</Typography>
        </Grid>
      ) : (
        <Grid
          id="scrollableDivCustomers"
          size={{ xs: 12 }}
          sx={{ height: "calc(100vh - 200px)", overflow: "auto" }}
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
              <Typography sx={{ textAlign: "center", p: 2 }}>
                No more customers to show.
              </Typography>
            }
            scrollableTarget="scrollableDivCustomers"
          >
            <Grid container spacing={2} sx={{ p: 0.25 }}>
              {customers.map((customer) => (
                <CustomerListItem key={customer.id} customer={customer} />
              ))}
            </Grid>
          </InfiniteScroll>
        </Grid>
      )}
      <CreateCustomerForm
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateCustomer}
        isLoading={isSubmitting}
        error={submitError}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Customer created successfully
        </Alert>
      </Snackbar>
    </Grid>
  );
};
