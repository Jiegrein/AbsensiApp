import axios, { AxiosError } from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/worker/';

const ScannerService = {
    createLogId: async (model: LogModel): Promise<NewLogModel> => {
        try {
            console.log(model);
            const response = await axios.post(baseUrl + 'create-log', model)
            return response.data;
        }
        catch (error) {
            const err = error as AxiosError
            if (err.response) {
                // console.log('response');
                // console.log(err.response.status);
                // console.log(err.response.data);
                return err.response.data;
            }
            else if (err.request) {
                // console.log('request');
                // console.log(err.request.status);
                // console.log(err.request.data);
                return err.request.data;
            }
            else if (err.message) {
                // console.log('message');
                // console.log(err.message);
                return <NewLogModel>{};
            }
            return <NewLogModel>{};
        }
    },

    updateLogId: async (logId: string, model: LogModel): Promise<boolean> => {
        try {
            // If success, api doesnt return anything
            await axios.put(baseUrl + 'update-log/' + logId, model);
            return true;
        }
        catch (error) {
            //if error api returns message
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
                //do something else

            }
            else if (err.message) {
                // console.log('message');
                // console.log(err.message);
                //do something other than the other two
            }
            return false;
        }
    }
}

export default ScannerService