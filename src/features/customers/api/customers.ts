import httpClient, { ApiResponse, endpoints } from "../../../api";
import { CustomerDTO } from "../types/customer.dto";

export const createCustomer = async (
  customerData: Partial<CustomerDTO>
): Promise<ApiResponse<CustomerDTO>> => {
  const response = await httpClient.post<CustomerDTO>(
    endpoints.customers.create,
    customerData
  );

  if (response.error || !response.data) {
    throw response.error;
  }

  return response;
};
