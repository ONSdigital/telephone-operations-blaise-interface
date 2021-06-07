const mockBlaiseRestApi = {
  getAllInstrumentsWithCatiData: jest.fn(),
  getInstrumentsWithCatiData: jest.fn(),
  getInstrumentWithCatiData: jest.fn(),
  installInstrument: jest.fn(),
  deleteInstrument: jest.fn(),
  getDiagnostics: jest.fn(),
  getLiveData: jest.fn()
};

export default mockBlaiseRestApi;
