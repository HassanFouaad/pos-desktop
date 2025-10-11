import { CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { container } from "tsyringe";
import {
  CustomerDetailsHeader,
  CustomerDetailsNotes,
  CustomerDetailsOrders,
  CustomerDetailsPersonal,
  CustomerDetailsStats,
} from "../components/CustomerDetails";
import { CustomersService } from "../services";
import { CustomerDTO } from "../types/customer.dto";

const customersService = container.resolve(CustomersService);

const CustomerDetailsPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<CustomerDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    if (!customerId) {
      setError("Customer ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fetchedCustomer = await customersService.findById(customerId);

      if (!fetchedCustomer) {
        setError("Customer not found");
        setCustomer(null);
      } else {
        setCustomer(fetchedCustomer);
      }
    } catch (err) {
      console.error("Failed to load customer:", err);
      setError("Failed to load customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  // Loading State
  if (loading) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: 1 }}
      >
        <Grid sx={{ textAlign: "center" }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading customer details...
          </Typography>
        </Grid>
      </Grid>
    );
  }

  // Error State
  if (error || !customer) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: 1 }}
      >
        <Grid sx={{ textAlign: "center" }}>
          <Typography variant="h5" color="error" sx={{ mb: 2 }}>
            {error || "Customer not found"}
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: 1,
        overflowY: "auto",
        overflowX: "hidden",
        p: 2,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* Header Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomerDetailsHeader customer={customer} />
      </Grid>

      {/* Stats Section */}
      <Grid size={{ xs: 12, md: 6 }}>
        <CustomerDetailsStats customer={customer} currency="EGP" />
      </Grid>

      {/* Personal Information Section (if exists) */}
      {(customer.dateOfBirth || customer.loyaltyNumber) && (
        <Grid size={{ xs: 12, md: 6 }}>
          <CustomerDetailsPersonal customer={customer} />
        </Grid>
      )}

      {/* Notes Section (if exists) */}
      {customer.notes && (
        <Grid size={{ xs: 12 }}>
          <CustomerDetailsNotes notes={customer.notes} />
        </Grid>
      )}

      {/* Orders Section */}
      <Grid size={{ xs: 12 }}>
        <CustomerDetailsOrders customerId={customer.id} />
      </Grid>
    </Grid>
  );
};

export default CustomerDetailsPage;
