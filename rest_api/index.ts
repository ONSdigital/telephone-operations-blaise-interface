import axios from "axios";
import { Instrument } from "./interfaces";

class BlaiseRestApi {
  blaise_api_url: string;

  constructor(blaise_api_url: string) {
    this.blaise_api_url = blaise_api_url;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(url: string): Promise<any> {
    const response = await axios.get(url);
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
