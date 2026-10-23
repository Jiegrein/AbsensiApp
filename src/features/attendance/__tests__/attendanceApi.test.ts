/**
 * Characterization tests (playbook R2): what the attendance calls send and return,
 * including each error branch. KNOWN BUGS are pinned and labelled, not fixed here.
 */
import axios from 'axios';
import { attendanceApi } from '../attendanceApi';
import { CreatedLog, ScanRequest } from '../types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const WORKER_BASE = 'https://absensiappwebapi.azurewebsites.net/api/v1/worker/';

const axiosError = (overrides: Partial<{ response: unknown; request: unknown; message: string }>) =>
  Object.assign(new Error(overrides.message ?? 'boom'), overrides);

beforeEach(() => jest.resetAllMocks());

describe('attendanceApi.createLog', () => {
  const request: ScanRequest = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 1 };

  it('POSTs the request to create-log and returns the response body', async () => {
    const body: CreatedLog = { logId: 'log-1', projectId: 'p-1', message: '' };
    mockedAxios.post.mockResolvedValueOnce({ data: body });

    await expect(attendanceApi.createLog(request)).resolves.toEqual(body);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${WORKER_BASE}create-log`, request);
  });

  it('sends no Authorization header', async () => {
    // KNOWN BUG: the backend has required a JWT on create-log since 2023-02-01 (WorkerAPI.cs
    // [Authorize]); the app never stores or sends the token returned by create-worker.
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    await attendanceApi.createLog(request);
    const [, , config] = mockedAxios.post.mock.calls[0];
    expect(config).toBeUndefined();
  });

  it('returns the server error body on a 4xx/5xx response', async () => {
    const rejected: CreatedLog = { logId: '', projectId: '', message: 'Sudah scan hari ini' };
    mockedAxios.post.mockRejectedValueOnce(axiosError({ response: { status: 400, data: rejected } }));

    await expect(attendanceApi.createLog(request)).resolves.toEqual(rejected);
  });

  it('returns undefined when the request never reached the server', async () => {
    // KNOWN BUG: `err.request.data` is never set, so the caller dereferences undefined.
    mockedAxios.post.mockRejectedValueOnce(axiosError({ request: {} }));

    await expect(attendanceApi.createLog(request)).resolves.toBeUndefined();
  });

  it('returns an empty object for a non-HTTP error', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError({ message: 'Network Error' }));

    await expect(attendanceApi.createLog(request)).resolves.toEqual({});
  });
});

describe('attendanceApi.updateLog', () => {
  const request: ScanRequest = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 2 };

  it('PUTs the request to update-log/{logId} and resolves true on success', async () => {
    mockedAxios.put.mockResolvedValueOnce({});

    await expect(attendanceApi.updateLog('log-1', request)).resolves.toBe(true);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${WORKER_BASE}update-log/log-1`, request);
  });

  it.each([
    ['HTTP error', axiosError({ response: { status: 400, data: 'Belum istirahat' } })],
    ['no response', axiosError({ request: {} })],
    ['other error', axiosError({ message: 'Network Error' })],
  ])('resolves false on %s and discards the server message', async (_label, error) => {
    mockedAxios.put.mockRejectedValueOnce(error);

    await expect(attendanceApi.updateLog('log-1', request)).resolves.toBe(false);
  });
});
