/**
 * Pins what the attendance calls send and return, including each error branch.
 * Authentication is handled by the shared client's interceptor (see shared/__tests__/api.test.ts).
 */
import { attendanceApi } from '../attendanceApi';
import { CreatedLog, ScanRequest } from '../types';

jest.mock('axios', () => require('../../../shared/testing/axiosMock').createAxiosMock());
jest.mock('expo-constants', () => require('../../../shared/testing/axiosMock').createExpoConstantsMock());
jest.mock('expo-secure-store', () => require('../../../shared/testing/secureStoreMock').createSecureStoreMock());

const api = jest.requireMock('axios').create() as { post: jest.Mock; put: jest.Mock };

const axiosError = (overrides: Partial<{ response: unknown; request: unknown; message: string }>) =>
  Object.assign(new Error(overrides.message ?? 'boom'), overrides);

const UNREACHABLE: CreatedLog = { logId: '', projectId: '', message: 'Tidak bisa menghubungi server' };

beforeEach(() => jest.clearAllMocks());

describe('attendanceApi.createLog', () => {
  const request: ScanRequest = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 1 };

  it('POSTs the request to create-log and returns the response body', async () => {
    const body: CreatedLog = { logId: 'log-1', projectId: 'p-1', message: '' };
    api.post.mockResolvedValueOnce({ data: body });

    await expect(attendanceApi.createLog(request)).resolves.toEqual(body);
    expect(api.post).toHaveBeenCalledWith('create-log', request);
  });

  it('returns the server error body on a 4xx/5xx response', async () => {
    const rejected: CreatedLog = { logId: '', projectId: '', message: 'Sudah scan hari ini' };
    api.post.mockRejectedValueOnce(axiosError({ response: { status: 400, data: rejected } }));

    await expect(attendanceApi.createLog(request)).resolves.toEqual(rejected);
  });

  it.each([
    ['no response', axiosError({ request: {} })],
    ['non-object error body', axiosError({ response: { status: 401, data: '' } })],
    ['other error', axiosError({ message: 'Network Error' })],
  ])('returns a local rejection on %s so the screen shows an alert instead of crashing', async (_label, error) => {
    api.post.mockRejectedValueOnce(error);

    await expect(attendanceApi.createLog(request)).resolves.toEqual(UNREACHABLE);
  });
});

describe('attendanceApi.updateLog', () => {
  const request: ScanRequest = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 2 };

  it('PUTs the request to update-log/{logId} and resolves true on success', async () => {
    api.put.mockResolvedValueOnce({});

    await expect(attendanceApi.updateLog('log-1', request)).resolves.toBe(true);
    expect(api.put).toHaveBeenCalledWith('update-log/log-1', request);
  });

  it.each([
    ['HTTP error', axiosError({ response: { status: 400, data: 'Belum istirahat' } })],
    ['no response', axiosError({ request: {} })],
    ['other error', axiosError({ message: 'Network Error' })],
  ])('resolves false on %s and discards the server message', async (_label, error) => {
    api.put.mockRejectedValueOnce(error);

    await expect(attendanceApi.updateLog('log-1', request)).resolves.toBe(false);
  });
});
