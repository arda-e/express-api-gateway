import http from "k6/http";
import { check } from "k6";

interface User {
  username: string;
  email: string;
}

const users: User[] = require("./users.json");

export const options = {
  vus: 50,
  iterations: users.length,
};

export default function () {
  const user = users[__ITER];
  const payload = JSON.stringify({
    username: user.username,
    email: user.email,
    password: "Password123!",
  });

  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${__ENV.TARGET_URL}/api/v1/auth/register`, payload, params);
  check(res, { "status 201": (r) => r.status === 201 });
}
