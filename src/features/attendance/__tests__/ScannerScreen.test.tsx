/**
 * Characterization tests (playbook R2) for ScannerScreen's scan decision logic: given the
 * action being scanned, what is stored from the morning's start-work scan, and what the
 * backend answers, which Alert is shown and what status Home is sent back with.
 *
 * The camera is mocked at the expo-camera boundary; the scan is driven by invoking the
 * callback the screen hands to <CameraView>. The Expo 58 upgrade changed only this mock
 * (Camera/onBarCodeScanned became CameraView/onBarcodeScanned); the assertions are unchanged.
 */
import React from 'react';
import { Alert } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import ScannerScreen from '../ScannerScreen';
import { attendanceApi } from '../attendanceApi';
import { ScanEnum } from '../types';
import { createSecureStoreMock } from '../../../shared/testing/secureStoreMock';

type ScanCallback = (result: { type: string; data: string }) => Promise<void>;
const mockScan: { callback?: ScanCallback } = {};

jest.mock('expo-camera', () => {
  const React = require('react');
  const { View } = require('react-native');
  const CameraView = (props: { onBarcodeScanned?: ScanCallback }) => {
    mockScan.callback = props.onBarcodeScanned;
    return React.createElement(View, { testID: 'camera' });
  };
  const Camera = { requestCameraPermissionsAsync: jest.fn(async () => ({ status: 'granted' })) };
  return { Camera, CameraView, PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' } };
});

jest.mock('expo-secure-store', () => require('../../../shared/testing/secureStoreMock').createSecureStoreMock());
const mockSecureStore = jest.requireMock('expo-secure-store') as ReturnType<typeof createSecureStoreMock>;
jest.mock('@react-navigation/native', () => ({ useIsFocused: () => true }));
jest.mock('../../../shared/api', () => ({ api: {}, workerApiBaseUrl: 'https://api.test/api/v1/worker/' }));
jest.mock('../attendanceApi');

const mockedApi = attendanceApi as jest.Mocked<typeof attendanceApi>;
const navigation = { navigate: jest.fn() };
const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

const PROJECT = '142554ad-1df6-4902-a29a-3e948a706b6f';

const renderScanner = (scanEnum: ScanEnum, workStatus = false, breakStatus = false) =>
  render(
    <ScannerScreen
      route={{ params: { idParam: 'w-1', scanEnumParam: scanEnum, workStatusParam: workStatus, breakStatusParam: breakStatus } } as any}
      navigation={navigation as any}
    />
  );

const scan = async (data: string) => {
  await waitFor(() => expect(mockScan.callback).toBeDefined());
  await mockScan.callback!({ type: 'qr', data });
};

/** Presses the single "Return" button of the last Alert. */
const pressReturn = () => {
  const buttons = alertSpy.mock.calls[alertSpy.mock.calls.length - 1][2] as Array<{ text: string; onPress: () => void }>;
  expect(buttons.map((b) => b.text)).toEqual(['Return']);
  buttons[0].onPress();
};

const homeParams = (workStatusParam: boolean, breakStatusParam: boolean) => ({
  idParam: 'w-1',
  workStatusParam,
  breakStatusParam,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSecureStore.store.clear();
  mockScan.callback = undefined;
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
});

describe('start work', () => {
  it('creates a log, stores logId and projectId, and returns Home as working', async () => {
    mockedApi.createLog.mockResolvedValueOnce({ logId: 'log-1', projectId: PROJECT, message: '' });
    await renderScanner(ScanEnum.Start_Work);

    await scan(PROJECT);

    expect(mockedApi.createLog).toHaveBeenCalledWith({ workerId: 'w-1', projectId: PROJECT, scanEnumId: ScanEnum.Start_Work });
    await waitFor(() => expect(mockSecureStore.store.get('LogId')).toBe('log-1'));
    expect(mockSecureStore.store.get('ProjectId')).toBe(PROJECT);
    expect(alertSpy).toHaveBeenCalledWith('Mulai Kerja', 'SELAMAT BEKERJA! - WORKING!', expect.any(Array));
    pressReturn();
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(true, false));
  });

  it('shows the backend message when the log is rejected and stores nothing', async () => {
    mockedApi.createLog.mockResolvedValueOnce({ logId: '', projectId: '', message: 'Sudah scan hari ini' });
    await renderScanner(ScanEnum.Start_Work, false, false);

    await scan(PROJECT);

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Sudah scan hari ini', expect.any(Array));
    expect(mockSecureStore.store.size).toBe(0);
    pressReturn();
    // Pinned as-is: the failure path navigates twice, once from the Alert and once directly.
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(false, false));
  });

  it('throws when the service returns undefined (request never sent)', async () => {
    // KNOWN BUG: see services test; `undefined.logId` is dereferenced.
    mockedApi.createLog.mockResolvedValueOnce(undefined as any);
    await renderScanner(ScanEnum.Start_Work);

    await waitFor(() => expect(mockScan.callback).toBeDefined());
    await expect(mockScan.callback!({ type: 'qr', data: PROJECT })).rejects.toThrow(TypeError);
  });
});

