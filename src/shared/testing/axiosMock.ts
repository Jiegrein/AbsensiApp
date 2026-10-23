/**
 * Replaces the `axios` module so `axios.create()` hands every caller one shared, inspectable
 * instance. Use with `jest.mock('axios', () => require('<path>/axiosMock').createAxiosMock())`
 * and read the instance back with `jest.requireMock('axios').create()`.
 */
export type RequestInterceptor = (request: { headers: Record<string, string> }) => Promise<{ headers: Record<string, string> }>;

export const createAxiosMock = () => {
  const interceptors: RequestInterceptor[] = [];
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    interceptors: { request: { use: jest.fn((fn: RequestInterceptor) => interceptors.push(fn)) } },
    /** The request interceptors registered on this instance, for direct unit testing. */
    registeredInterceptors: interceptors,
  };
  class AxiosError extends Error {}
  const axios = { create: () => instance, AxiosError };
  return { __esModule: true, default: axios, create: axios.create, AxiosError };
};

export const createExpoConstantsMock = (apiBaseUrl = 'https://api.test/api/v1/worker/') => ({
  __esModule: true,
  default: { expoConfig: { extra: { apiBaseUrl } } },
});
