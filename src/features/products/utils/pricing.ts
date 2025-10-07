/**
 * Formats a numeric value into a currency string using Intl.NumberFormat.
 * @param amount The numeric amount to format.
 * @param currency The ISO currency code (e.g., 'EGP', 'USD'). Defaults to 'EGP'.
 * @returns A formatted currency string (e.g., "EGP 1,250.50").
 */
export const formatCurrency = (
  amount: number | string | null | undefined,
  currency: string = "EGP"
): string => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    return "";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(numericAmount);
};
