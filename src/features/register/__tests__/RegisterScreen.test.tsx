/**
 * RegisterScreen: first-launch registration by phone, returning-user auto-login with the stored
 * token, and the fallbacks that send a phone back to the form.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../RegisterScreen';
import { registerApi } from '../registerApi';
import { RegisteredWorker, Worker } from '../types';
import { createSecureStoreMock } from '../../../shared/testing/secureStoreMock';

jest.mock('expo-secure-store', () => require('../../../shared/testing/secureStoreMock').createSecureStoreMock());
const mockSecureStore = jest.requireMock('expo-secure-store') as ReturnType<typeof createSecureStoreMock>;
jest.mock('../../../shared/api', () => ({ api: {}, workerApiBaseUrl: 'https://api.test/api/v1/worker/' }));
jest.mock('react-native-uuid', () => ({ v4: () => 'generated-uuid' }));
jest.mock('../registerApi');

const mockNavigation = { replace: jest.fn() };
jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNavigation }));

const mockedApi = registerApi as jest.Mocked<typeof registerApi>;

const knownWorker: Worker = {
  id: 'stored-uuid',
  fullname: 'Heriyanto',
  name: 'Yanto',
  workStatus: true,
  breakStatus: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

const seedSession = () => {
  mockSecureStore.store.set('workerPhoneId', 'stored-uuid');
  mockSecureStore.store.set('jwtToken', 'stored-token');
};

const homeParams = (worker: Worker) => ({ idParam: worker.id, workStatusParam: worker.workStatus, breakStatusParam: worker.breakStatus });

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.store.clear();
});

describe('first launch (nothing stored)', () => {
  it('shows the phone and name form and does not call the backend', async () => {
    const screen = await render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText('Silahkan daftar terlebih dahulu')).toBeTruthy());
    expect(screen.getByPlaceholderText('Nomor HP')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nama Lengkap')).toBeTruthy();
    expect(mockedApi.getWorker).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  it('"Daftar" registers the phone, stores the returned id and token, and opens Home', async () => {
    const registered: RegisteredWorker = { ...knownWorker, id: 'server-id', phone: '08123456789', token: 'new-token' };
    mockedApi.createWorker.mockResolvedValueOnce(registered);
    const screen = await render(<RegisterScreen />);
    await waitFor(() => expect(screen.getByText('Daftar')).toBeTruthy());

    await fireEvent.changeText(screen.getByPlaceholderText('Nomor HP'), '08123456789');
    await fireEvent.changeText(screen.getByPlaceholderText('Nama Lengkap'), 'Heriyanto');
    await fireEvent.press(screen.getByText('Daftar'));

    await waitFor(() => expect(mockNavigation.replace).toHaveBeenCalledWith('Home', homeParams(registered)));
    expect(mockedApi.createWorker).toHaveBeenCalledWith({ id: 'generated-uuid', fullname: 'Heriyanto', phone: '08123456789' });
    // The server's id wins: a known phone returns the existing worker, not the generated uuid.
    expect(mockSecureStore.store.get('workerPhoneId')).toBe('server-id');
    expect(mockSecureStore.store.get('jwtToken')).toBe('new-token');
  });

  it('shows an error and lets the user retry when registration is rejected', async () => {
    mockedApi.createWorker.mockResolvedValueOnce(null);
    const screen = await render(<RegisterScreen />);
    await waitFor(() => expect(screen.getByText('Daftar')).toBeTruthy());

    await fireEvent.press(screen.getByText('Daftar'));

    await waitFor(() => expect(screen.getByText(/Pendaftaran gagal/)).toBeTruthy());
    expect(mockSecureStore.store.size).toBe(0);
    expect(screen.getByText('Daftar').parent!.props.accessibilityState?.disabled).not.toBe(true);
  });
});

describe('returning user', () => {
  it('with an id and token stored, looks the worker up and replaces the stack with Home', async () => {
    seedSession();
    mockedApi.getWorker.mockResolvedValue(knownWorker);

    await render(<RegisterScreen />);

    await waitFor(() => expect(mockNavigation.replace).toHaveBeenCalledWith('Home', homeParams(knownWorker)));
    expect(mockedApi.getWorker).toHaveBeenCalledWith('stored-uuid');
  });

  it('with an id but no token (pre-token install) goes to the form without calling the backend', async () => {
    mockSecureStore.store.set('workerPhoneId', 'stored-uuid');

    const screen = await render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText('Silahkan daftar terlebih dahulu')).toBeTruthy());
    expect(mockedApi.getWorker).not.toHaveBeenCalled();
  });

  it.each([
    ['the backend does not know the id', () => mockedApi.getWorker.mockResolvedValue(null)],
    ['the stored token is rejected', () => mockedApi.getWorker.mockRejectedValue(new Error('401'))],
  ])('shows the form again when %s', async (_label, arrange) => {
    seedSession();
    arrange();

    const screen = await render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText('Silahkan daftar terlebih dahulu')).toBeTruthy());
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });
});
