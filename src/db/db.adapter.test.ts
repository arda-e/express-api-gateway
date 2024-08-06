import DbAdapter from './db.adapter';

// TODO: Test the initialize method with different scenarios (successful connection, failed attempts, max retries reached)
// TODO: Test the getInstance method
// TODO: Test the close method
// TODO: Mock the createInstance and testConnection methods in your tests

// A mock implementation of DbAdapter for testing
class TestDbAdapter extends DbAdapter<any> {
  constructor(maxRetries = 5, retryDelay = 1000) {
    super(maxRetries, retryDelay);
  }
  protected createInstance(): any {
    return {};
  }
  protected async testConnection(): Promise<void> {}
  async query(queryString: string, params?: any[]): Promise<any> {
    return {};
  }
}

describe('DbAdapter', () => {
  let adapter: TestDbAdapter;
  /*
        Instead of using jest.spyOn directly on the adapter instance,
        we can create spy functions and assign them to the adapter's methods.
    */

  let createInstanceSpy: jest.SpyInstance;
  let testConnectionSpy: jest.SpyInstance;
  let delayRetrySpy: jest.SpyInstance;

  beforeEach(() => {
    adapter = new TestDbAdapter(3, 100); // 3 retries, 100ms delay
    createInstanceSpy = jest.spyOn(adapter, 'createInstance' as any);
    testConnectionSpy = jest.spyOn(adapter, 'testConnection' as any);
    delayRetrySpy = jest.spyOn(adapter, 'delayRetry' as any).mockResolvedValue(undefined);
  });

  describe('initialize', () => {
    it('should successfully initialize on first attempt', async () => {
      await adapter.initialize();
      expect(adapter['createInstance']).toHaveBeenCalledTimes(1);
      expect(adapter['testConnection']).toHaveBeenCalledTimes(1);
    });

    it('should retry on failed attempts and succeed', async () => {
      (adapter['testConnection'] as jest.Mock)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(undefined);

      await adapter.initialize();

      expect(adapter['createInstance']).toHaveBeenCalledTimes(3);
      expect(adapter['testConnection']).toHaveBeenCalledTimes(3);
      expect(adapter['delayRetry']).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      (adapter['testConnection'] as jest.Mock).mockRejectedValue(new Error('Connection failed'));

      await expect(adapter.initialize()).rejects.toThrow('Could not connect to the database.');

      expect(adapter['createInstance']).toHaveBeenCalledTimes(3);
      expect(adapter['testConnection']).toHaveBeenCalledTimes(3);
      expect(adapter['delayRetry']).toHaveBeenCalledTimes(2);
    });
  });

  describe('getInstance', () => {
    it('should return instance after initialization', async () => {
      await adapter.initialize();
      expect(adapter.getInstance()).toBeDefined();
    });

    it('should throw error if not initialized', () => {
      expect(() => adapter.getInstance()).toThrow('Database has not been initialized');
    });
  });

  describe('close', () => {
    it('should call destroy on instance if available', async () => {
      const mockDestroy = jest.fn();
      adapter['instance'] = { destroy: mockDestroy };

      await adapter.close();

      expect(mockDestroy).toHaveBeenCalled();
    });

    it('should not throw if destroy is not available', async () => {
      adapter['instance'] = {};

      await expect(adapter.close()).resolves.not.toThrow();
    });
  });
});
