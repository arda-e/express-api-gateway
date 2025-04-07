import "reflect-metadata";
import { CUSTOM_RESPONSE_HANDLING_KEY, CustomResponse } from "../decorators/CustomResponse";
import { Controller } from "../decorators/Controller";

describe("CustomResponse Decorator", () => {
  @Controller()
  class TestController {
    @CustomResponse()
    public async customResponseMethod() {
      return "Custom response";
    }

    public async normalMethod() {
      return "Normal response";
    }
  }

  let testInstance: TestController;

  beforeEach(() => {
    testInstance = new TestController();
  });

  it("should mark method with custom response handling metadata", () => {
    const hasCustomResponse = Reflect.getMetadata(
      CUSTOM_RESPONSE_HANDLING_KEY,
      testInstance,
      "customResponseMethod",
    );
    expect(hasCustomResponse).toBe(true);
  });

  it("should not mark normal methods with custom response handling metadata", () => {
    const hasCustomResponse = Reflect.getMetadata(
      CUSTOM_RESPONSE_HANDLING_KEY,
      testInstance,
      "normalMethod",
    );
    expect(hasCustomResponse).toBeUndefined();
  });

  it("should allow multiple methods to be marked with custom response handling", () => {
    @Controller()
    class MultiMethodController {
      @CustomResponse()
      public async method1() {}

      @CustomResponse()
      public async method2() {}
    }

    const controller = new MultiMethodController();
    const method1HasCustomResponse = Reflect.getMetadata(
      CUSTOM_RESPONSE_HANDLING_KEY,
      controller,
      "method1",
    );
    const method2HasCustomResponse = Reflect.getMetadata(
      CUSTOM_RESPONSE_HANDLING_KEY,
      controller,
      "method2",
    );

    expect(method1HasCustomResponse).toBe(true);
    expect(method2HasCustomResponse).toBe(true);
  });

  it("should throw error when method is called without @Controller decorator", async () => {
    class NonControllerClass {
      @CustomResponse()
      public async customResponseMethod() {
        return "Custom response";
      }
    }

    const instance = new NonControllerClass();
    await expect(instance.customResponseMethod()).rejects.toThrow(
      "@CustomResponse decorator can only be used on methods within a class decorated with @Controller. Error on method: customResponseMethod",
    );
  });
});
