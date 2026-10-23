import axios from 'axios';
import Constants from 'expo-constants';
import { readStored, StorageKey } from './storage';

const configured = Constants.expoConfig?.extra?.apiBaseUrl;
if (typeof configured !== 'string' || configured === '') {
  throw new Error('expo.extra.apiBaseUrl is not set in app.json');
}

/** Backend base URL, e.g. https://<host>/api/v1/worker/, from app.json so builds never hardcode a host. */
export const workerApiBaseUrl: string = configured.endsWith('/') ? configured : `${configured}/`;

/**
 * Axios instance for the worker API. The JWT issued at registration is attached as a bearer
 * token on every request; before registration there is no token and the header is omitted.
 */
export const api = axios.create({ baseURL: workerApiBaseUrl, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(async (request) => {
  const token = await readStored(StorageKey.token);
  if (token !== '') {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});
