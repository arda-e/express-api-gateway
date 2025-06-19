import "reflect-metadata";

import { Paginated } from "../decorators/Paginated";

describe("Paginated decorator", () => {
  class TestService {
    @Paginated()
    async list(page?: number, limit?: number) {
      return { data: [1, 2], total: 2 };
    }
  }

  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestService();
  });

  it("adds pagination info with defaults", async () => {
    const result = await service.list();
    expect(result).toEqual({ data: [1, 2], total: 2, page: 1, limit: 10 });
  });

  it("respects provided arguments", async () => {
    const result = await service.list(3, 5);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(5);
  });
});
