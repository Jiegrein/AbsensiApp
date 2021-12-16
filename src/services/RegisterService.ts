import axios from 'axios';
const baseUrl = 'https://absensi-app-web-api.herokuapp.com/';

const RegisterService = {
  getWorkerPhoneId: async (phoneId: string): Promise<string> => {
    const response = await axios.get(baseUrl + 'api/v1/worker/' + phoneId);
    if (response.status == 200) {
      console.log(response.data);
      console.log(response.status);
      return 'id';
    }
    else {
      console.log(response.status);
      return '';
    }
  },

  postWorkerId: async (model: IRegisterWorkerAccount): Promise<boolean> => {
    const response = await axios.post(baseUrl + 'api/v1/worker/', {model});
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