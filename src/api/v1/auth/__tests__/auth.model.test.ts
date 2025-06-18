import "reflect-metadata";
import { UserModel } from "../auth.model";
import { UserState } from "../auth.states";

describe("UserModel.fromRecord", () => {
  it("maps all row fields correctly", () => {
    const row = {
      id: "user-id",
      username: "TestUser ",
      email: "TeSt@Example.com ",
      password: "hashed",
      email_verified: true,
      roles: [{ id: "role1", name: "admin", permissions: [] }],
      state: UserState.REGISTERED,
      created_at: new Date("2024-01-01T00:00:00Z"),
      updated_at: new Date("2024-01-02T00:00:00Z"),
    } as any;

    const user = UserModel.fromRecord(row);

    expect(user).toBeInstanceOf(UserModel);
    expect(user.id).toBe(row.id);
    expect(user.username).toBe(row.username.trim());
    expect(user.email).toBe(row.email.toLowerCase().trim());
    expect(user.password).toBe(row.password);
    expect(user.emailVerified).toBe(row.email_verified);
    expect(user.roles).toBe(row.roles);
    expect(user.state).toBe(row.state);
    expect(user.created_at).toEqual(row.created_at);
    expect(user.updated_at).toEqual(row.updated_at);
  });

  it("defaults roles to empty array when not provided", () => {
    const row = {
      id: "user-id",
      username: "Tester",
      email: "tester@example.com",
      password: "hashed",
      email_verified: false,
      state: UserState.NEW,
      created_at: new Date(),
      updated_at: new Date(),
    } as any;

    const user = UserModel.fromRecord(row);

    expect(user.roles).toEqual([]);
  });
});
