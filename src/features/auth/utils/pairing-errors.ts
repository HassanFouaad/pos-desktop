/**
 * Pairing error handling utilities
 * Maps API errors to user-friendly messages with actionable steps
 */

export interface PairingErrorDetails {
  title: string;
  message: string;
  steps: string[];
  showSupport?: boolean;
}

/**
 * Parse error and return user-friendly error details
 */
export function getPairingErrorDetails(
  error: Error | string | null
): PairingErrorDetails {
  const errorMessage =
    typeof error === "string" ? error : error?.message || "Unknown error";

  // Network errors
  if (
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("connection") ||
    errorMessage.toLowerCase().includes("timeout")
  ) {
    return {
      title: "Connection Failed",
      message: "Unable to connect to the server.",
      steps: [
        "Check that your device is connected to the internet",
        "Verify that the network allows connections to the server",
        "Try again in a few moments",
      ],
      showSupport: true,
    };
  }

  // OTP expired
  if (
    errorMessage.toLowerCase().includes("expired") ||
    errorMessage.toLowerCase().includes("expire")
  ) {
    return {
      title: "Pairing Code Expired",
      message: "The pairing code has expired and can no longer be used.",
      steps: [
        "Ask your manager to generate a new pairing code",
        "Use the new code within 30 minutes",
        "Try pairing again with the new code",
      ],
    };
  }

  // OTP already used
  if (
    errorMessage.toLowerCase().includes("already") ||
    errorMessage.toLowerCase().includes("used")
  ) {
    return {
      title: "Pairing Code Already Used",
      message: "This pairing code has already been used to pair a device.",
      steps: [
        "Ask your manager to generate a new pairing code",
        "Ensure you're using a fresh, unused code",
        "Try pairing again with the new code",
      ],
    };
  }

  // Invalid OTP
  if (
    errorMessage.toLowerCase().includes("invalid") ||
    errorMessage.toLowerCase().includes("not found") ||
    errorMessage.toLowerCase().includes("incorrect")
  ) {
    return {
      title: "Invalid Pairing Code",
      message: "The pairing code you entered is not valid.",
      steps: [
        "Double-check the code from the admin panel",
        "Make sure you've entered all 6 digits correctly",
        "Request a new code if this one doesn't work",
      ],
    };
  }

  // Device already paired
  if (errorMessage.toLowerCase().includes("already paired")) {
    return {
      title: "Device Already Paired",
      message: "This device is already paired to a store.",
      steps: [
        "If you need to pair to a different store, unpair first",
        "Contact your administrator if you need assistance",
      ],
      showSupport: true,
    };
  }

  // Generic error
  return {
    title: "Unable to Pair Device",
    message: "An unexpected error occurred during the pairing process.",
    steps: [
      "Try pairing again with a fresh code",
      "Restart the application if the problem persists",
      "Contact support if you continue to experience issues",
    ],
    showSupport: true,
  };
}
