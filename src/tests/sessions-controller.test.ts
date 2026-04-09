import request from "supertest"

import { prisma } from "@/database/prisma"
import { app } from "@/app"

describe("SessionsController", () => {
  let user_id: string

  afterAll(async () => {
    await prisma.user.delete({ where: { id: user_id }})
  })

  it("should authenticate a and get access token", async () => {
    const userResp = await request(app).post("/users").send({
      name: "auth test",
      email: "authtest@gmail.com",
      password: "123321123"
    })
    
    user_id = userResp.body.id

    const sessionsResp = await request(app).post("/sessions").send({
      email: "authtest@gmail.com",
      password: "123321123"
    })

    expect(sessionsResp.status).toBe(201)
    expect(sessionsResp.body.token).toEqual(expect.any(String))
  })
})