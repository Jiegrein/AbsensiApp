import axios from 'axios';
const baseUrl = 'http://localhost:5001/';

const ScanBarCodeService = {
  getAppState: async (): Promise<boolean> => {
    const response = await axios.get('https://api.publicapis.org/random?auth=null');
    if (response.status != 200) {
      return false;
    }
    else {
      console.log("API hit");
      return false;
    }
  }
}

export default ScanBarCodeService