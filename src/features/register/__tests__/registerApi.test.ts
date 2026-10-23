/** Pins what the register calls send and return. Auth is handled by the shared client's interceptor. */
import { registerApi } from '../registerApi';
import { RegisteredWorker, RegisterWorkerRequest, Worker } from '../types';

jest.mock('axios', () => require('../../../shared/testing/axiosMock').createAxiosMock());
jest.mock('expo-constants', () => require('../../../shared/testing/axiosMock').createExpoConstantsMock());
jest.mock('expo-secure-store', () => require('../../../shared/testing/secureStoreMock').createSecureStoreMock());

const api = jest.requireMock('axios').create() as { get: jest.Mock; post: jest.Mock };

const axiosError = (overrides: Partial<{ response: unknown; request: unknown; message: string }>) =>
  Object.assign(new Error(overrides.message ?? 'boom'), overrides);

const found: Worker = {
  id: 'w-1',
  fullname: 'Heriyanto',
  name: 'Yanto',
  workStatus: true,
  breakStatus: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

beforeEach(() => jest.clearAllMocks());

describe('registerApi.getWorker', () => {
  it('GETs worker/{id} and returns the body when the worker exists', async () => {
    api.get.mockResolvedValueOnce({ status: 200, data: found });

    await expect(registerApi.getWorker('w-1')).resolves.toEqual(found);
    expect(api.get).toHaveBeenCalledWith('w-1');
  });

  it.each([
    ['empty-guid sentinel for a malformed id', { status: 200, data: { ...found, id: '00000000-0000-0000-0000-000000000000' } }],
    ['204 with no body for an unknown id', { status: 204, data: '' }],
  ])('resolves null on the backend\'s %s', async (_label, response) => {
    api.get.mockResolvedValueOnce(response);

    await expect(registerApi.getWorker('unknown')).resolves.toBeNull();
  });

  it('rejects on HTTP errors such as a 401 from a stale token', async () => {
    api.get.mockRejectedValueOnce(axiosError({ response: { status: 401 } }));

    await expect(registerApi.getWorker('w-1')).rejects.toThrow();
  });
});

describe('registerApi.createWorker', () => {
  const request: RegisterWorkerRequest = { id: 'uuid-1', fullname: 'Heriyanto', phone: '08123456789' };
  const registered: RegisteredWorker = { ...found, id: 'uuid-1', phone: '08123456789', token: 'abc.def.ghi' };

  it('POSTs {id, fullname, phone} to create-worker and returns the worker with its token', async () => {
    api.post.mockResolvedValueOnce({ status: 200, data: registered });

    await expect(registerApi.createWorker(request)).resolves.toEqual(registered);
    expect(api.post).toHaveBeenCalledWith('create-worker', request);
  });

  it.each([
    ['a 400 such as "Phone must be filled"', () => api.post.mockRejectedValueOnce(axiosError({ response: { status: 400, data: 'Phone must be filled' } }))],
    ['a response without a token', () => api.post.mockResolvedValueOnce({ status: 200, data: { ...registered, token: '' } })],
    ['a network failure', () => api.post.mockRejectedValueOnce(axiosError({ message: 'Network Error' }))],
  ])('resolves null on %s', async (_label, arrange) => {
    arrange();

    await expect(registerApi.createWorker(request)).resolves.toBeNull();
  });
});
