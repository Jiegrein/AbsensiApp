import axios from 'axios';
import { workerApiBaseUrl } from '../../shared/api';
import { RegisterWorkerRequest, Worker } from './types';

// The backend answers an unknown id with a zeroed worker rather than 404.
const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

const unknownWorker = (): Worker => ({
  id: '',
  fullname: '',
  name: '',
  workStatus: false,
  breakStatus: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const registerApi = {
  /** Resolves a blank worker (id '') when the id is unknown; HTTP errors propagate. */
  getWorker: async (workerId: string): Promise<Worker> => {
    const response = await axios.get<Worker>(workerApiBaseUrl + workerId);
    return response.status === 200 && response.data.id !== EMPTY_GUID ? response.data : unknownWorker();
  },

  createWorker: async (request: RegisterWorkerRequest): Promise<boolean> => {
    const response = await axios.post(`${workerApiBaseUrl}create-worker`, request);
    return response.status === 200;
  },
};
