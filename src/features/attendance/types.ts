// Numeric values are the backend's scan_enum ids.
export enum ScanEnum {
  Start_Work = 1,
  Start_Break,
  End_Break,
  End_Work,
}

export interface WorkStatus {
  workStatus: boolean;
  breakStatus: boolean;
}

/** Body of create-log and update-log; field names are the wire contract. */
export interface ScanRequest {
  workerId: string;
  projectId: string;
  scanEnumId: number;
}

/** Response of create-log; on rejection `logId` is empty and `message` says why. */
export interface CreatedLog {
  logId: string;
  projectId: string;
  message: string;
}
