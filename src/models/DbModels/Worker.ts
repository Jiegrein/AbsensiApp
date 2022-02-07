interface IWorker{
    id: string;
    fullname: string;
    name: string;
    workStatus: boolean;
    breakStatus: boolean;
    createdAt: Date;
    updatedAt: Date;
};

declare const IWorker: IWorker;