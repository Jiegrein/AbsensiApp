import { createSecureStoreMock } from '../testing/secureStoreMock';

jest.mock('axios', () => require('../testing/axiosMock').createAxiosMock());
jest.mock('expo-constants', () => require('../testing/axiosMock').createExpoConstantsMock('https://api.test/api/v1/worker'));
jest.mock('expo-secure-store', () => require('../testing/secureStoreMock').createSecureStoreMock());

const mockSecureStore = jest.requireMock('expo-secure-store') as ReturnType<typeof createSecureStoreMock>;

describe('worker api client', () => {
  beforeEach(() => mockSecureStore.store.clear());

  it('normalises the configured base URL to end with a slash', async () => {
    const { workerApiBaseUrl } = require('../api');
    expect(workerApiBaseUrl).toBe('https://api.test/api/v1/worker/');
  });

  it('attaches the stored JWT as a bearer token and omits the header before registration', async () => {
    require('../api');
    const [interceptor] = jest.requireMock('axios').create().registeredInterceptors;

    const anonymous = await interceptor({ headers: {} });
    expect(anonymous.headers.Authorization).toBeUndefined();

    mockSecureStore.store.set('jwtToken', 'abc.def.ghi');
    const authenticated = await interceptor({ headers: {} });
    expect(authenticated.headers.Authorization).toBe('Bearer abc.def.ghi');
  });
});
