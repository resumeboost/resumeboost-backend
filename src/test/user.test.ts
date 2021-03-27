import request from "supertest";
import app from "../app";
import { User } from "../models/User";

describe("Test get all users method", () => {
  it("Should return all users in datanase", async () => {
    const result = await request(app).get("/user").send();

    expect(result.status).toBe(200);
    expect(result.body.length).toEqual(5); //Since there are currently 5 users in the mongo collection
  });
});

describe("Test putResumeActive Method", () => {
  it("Should make isActive true in collection", async () => {
    //Creating a new user for the test
    const user = await User.create({
      email: "testemail@gmail.com",
      password: "blablabalba",
      points: "5",
      targetCompanies: {
        name: "Test Company 1",
        industries: ["Test Industry"],
        logo: "test Logo",
      },
      targetPositions: ["Test position 1", "Test Position 2"],
      resumes: {
        link: "test link",
        createdAt: "03-26-2021",
        isActive: false,
      },
      createdAt: "03-26-2021",
    });

    const result = await request(app)
      .put("/resume/" + user._id + "/active")
      .send();

    expect(result.status).toBe(200);
    expect(result.body).toBe("Resume was made active");
  });
});
