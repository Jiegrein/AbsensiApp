import axios, { AxiosError } from 'axios';
import { workerApiBaseUrl } from '../../shared/api';
import { CreatedLog, ScanRequest } from './types';

export const attendanceApi = {
  /**
   * Returns the created log, or the server's rejection body on an HTTP error.
   * KNOWN BUG (pinned in tests): when the request never reaches the server this returns
   * `err.request.data`, which is undefined, and the caller then throws.
   */
  createLog: async (request: ScanRequest): Promise<CreatedLog> => {
    try {
      const response = await axios.post<CreatedLog>(`${workerApiBaseUrl}create-log`, request);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<CreatedLog>;
      if (err.response) return err.response.data;
      if (err.request) return err.request.data;
      return {} as CreatedLog;
    }
  },

  /** The API returns no body on success; any failure, including its message, collapses to false. */
  updateLog: async (logId: string, request: ScanRequest): Promise<boolean> => {
    try {
      await axios.put(`${workerApiBaseUrl}update-log/${logId}`, request);
      return true;
    } catch {
      return false;
    }
  },
};
