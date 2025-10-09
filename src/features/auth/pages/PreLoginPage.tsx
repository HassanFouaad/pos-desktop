import {
  Business as BusinessIcon,
  Devices as DeviceIcon,
  LocationCity as LocationIcon,
  Login as LoginIcon,
  Store as StoreIcon,
  Palette as ThemeIcon,
  LinkOff as UnpairIcon,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionCard } from "../../../components/cards/ActionCard";
import { InfoCard } from "../../../components/cards/InfoCard";
import { CenteredPageLayout } from "../../../components/layouts/CenteredPageLayout";
import { UnpairConfirmDialog } from "../../../components/layouts/UnpairConfirmDialog";
import { storesRepository } from "../../stores/repositories/stores.repository";
import { PosDTO, StoreDto, TenantDto } from "../../stores/types";

export const PreLoginPage = () => {
  const [unpairDialogOpen, setUnpairDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [store, setStore] = useState<StoreDto | null>(null);
  const [pos, setPos] = useState<PosDTO | null>(null);

  const navigate = useNavigate();
  const theme = useTheme();

  // Fetch tenant, store, and pairing data from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch tenant and store from database
        const [tenantData, storeData, posData] = await Promise.all([
          storesRepository.getCurrentTenant(),
          storesRepository.getCurrentStore(),
          storesRepository.getCurrentPos(),
        ]);

        setTenant(tenantData);
        setStore(storeData);
        setPos(posData);
      } catch (error) {
        console.error("Failed to fetch tenant/store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleUnpairClick = () => {
    setUnpairDialogOpen(true);
  };

  const handleUnpairConfirmed = () => {
    // Navigation will be handled by the dialog after successful unpair
    setUnpairDialogOpen(false);
  };

  const handleUnpairCancelled = () => {
    setUnpairDialogOpen(false);
  };

  // Show loading state
  if (loading) {
    return (
      <CenteredPageLayout>
        <Grid size={{ xs: 12 }} sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }} color="text.secondary">
            Loading device information...
          </Typography>
        </Grid>
      </CenteredPageLayout>
    );
  }

  return (
    <CenteredPageLayout>
      {/* Header Section - Tenant and Store Information */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center", mb: 2 }}>
        {/* Tenant Logo or Icon */}
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 2,
            background:
              theme.palette.mode === "light"
                ? `linear-gradient(135deg, ${theme.palette.primary.alpha8} 0%, ${theme.palette.primary.alpha16} 100%)`
                : `linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)`,
            borderRadius: theme.customShape.borderRadiusLarge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${
              theme.palette.mode === "light"
                ? theme.palette.primary.alpha12
                : "rgba(59, 130, 246, 0.2)"
            }`,
          }}
        >
          {tenant?.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name || "Tenant Logo"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: theme.customShape.borderRadiusLarge,
              }}
            />
          ) : (
            <BusinessIcon
              sx={{ fontSize: 48, color: theme.palette.primary.main }}
            />
          )}
        </Box>

        {/* Tenant Name */}
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {tenant?.name || "Business"}
        </Typography>

        {/* Store Information */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 1,
          }}
        >
          <StoreIcon sx={{ fontSize: 20, color: "text.secondary" }} />
          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            {store?.name || "Store"} • {store?.code || "N/A"}
          </Typography>
        </Box>

        {/* Location if available */}
        {store?.city && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <LocationIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {store.city}
              {store.state ? `, ${store.state}` : ""}
            </Typography>
          </Box>
        )}
      </Grid>

      {/* Device and Pairing Information Cards */}
      <Grid size={{ xs: 12 }}>
        <InfoCard backgroundColor="default" bordered={false}>
          <Grid container spacing={3}>
            {/* Device Name */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <DeviceIcon sx={{ color: "primary.main", fontSize: 24 }} />
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ letterSpacing: "0.05em" }}
                >
                  DEVICE
                </Typography>
              </Box>
              <Typography variant="h6" fontWeight={600}>
                {pos?.name || "Unknown Device"}
              </Typography>
            </Grid>

            {/* Tenant Theme Colors */}
            {(tenant?.primaryColor || tenant?.accentColor) && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1,
                  }}
                >
                  <ThemeIcon sx={{ color: "text.secondary", fontSize: 24 }} />
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ letterSpacing: "0.05em" }}
                  >
                    BRAND COLORS
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  {tenant.primaryColor && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: tenant.primaryColor,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {tenant.primaryColor}
                      </Typography>
                    </Box>
                  )}
                  {tenant.accentColor && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: tenant.accentColor,
                          borderRadius: 1,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      <Typography
                        variant="body2"
                        fontFamily="monospace"
                        color="text.secondary"
                      >
                        {tenant.accentColor}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </InfoCard>
      </Grid>

      {/* Action Cards */}
      <Grid size={{ xs: 12 }} container spacing={2}>
        <ActionCard
          title="Login as User"
          subtitle="Access POS system"
          icon={<LoginIcon sx={{ fontSize: 36 }} />}
          iconColor={theme.palette.primary.main}
          onClick={handleLogin}
          gridSize={{ xs: 12, sm: 6 }}
        />

        <ActionCard
          title="Unpair Device"
          subtitle="Disconnect this device"
          icon={<UnpairIcon sx={{ fontSize: 36 }} />}
          iconColor={theme.palette.error.main}
          onClick={handleUnpairClick}
          gridSize={{ xs: 12, sm: 6 }}
        />
      </Grid>

      {/* Help Text */}
      <Grid size={{ xs: 12 }} sx={{ textAlign: "center", mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Ready to start? Login to access the POS system
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Need to reconfigure? Unpair this device to start fresh
        </Typography>
      </Grid>

      {/* Unpair Confirmation Dialog */}
      <UnpairConfirmDialog
        open={unpairDialogOpen}
        onConfirm={handleUnpairConfirmed}
        onCancel={handleUnpairCancelled}
      />
    </CenteredPageLayout>
  );
};
