import { api } from '../../shared/api';
import { RegisteredWorker, RegisterWorkerRequest, Worker } from './types';

// The backend answers a malformed id with a zeroed worker rather than 404.
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

export const registerApi = {
  /**
   * Resolves the worker, or null when the id is unknown. Rejects on HTTP errors, including the
   * 401 a stale or missing token produces, so the caller can fall back to registering again.
   */
  getWorker: async (workerId: string): Promise<Worker | null> => {
    const response = await api.get<Worker | ''>(workerId);
    if (response.status !== 200 || response.data === '' || response.data.id === EMPTY_GUID) {
      return null;
    }
    return response.data;
  },

  /**
   * Registers the phone, or returns the existing worker for a phone the backend already knows.
   * Either way the response carries the token for every later call. Resolves null on rejection.
   */
  createWorker: async (request: RegisterWorkerRequest): Promise<RegisteredWorker | null> => {
    try {
      const response = await api.post<RegisteredWorker>('create-worker', request);
      return response.status === 200 && response.data.token ? response.data : null;
    } catch {
      return null;
    }
  },
};
