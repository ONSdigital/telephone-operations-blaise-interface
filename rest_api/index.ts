import axios, { AxiosInstance } from "axios";
import { Instrument, Diagnostic, InstallInstrument, InstallInstrumentResponse, Survey } from "./interfaces";

class BlaiseRestApi {
  blaise_api_url: string;
  httpClient: AxiosInstance;

  constructor(blaise_api_url: string) {
    this.blaise_api_url = blaise_api_url;
    this.httpClient = axios.create();
    this.httpClient.defaults.timeout = 10000;
  }

  async getAllInstrumentsWithCatiData(): Promise<Instrument[]> {
    return this.get("/api/v1/cati/instruments");
  }

  async getInstrumentsWithCatiData(serverpark: string): Promise<Instrument[]> {
    return this.get(`/api/v1/cati/serverparks/${serverpark}/instruments`);
  }

  async getInstrumentWithCatiData(serverpark: string, instrumentName: string): Promise<Instrument> {
    return this.get(`/api/v1/cati/serverparks/${serverpark}/instruments/${instrumentName}`);
  }

  async getInstruments(serverpark: string): Promise<Instrument[]> {
    return this.get(`/api/v1/serverparks/${serverpark}/instruments`);
  }

  async getInstrument(serverpark: string, instrumentName: string): Promise<Instrument> {
    return this.get(`/api/v1/serverparks/${serverpark}/instruments/${instrumentName}`);
  }

  async installInstrument(serverpark: string, instrument: InstallInstrument): Promise<InstallInstrumentResponse> {
    return this.post(`/api/v1/serverparks/${serverpark}/instruments`, instrument);
  }

  async deleteInstrument(serverpark: string, instrumentName: string): Promise<null> {
    return this.delete(`/api/v1/serverparks/${serverpark}/instruments/${instrumentName}?name=${instrumentName}`);
  }

  async getLiveDate(instrument: Instrument): Promise<number | null> {
    const date = await this.get(`/api/v1/serverparks/${instrument.serverParkName}/instruments/${instrument.name}/liveDate`);
    if (date === null) {
      return null;
    }
    return Date.parse(date);
  }

  async getDiagnostics(): Promise<Diagnostic[]> {
    return this.get("/api/v1/health/diagnosis");
  }

  private url(url: string): string {
    if (!url.startsWith("/")) {
      url = `/${url}`;
    }
    return url;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async get(url: string): Promise<any> {
    const response = await this.httpClient.get(`${this.blaise_api_url}${this.url(url)}`);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  private async post(url: string, data: any): Promise<any> {
    const response = await this.httpClient.post(`${this.blaise_api_url}${this.url(url)}`, data);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async delete(url: string): Promise<any> {
    const response = await this.httpClient.delete(`${this.blaise_api_url}${this.url(url)}`);
    return response.data;
  }
}

export default BlaiseRestApi;

export type { Instrument, InstallInstrument, InstallInstrumentResponse, Diagnostic, Survey };
