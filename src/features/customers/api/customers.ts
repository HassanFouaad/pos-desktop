import httpClient, { endpoints } from "../../../api";
import { CustomerDTO } from "../types/customer.dto";

export const createCustomer = async (
  customerData: Partial<CustomerDTO>
): Promise<CustomerDTO> => {
  const response = await httpClient.post<CustomerDTO>(
    endpoints.customers.create,
    customerData
  );
  console.log("response", response);

  if (!response.success || !response.data) {
    throw (
      response.error?.details ??
      new Error(response.error?.message || "Failed to create customer")
    );
  }

  return response.data;
};
