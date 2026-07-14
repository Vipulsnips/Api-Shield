const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  test("GET / should return API message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("APIShield API is running");
  });
  test("POST /api/auth/signup should create a user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.token).toBeDefined();
  });
  test("POST /api/auth/login should login existing user", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "vipul@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });
  test("POST /api/auth/login with wrong password", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "vipul@test.com",
      password: "123",
    });
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });
  test("POST /api/auth/login with non-existing email", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "abc@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });
  test("POST /api/auth/signup should not allow duplicate email", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("User already exists");
  });
  test("Get /api/auth/me should show user details", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Vipul",
      email: "vipul@test.com",
      password: "password123",
    });
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "vipul@test.com",
      password: "password123",
    });
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginResponse.body.token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.user.email).toBe("vipul@test.com");
    expect(response.body.user.role).toBe("user");
  });
  test("GET /api/auth/me with invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.statusCode).toBe(401);
  });
});
