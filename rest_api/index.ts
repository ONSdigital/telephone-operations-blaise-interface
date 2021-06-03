import axios, { AxiosInstance } from "axios";
import { Instrument } from "./interfaces";

class BlaiseRestApi {
  blaise_api_url: string;
  httpClient: AxiosInstance;

  constructor(blaise_api_url: string) {
    this.blaise_api_url = blaise_api_url;
    this.httpClient = axios.create();
    this.httpClient.defaults.timeout = 10000;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(url: string): Promise<any> {
    const response = await this.httpClient.get(url);
    return response.data;
  }

  async getInstruments(): Promise<Instrument[]> {
    return this.get(`${this.blaise_api_url}/api/v1/cati/instruments`);
  }

  async getLiveDate(instrument: Instrument): Promise<number | null> {
    const date = await this.get(`${this.blaise_api_url}/api/v1/serverparks/${instrument.serverParkName}/instruments/${instrument.name}/liveDate`);
    if (date === null) {
      return null;
    }
    return Date.parse(date);
  }
}

export default BlaiseRestApi;

export type { Instrument };
