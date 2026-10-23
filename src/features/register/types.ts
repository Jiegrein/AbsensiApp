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

/** Body of create-worker; the phone's generated uuid becomes the worker id. */
export interface RegisterWorkerRequest {
  id: string;
  fullname: string;
  name: string;
}
