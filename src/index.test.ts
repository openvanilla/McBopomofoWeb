import { InputController, Service } from "./index";
import { InputController as DirectInputController } from "./McBopomofo/InputController";
import { Service as DirectService } from "./McBopomofo/Service";

describe("root index exports", () => {
  test("re-exports InputController", () => {
    expect(InputController).toBe(DirectInputController);
  });

  test("re-exports Service", () => {
    expect(Service).toBe(DirectService);
  });
});
