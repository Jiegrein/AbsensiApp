import axios from 'axios';
const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/worker/';

const HomeService = {
  getAppState: async (id: string): Promise<[boolean, boolean, boolean]> => {
    const response = await axios.get(baseUrl + id);
    if (response.status == 200) {
      console.log(response.data);
      console.log(response.status);
      return [true, response.data.workStatus, response.data.breakStatus];
    }
    else {
      console.log(response.status);
      return [false, false, false];
    }
  }
}

export default HomeService