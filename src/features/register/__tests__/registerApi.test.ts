/**
 * Characterization tests (playbook R2): what the register calls send and return.
 * KNOWN BUGS are pinned and labelled, not fixed here.
 */
import axios from 'axios';
import { registerApi } from '../registerApi';
import { RegisterWorkerRequest, Worker } from '../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const WORKER_BASE = 'https://absensiappwebapi.azurewebsites.net/api/v1/worker/';

const axiosError = (overrides: Partial<{ response: unknown; request: unknown; message: string }>) =>
  Object.assign(new Error(overrides.message ?? 'boom'), overrides);

beforeEach(() => jest.resetAllMocks());

describe('registerApi.getWorker', () => {
  const found: Worker = {
    id: 'w-1',
    fullname: 'Heriyanto',
    name: 'Yanto',
    workStatus: true,
    breakStatus: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  it('GETs worker/{id} and returns the body when the worker exists', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: found });

    await expect(registerApi.getWorker('w-1')).resolves.toEqual(found);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${WORKER_BASE}w-1`);
  });

  it('maps the backend empty-guid sentinel to a blank worker with id ""', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { ...found, id: '00000000-0000-0000-0000-000000000000' },
    });

    const worker = await registerApi.getWorker('unknown');
    expect(worker).toMatchObject({ id: '', fullname: '', name: '', workStatus: false, breakStatus: false });
  });

  it('propagates HTTP errors instead of catching them', async () => {
    // KNOWN BUG: with the backend's [Authorize] on GET worker/{id} this is a 401 on every
    // launch after registration, which surfaces as an unhandled rejection in RegisterScreen.
    mockedAxios.get.mockRejectedValueOnce(axiosError({ response: { status: 401 } }));

    await expect(registerApi.getWorker('w-1')).rejects.toThrow();
  });
});

describe('registerApi.createWorker', () => {
  it('POSTs {id, name, fullname} to create-worker and resolves true on 200', async () => {
    // KNOWN BUG: the backend now rejects create-worker without `phone`
    // ("Phone must be filled"); the app sends `name` instead.
    const request: RegisterWorkerRequest = { id: 'uuid-1', name: 'Yanto', fullname: 'Heriyanto' };
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: {} });

    await expect(registerApi.createWorker(request)).resolves.toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${WORKER_BASE}create-worker`, request);
  });

  it('resolves false on a non-200 success status', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 204, data: {} });

    await expect(registerApi.createWorker({ id: 'uuid-1', name: 'Yanto', fullname: 'Heriyanto' })).resolves.toBe(false);
  });
});
