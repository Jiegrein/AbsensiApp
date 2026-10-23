/**
 * Characterization tests (playbook R2): pin exactly what the service layer sends to the
 * backend and what it hands back to the screens, as of the Expo 44 codebase. These are
 * the oracle for the Expo upgrade; an upgrade must not change any assertion here.
 *
 * KNOWN BUGS are pinned and labelled, not fixed. Fix them in separate, deliberate changes.
 */
import axios from 'axios';
import ScannerService from '../src/services/ScannerService';
import RegisterService from '../src/services/RegisterService';
import HomeService from '../src/services/HomeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const WORKER_BASE = 'https://absensiappwebapi.azurewebsites.net/api/v1/worker/';

const axiosError = (overrides: Partial<{ response: unknown; request: unknown; message: string }>) =>
  Object.assign(new Error(overrides.message ?? 'boom'), overrides);

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('ScannerService.createLogId', () => {
  const model: LogModel = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 1 };

  it('POSTs the log model to create-log and returns the response body', async () => {
    const body: NewLogModel = { logId: 'log-1', projectId: 'p-1', message: '' };
    mockedAxios.post.mockResolvedValueOnce({ data: body });

    await expect(ScannerService.createLogId(model)).resolves.toEqual(body);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${WORKER_BASE}create-log`, model);
  });

  it('sends no Authorization header', async () => {
    // KNOWN BUG: the backend has required a JWT on create-log since 2023-02-01 (WorkerAPI.cs
    // [Authorize]); the app never stores or sends the token returned by create-worker.
    mockedAxios.post.mockResolvedValueOnce({ data: {} });
    await ScannerService.createLogId(model);
    const [, , config] = mockedAxios.post.mock.calls[0];
    expect(config).toBeUndefined();
  });

  it('returns the server error body on a 4xx/5xx response', async () => {
    const rejected: NewLogModel = { logId: '', projectId: '', message: 'Sudah scan hari ini' };
    mockedAxios.post.mockRejectedValueOnce(axiosError({ response: { status: 400, data: rejected } }));

    await expect(ScannerService.createLogId(model)).resolves.toEqual(rejected);
  });

  it('returns undefined when the request never reached the server', async () => {
    // KNOWN BUG: this returns `err.request.data`, which XMLHttpRequest never sets, so the
    // caller in ScannerScreen dereferences `undefined.logId` and throws.
    mockedAxios.post.mockRejectedValueOnce(axiosError({ request: {} }));

    await expect(ScannerService.createLogId(model)).resolves.toBeUndefined();
  });

  it('returns an empty object for a non-HTTP error', async () => {
    mockedAxios.post.mockRejectedValueOnce(axiosError({ message: 'Network Error' }));

    await expect(ScannerService.createLogId(model)).resolves.toEqual({});
  });
});

describe('ScannerService.updateLogId', () => {
  const model: LogModel = { workerId: 'w-1', projectId: 'p-1', scanEnumId: 2 };

  it('PUTs the model to update-log/{logId} and resolves true on success', async () => {
    mockedAxios.put.mockResolvedValueOnce({});

    await expect(ScannerService.updateLogId('log-1', model)).resolves.toBe(true);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${WORKER_BASE}update-log/log-1`, model);
  });

  it.each([
    ['HTTP error', axiosError({ response: { status: 400, data: 'Belum istirahat' } })],
    ['no response', axiosError({ request: {} })],
    ['other error', axiosError({ message: 'Network Error' })],
  ])('resolves false on %s and discards the server message', async (_label, error) => {
    mockedAxios.put.mockRejectedValueOnce(error);

    await expect(ScannerService.updateLogId('log-1', model)).resolves.toBe(false);
  });
});

describe('RegisterService.getWorkerPhoneId', () => {
  const found: IWorker = {
    id: 'w-1',
    fullname: 'Heriyanto',
    name: 'Yanto',
    workStatus: true,
    breakStatus: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
  };

  it('GETs worker/{phoneId} and returns the body when the worker exists', async () => {
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: found });

    await expect(RegisterService.getWorkerPhoneId('w-1')).resolves.toEqual(found);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${WORKER_BASE}w-1`);
  });

  it('maps the backend empty-guid sentinel to a blank worker with id ""', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      status: 200,
      data: { ...found, id: '00000000-0000-0000-0000-000000000000' },
    });

    const worker = await RegisterService.getWorkerPhoneId('unknown');
    expect(worker).toMatchObject({ id: '', fullname: '', name: '', workStatus: false, breakStatus: false });
  });

  it('propagates HTTP errors instead of catching them', async () => {
    // KNOWN BUG: with the backend's [Authorize] on GET worker/{id} this is a 401 on every
    // launch after registration, which surfaces as an unhandled rejection in RegisterScreen.
    mockedAxios.get.mockRejectedValueOnce(axiosError({ response: { status: 401 } }));

    await expect(RegisterService.getWorkerPhoneId('w-1')).rejects.toThrow();
  });
});

describe('RegisterService.postWorkerId', () => {
  it('POSTs {id, name, fullname} to create-worker and resolves true on 200', async () => {
    // KNOWN BUG: the backend now rejects create-worker without `phone`
    // ("Phone must be filled"); the master branch sends `name` instead.
    const model: IRegisterWorkerAccount = { id: 'uuid-1', name: 'Yanto', fullname: 'Heriyanto' };
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: {} });

    await expect(RegisterService.postWorkerId(model)).resolves.toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(`${WORKER_BASE}create-worker`, model);
  });

  it('resolves false on a non-200 success status', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 204, data: {} });

    await expect(
      RegisterService.postWorkerId({ id: 'uuid-1', name: 'Yanto', fullname: 'Heriyanto' })
    ).resolves.toBe(false);
  });
});

describe('HomeService.getAppState (marked deprecated in source)', () => {
  it('returns [true, workStatus, breakStatus] from GET worker/{id}', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { workStatus: true, breakStatus: false } });

    await expect(HomeService.getAppState('w-1')).resolves.toEqual([true, true, false]);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${WORKER_BASE}w-1`);
  });

  it('returns [false, false, false] on any error', async () => {
    mockedAxios.get.mockRejectedValueOnce(axiosError({ response: { status: 500 } }));

    await expect(HomeService.getAppState('w-1')).resolves.toEqual([false, false, false]);
  });
});
