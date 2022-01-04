import axios from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/worker/';

const RegisterService = {
    getWorkerPhoneId: async (phoneId: string): Promise<IWorker> => {
        console.log('return' + phoneId);
        const response = await axios.get(baseUrl + phoneId);

        console.log('data : ' + response.data);
        if (response.status === 200 && response.data.id !== '00000000-0000-0000-0000-000000000000') {
            return response.data;
        }
        else {
            const worker : IWorker = {
                id: '',
                fullname: '',
                name: '',
                workStatus: false,
                breakStatus: false,
                createdAt: new Date,
                updatedAt: new Date
            };
            return worker;
        }
    },

    postWorkerId: async (model: IRegisterWorkerAccount): Promise<boolean> => {
        console.log(model);
        const response = await axios.post(baseUrl + 'create-worker', model);
        if (response.status == 200) {
            return true;
        }
        else {
            return false;
        }
    }
}

export default RegisterService