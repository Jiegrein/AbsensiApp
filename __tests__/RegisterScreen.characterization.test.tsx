/**
 * Characterization tests (playbook R2) for RegisterScreen: first-launch registration and
 * the returning-user auto-login driven by the uuid kept in SecureStore.
 */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RegisterScreen from '../src/screens/RegisterScreen';
import RegisterService from '../src/services/RegisterService';
import { createSecureStoreMock } from './testUtils/secureStoreMock';

jest.mock('expo-secure-store', () => require('./testUtils/secureStoreMock').createSecureStoreMock());
const mockSecureStore = jest.requireMock('expo-secure-store') as ReturnType<typeof createSecureStoreMock>;
jest.mock('react-native-uuid', () => ({ v4: () => 'generated-uuid' }));
jest.mock('../src/services/RegisterService');

const mockNavigation = { replace: jest.fn() };
jest.mock('@react-navigation/native', () => ({ useNavigation: () => mockNavigation }));

const mockedService = RegisterService as jest.Mocked<typeof RegisterService>;

const knownWorker: IWorker = {
  id: 'stored-uuid',
  fullname: 'Heriyanto',
  name: 'Yanto',
  workStatus: true,
  breakStatus: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.store.clear();
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('first launch (nothing stored)', () => {
  it('shows the registration form and does not call the backend', async () => {
    const screen = await render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText('Silahkan daftar terlebih dahulu')).toBeTruthy());
    expect(screen.getByPlaceholderText('Nama')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nama Lengkap')).toBeTruthy();
    expect(mockedService.getWorkerPhoneId).not.toHaveBeenCalled();
    expect(mockNavigation.replace).not.toHaveBeenCalled();
  });

  it('"Daftar" posts a new uuid with the typed names and stores the uuid', async () => {
    mockedService.postWorkerId.mockResolvedValueOnce(true);
    // Once the uuid is stored the mount effect re-runs and looks the new worker up.
    mockedService.getWorkerPhoneId.mockResolvedValue({ ...knownWorker, id: 'generated-uuid' });
    const screen = await render(<RegisterScreen />);
    await waitFor(() => expect(screen.getByText('Daftar')).toBeTruthy());

    await fireEvent.changeText(screen.getByPlaceholderText('Nama'), 'Yanto');
    await fireEvent.changeText(screen.getByPlaceholderText('Nama Lengkap'), 'Heriyanto');
    await fireEvent(screen.getByText('Daftar'), 'pressIn');

    await waitFor(() => expect(mockSecureStore.store.get('workerPhoneId')).toBe('generated-uuid'));
    expect(mockedService.postWorkerId).toHaveBeenCalledWith({ id: 'generated-uuid', name: 'Yanto', fullname: 'Heriyanto' });
  });

  it('stores nothing when registration is rejected', async () => {
    mockedService.postWorkerId.mockResolvedValueOnce(false);
    const screen = await render(<RegisterScreen />);
    await waitFor(() => expect(screen.getByText('Daftar')).toBeTruthy());

    await fireEvent(screen.getByText('Daftar'), 'pressIn');

    await waitFor(() => expect(mockedService.postWorkerId).toHaveBeenCalled());
    expect(mockSecureStore.store.has('workerPhoneId')).toBe(false);
  });
});

describe('returning user (uuid stored)', () => {
  it('looks the worker up by the stored uuid and replaces the stack with Home', async () => {
    mockSecureStore.store.set('workerPhoneId', 'stored-uuid');
    mockedService.getWorkerPhoneId.mockResolvedValue(knownWorker);

    await render(<RegisterScreen />);

    await waitFor(() =>
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home', {
        idParam: 'stored-uuid',
        workStatusParam: true,
        breakStatusParam: false,
      })
    );
    expect(mockedService.getWorkerPhoneId).toHaveBeenCalledWith('stored-uuid');
  });

  it('shows the registration form again when the backend does not know the uuid', async () => {
    // Pinned as-is: the stale uuid stays in SecureStore; registering again overwrites it.
    mockSecureStore.store.set('workerPhoneId', 'stored-uuid');
    mockedService.getWorkerPhoneId.mockResolvedValue({ ...knownWorker, id: '' });

    const screen = await render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText('Silahkan daftar terlebih dahulu')).toBeTruthy());
    expect(mockNavigation.replace).not.toHaveBeenCalled();
    expect(mockSecureStore.store.get('workerPhoneId')).toBe('stored-uuid');
  });
});