describe('scans after start work', () => {
  const seedMorning = (projectId = PROJECT) => {
    mockSecureStore.store.set('LogId', 'log-1');
    mockSecureStore.store.set('ProjectId', projectId);
  };

  it('refuses any non-start scan when no log is stored', async () => {
    await renderScanner(ScanEnum.End_Work, true, false);

    await scan(PROJECT);

    expect(alertSpy).toHaveBeenCalledWith('Belum mulai kerja', 'Scan mulai kerja terlebih dahulu', expect.any(Array));
    expect(mockedApi.updateLog).not.toHaveBeenCalled();
    pressReturn();
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(false, false));
  });

  it('refuses a QR for a different project than the morning scan', async () => {
    seedMorning();
    await renderScanner(ScanEnum.Start_Break, true, false);

    await scan('some-other-project');

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Barcode yang di scan beda dengan yang pas mulai kerja', expect.any(Array));
    expect(mockedApi.updateLog).not.toHaveBeenCalled();
    pressReturn();
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(true, false));
  });

  it.each([
    [ScanEnum.Start_Break, 'Mulai Istirahat', 'ISTIRAHAT - HAVE A GOOD LUNCH', true, true],
    [ScanEnum.End_Break, 'Mulai Bekerja Kembali', 'BEKERJA KEMBALI - BACK TO WORK', true, false],
    [ScanEnum.End_Work, 'Selesai Bekerja', 'SELESAI BEKERJA DENGAN BAIK - GOOD NIGHT', false, false],
  ])('scan %i updates the stored log and returns Home with the new status', async (scanEnum, title, message, work, brk) => {
    seedMorning();
    mockedApi.updateLog.mockResolvedValueOnce(true);
    await renderScanner(scanEnum, true, scanEnum === ScanEnum.End_Break);

    await scan(PROJECT);

    expect(mockedApi.updateLog).toHaveBeenCalledWith('log-1', { workerId: 'w-1', projectId: PROJECT, scanEnumId: scanEnum });
    expect(alertSpy).toHaveBeenCalledWith(title, message, expect.any(Array));
    pressReturn();
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(work, brk));
  });

  it('reports "Lapor ke bos" when the update fails and keeps the current status', async () => {
    seedMorning();
    mockedApi.updateLog.mockResolvedValueOnce(false);
    await renderScanner(ScanEnum.End_Work, true, false);

    await scan(PROJECT);

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Lapor ke bos', expect.any(Array));
    pressReturn();
    expect(navigation.navigate).toHaveBeenCalledWith('Home', homeParams(true, false));
  });

  it('ignores a second scan while the first is being handled', async () => {
    seedMorning();
    mockedApi.updateLog.mockResolvedValue(true);
    const screen = await renderScanner(ScanEnum.End_Work, true, false);

    await scan(PROJECT);
    await screen.rerender(
      <ScannerScreen
        route={{ params: { idParam: 'w-1', scanEnumParam: ScanEnum.End_Work, workStatusParam: true, breakStatusParam: false } } as any}
        navigation={navigation as any}
      />
    );

    expect(mockScan.callback).toBeUndefined();
  });
});

describe('camera permission', () => {
  it('asks for permission on mount and shows the camera once granted', async () => {
    const { Camera } = require('expo-camera');
    const screen = await renderScanner(ScanEnum.Start_Work);

    await waitFor(() => expect(screen.getByTestId('camera')).toBeTruthy());
    expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('shows the allow-camera prompt when permission is denied', async () => {
    const { Camera } = require('expo-camera');
    Camera.requestCameraPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const screen = await renderScanner(ScanEnum.Start_Work);

    await waitFor(() => expect(screen.getByText('Berikan app akses ke kamera')).toBeTruthy());
    expect(screen.queryByTestId('camera')).toBeNull();
  });
});
