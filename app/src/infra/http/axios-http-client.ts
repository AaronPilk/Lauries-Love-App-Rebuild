import { HttpRequest, HttpResponse, HttpClient } from 'data/protocols/http';
import { AxiosResponse, Axios } from 'axios';
import { consoleCustom } from 'utils/other';

export class AxiosHttpClient implements HttpClient {
  axios: Axios;
  constructor(instance: Axios) {
    this.axios = instance;
  }
  async request(data: HttpRequest): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse;
    try {
      axiosResponse = await this.axios.request({
        url: data.url,
        method: data.method,
        data: data.body,
        headers: data.headers,
        params: data.params,
      });
    } catch (error: any) {
      consoleCustom(error);
      consoleCustom(error?.message);
      consoleCustom(error?.response?.data);
      consoleCustom(JSON.stringify(data, null, 2));
      axiosResponse = error.response;
    }
    if (!axiosResponse || axiosResponse.status >= 400) {
      throw Error('Something went wrong');
    }
    return {
      statusCode: axiosResponse.status,
      body: axiosResponse.data,
    };
  }
}
