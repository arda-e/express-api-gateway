import { allow, buildTransitionMap, chainableTransition } from "@utils/domain";

enum MachineState {
  Idle = "idle",
  Running = "running",
}

enum MachineEvent {
  Start = "START",
  Stop = "STOP",
}

const transitionsList = [
  allow(MachineState.Idle, MachineEvent.Start, MachineState.Running),
  allow(MachineState.Running, MachineEvent.Stop, MachineState.Idle),
] as const;

describe("Transition helpers", () => {
  it("allow returns a transition tuple", () => {
    const tuple = allow(MachineState.Idle, MachineEvent.Start, MachineState.Running);
    expect(tuple).toEqual([MachineState.Idle, MachineEvent.Start, MachineState.Running]);
  });

  it("buildTransitionMap constructs the correct map", () => {
    const map = buildTransitionMap(transitionsList);
    expect(map).toEqual({
      [MachineState.Idle]: { [MachineEvent.Start]: MachineState.Running },
      [MachineState.Running]: { [MachineEvent.Stop]: MachineState.Idle },
    });
  });

  it("chainableTransition executes the transition and returns the entity", () => {
    const entity = { transition: jest.fn() };
    const result = chainableTransition(entity, MachineEvent.Start);
    expect(entity.transition).toHaveBeenCalledWith(MachineEvent.Start);
    expect(result).toBe(entity);
  });
});
