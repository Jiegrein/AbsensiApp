import axios, { AxiosError } from 'axios';
const baseUrl = 'https://absensiappwebapi.azurewebsites.net/api/v1/worker/';

// Deprecated
const HomeService = {
  getAppState: async (id: string): Promise<[boolean, boolean, boolean]> => {
    try {
      const response = await axios.get(baseUrl + id);
      return [true, response.data.workStatus, response.data.breakStatus];
    }
    catch (error) {
      const err = error as AxiosError
      if (err.response) {
        // console.log('response');
        // console.log(err.response.status);
        // console.log(err.response.data);
      }
      else if (err.request) {
        // console.log('request');
        // console.log(err.request.status);
        // console.log(err.request.data);
      }
      else if (err.message) {
        // console.log('message');
        // console.log(err.message);
      }
      return [false, false, false];
    }
  }
}

export default HomeService