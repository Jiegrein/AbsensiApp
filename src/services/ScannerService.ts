import axios, { AxiosError } from 'axios';

const baseUrl = 'https://absensi-app-web-api.herokuapp.com/api/v1/worker/';

const ScannerService = {
    createLogId: async (model: LogModel): Promise<string> => {
        model.projectId = '142554ad-1df6-4902-a29a-3e948a706b6f';
        const response = await axios.post(baseUrl + 'create-log', model);
        if (response.status == 200) {
            return response.data;
        }
        else {
            return '';
        }
    },

    updateLogId: async (logId: string, model: LogModel): Promise<boolean> => {
        model.projectId = '142554ad-1df6-4902-a29a-3e948a706b6f';
        try {
            const response = await axios.put(baseUrl + 'update-log/' + logId, model);
            return (response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const serverError = error as Error | AxiosError;
                if (axios.isAxiosError(serverError)) {
                    // Access to config, request, and response
                    console.log(serverError);
                } else {
                    return false;
                }
            }
            return false;
        }
    }
}

export default ScannerService