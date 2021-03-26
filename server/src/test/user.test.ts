const supertest = require("supertest");
import * as userController from "../controllers/user";
import * as app from "../app";

const request = supertest(app);

it("Checking Add User Method", async (done) => {
  const res = await request.put("/addUser");
  expect(res.body.message).toBe("User added to Database!");
  done();
});

// it("Checks if resume is made active", async (done) => {
//   const res = await request.get("/user");
//   expect(res.body.message).toBe("Resume made active!");
//   done();
// });
