import { endpoints, getConfig } from "./core/config";
import { httpClient } from "./core/httpClient";
import { ApiResponse } from "./core/types";

// Re-export everything for easy imports
export { endpoints, getConfig, httpClient };
export type { ApiResponse };

// Export default for simpler imports
export default httpClient;
