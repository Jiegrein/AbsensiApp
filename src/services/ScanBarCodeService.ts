import axios from 'axios';
const baseUrl = 'https://absensi-app-web-api.herokuapp.com/';

const ScanBarCodeService = {
  getAppState: async (): Promise<boolean> => {
    const response = await axios.get(baseUrl + 'weatherforecast');
    if (response.status == 200) {
      console.log(response.data);
      console.log(response.status);
      return false;
    }
    else {
      console.log(response.status);
      return false;
    }
  }
}

export default ScanBarCodeService