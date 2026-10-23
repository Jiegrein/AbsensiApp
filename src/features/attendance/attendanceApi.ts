import { AxiosError } from 'axios';
import { api } from '../../shared/api';
import { CreatedLog, ScanRequest } from './types';

const unreachable = (): CreatedLog => ({ logId: '', projectId: '', message: 'Tidak bisa menghubungi server' });

export const attendanceApi = {
  /** Returns the created log, the server's rejection body on an HTTP error, or a local rejection when unreachable. */
  createLog: async (request: ScanRequest): Promise<CreatedLog> => {
    try {
      const response = await api.post<CreatedLog>('create-log', request);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<CreatedLog>;
      return err.response?.data && typeof err.response.data === 'object' ? err.response.data : unreachable();
    }
  },

  /** The API returns no body on success; any failure, including its message, collapses to false. */
  updateLog: async (logId: string, request: ScanRequest): Promise<boolean> => {
    try {
      await api.put(`update-log/${logId}`, request);
      return true;
    } catch {
      return false;
    }
  },
};
