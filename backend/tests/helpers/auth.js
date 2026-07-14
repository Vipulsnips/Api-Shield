const request = require("supertest");
const app = require("../../src/app");

async function createUserAndLogin(
  name = "Vipul",
  email = "vipul@test.com",
  password = "password123",
) {
  const user = {
    name,
    email,
    password,
  };

  await request(app).post("/api/auth/signup").send(user);

  const response = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  return response.body.token;
}

module.exports = createUserAndLogin;
