import { readStored, StorageKey, writeStored } from '../../shared/storage';
import { attendanceApi } from './attendanceApi';
import { ScanEnum, ScanRequest, WorkStatus } from './types';

export interface ScanInput {
  workerId: string;
  scanEnum: ScanEnum;
  scannedProjectId: string;
  current: WorkStatus;
}

export interface ScanOutcome {
  alert: { title: string; message: string };
  /** Status Home is sent back with when the alert is dismissed. */
  home: WorkStatus;
  /** A rejected start-work scan also returns Home at once, before the alert is dismissed. */
  immediateHome?: WorkStatus;
}

const NOT_WORKING: WorkStatus = { workStatus: false, breakStatus: false };
const WORKING: WorkStatus = { workStatus: true, breakStatus: false };
const ON_BREAK: WorkStatus = { workStatus: true, breakStatus: true };

const SUCCESSFUL_UPDATE: Partial<Record<ScanEnum, ScanOutcome>> = {
  [ScanEnum.Start_Break]: { alert: { title: 'Mulai Istirahat', message: 'ISTIRAHAT - HAVE A GOOD LUNCH' }, home: ON_BREAK },
  [ScanEnum.End_Break]: { alert: { title: 'Mulai Bekerja Kembali', message: 'BEKERJA KEMBALI - BACK TO WORK' }, home: WORKING },
};
const END_WORK: ScanOutcome = {
  alert: { title: 'Selesai Bekerja', message: 'SELESAI BEKERJA DENGAN BAIK - GOOD NIGHT' },
  home: NOT_WORKING,
};

/**
 * Decides what a scanned QR means for the worker's day, talks to the backend and the
 * on-device store, and describes what the screen should show. No React in here.
 */
export const performScan = async (input: ScanInput): Promise<ScanOutcome> => {
  const request: ScanRequest = { workerId: input.workerId, projectId: input.scannedProjectId, scanEnumId: input.scanEnum };
  return input.scanEnum === ScanEnum.Start_Work ? startWork(request, input.current) : continueDay(request, input);
};

const startWork = async (request: ScanRequest, current: WorkStatus): Promise<ScanOutcome> => {
  const created = await attendanceApi.createLog(request);
  const rejected = created.logId == '' || created.projectId == '' || created.message != '';
  if (rejected) {
    return { alert: { title: 'Error', message: created.message }, home: current, immediateHome: NOT_WORKING };
  }
  await writeStored(StorageKey.logId, created.logId);
  await writeStored(StorageKey.projectId, created.projectId);
  return { alert: { title: 'Mulai Kerja', message: 'SELAMAT BEKERJA! - WORKING!' }, home: WORKING };
};

const continueDay = async (request: ScanRequest, input: ScanInput): Promise<ScanOutcome> => {
  const storedLogId = await readStored(StorageKey.logId);
  const storedProjectId = await readStored(StorageKey.projectId);

  if (storedLogId === '') {
    return {
      alert: { title: 'Belum mulai kerja', message: 'Scan mulai kerja terlebih dahulu' },
      home: { workStatus: false, breakStatus: input.current.breakStatus },
    };
  }
  if (storedProjectId !== request.projectId) {
    return { alert: { title: 'Error', message: 'Barcode yang di scan beda dengan yang pas mulai kerja' }, home: input.current };
  }

  const updated = await attendanceApi.updateLog(storedLogId, request);
  if (!updated) {
    return { alert: { title: 'Error', message: 'Lapor ke bos' }, home: input.current };
  }
  return SUCCESSFUL_UPDATE[input.scanEnum] ?? END_WORK;
};
