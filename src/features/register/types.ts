/** Worker record as returned by GET worker/{id}. */
export interface Worker {
  id: string;
  fullname: string;
  name: string;
  workStatus: boolean;
  breakStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Body of create-worker; the phone's generated uuid becomes the worker id unless the phone is already known. */
export interface RegisterWorkerRequest {
  id: string;
  fullname: string;
  phone: string;
}

/** Response of create-worker: the worker (existing one if the phone was known) and its JWT. */
export interface RegisteredWorker extends Worker {
  phone: string;
  token: string;
}
