import { FSM, allow, buildTransitionMap } from "@utils/domain";

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

const transitions = buildTransitionMap(transitionsList);

describe("FSM", () => {
  let fsm: FSM<MachineState, MachineEvent>;

  beforeEach(() => {
    fsm = new FSM(MachineState.Idle, transitions);
  });

  it("returns the initial state", () => {
    expect(fsm.getState()).toBe(MachineState.Idle);
  });

  it("canTransition returns true for a valid transition", () => {
    expect(fsm.canTransition(MachineEvent.Start)).toBe(true);
  });

  it("canTransition returns false for an invalid transition", () => {
    expect(fsm.canTransition(MachineEvent.Stop)).toBe(false);
  });

  it("transitions to the next state when valid", () => {
    fsm.transition(MachineEvent.Start);
    expect(fsm.getState()).toBe(MachineState.Running);
  });

  it("throws an error for an invalid transition", () => {
    expect(() => fsm.transition(MachineEvent.Stop)).toThrow(
      `Invalid transition from ${MachineState.Idle} on ${MachineEvent.Stop}`,
    );
  });

  it("supports sequential transitions", () => {
    fsm.transition(MachineEvent.Start);
    expect(fsm.getState()).toBe(MachineState.Running);
    fsm.transition(MachineEvent.Stop);
    expect(fsm.getState()).toBe(MachineState.Idle);
  });
});
