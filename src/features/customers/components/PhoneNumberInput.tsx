import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import { useState } from "react";

// A minimal list of countries for demonstration
const countries = [{ code: "EG", label: "Egypt", phone: "+20" }];

interface PhoneNumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}

export const PhoneNumberInput = ({
  label,
  value,
  onChange,
  error,
  helperText,
}: PhoneNumberInputProps) => {
  const [countryCode, setCountryCode] = useState(countries[0].phone);
  // Deconstruct the value to get the local number
  const localNumber = value.startsWith(countryCode)
    ? value.substring(countryCode.length)
    : value;

  const handleCountryChange = (e: SelectChangeEvent<string>) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    onChange(`${newCountryCode}${localNumber}`);
  };

  const handleLocalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent non-numeric characters
    const newLocalNumber = e.target.value.replace(/[^0-9]/g, "");
    onChange(`${countryCode}${newLocalNumber}`);
  };

  return (
    <FormControl fullWidth error={error}>
      <Grid container spacing={1}>
        <Grid size={{ xs: 4, sm: 3 }}>
          <FormControl fullWidth>
            <InputLabel shrink>Country</InputLabel>
            <Select
              value={countryCode}
              onChange={handleCountryChange}
              displayEmpty
            >
              {countries.map((country) => (
                <MenuItem key={country.code} value={country.phone}>
                  {country.code} ({country.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 8, sm: 9 }}>
          <TextField
            fullWidth
            label={label}
            value={localNumber}
            onChange={handleLocalNumberChange}
            error={error}
            helperText={helperText}
          />
        </Grid>
      </Grid>
    </FormControl>
  );
};
