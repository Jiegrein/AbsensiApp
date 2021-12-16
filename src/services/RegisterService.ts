import axios from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/worker/';

const RegisterService = {
    getWorkerPhoneId: async (phoneId: string): Promise<string> => {
        const response = await axios.get(baseUrl + phoneId);
        if (response.status == 200) {
            console.log(response.data);
            console.log(response.status);
            return response.data.id;
        }
        else {
            console.log(response.status);
            return '';
        }
    },

    postWorkerId: async (model: IRegisterWorkerAccount): Promise<boolean> => {
        console.log(model);
        const headers = {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
        };
        const response = await axios.post(baseUrl + 'create-worker', model, { headers: headers });
        if (response.status == 200) {
            console.log(response.data);
            console.log(response.status);
            return true;
        }
        else {
            console.log(response.status);
            return false;
        }
    }
}

export default RegisterService