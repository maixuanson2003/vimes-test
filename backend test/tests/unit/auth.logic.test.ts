import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({findOne:vi.fn(),save:vi.fn(),create:vi.fn((x)=>x),existsBy:vi.fn(),find:vi.fn(),verify:vi.fn(),hash:vi.fn(),token:vi.fn()}));
vi.mock("../../src/config/env.js",()=>({env:{ADMIN_EMAIL:"admin@vimes.local",ADMIN_NAME:"Admin",ADMIN_PASSWORD:"Admin@123",SEED_USER_PASSWORD:"User@123456",JWT_EXPIRES_IN_SECONDS:3600}}));
vi.mock("../../src/config/database.js",()=>({AppDataSource:{getRepository:()=>({findOne:mocks.findOne,save:mocks.save,create:mocks.create,existsBy:mocks.existsBy,find:mocks.find})}}));
vi.mock("../../src/shared/security/password.js",()=>({verifyPassword:mocks.verify,hashPassword:mocks.hash}));
vi.mock("../../src/shared/security/token.js",()=>({createAccessToken:mocks.token}));
import { AuthLogic } from "../../src/modules/logic/auth.logic.js";
import { UserRole } from "../../src/modules/models/user.entity.js";
describe("AuthLogic",()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.hash.mockResolvedValue("hash");mocks.token.mockReturnValue("token");});
 it("logs in an active user",async()=>{mocks.findOne.mockResolvedValue({id:1,email:"admin@vimes.local",name:"Admin",role:UserRole.ADMIN,isActive:true,passwordHash:"hash"});mocks.verify.mockResolvedValue(true);await expect(new AuthLogic().login("ADMIN@vimes.local","password")).resolves.toMatchObject({accessToken:"token",expiresIn:3600,user:{id:1}});});
 it("rejects invalid credentials",async()=>{mocks.findOne.mockResolvedValue(null);await expect(new AuthLogic().login("none@vimes.local","password")).rejects.toMatchObject({statusCode:401,code:"INVALID_CREDENTIALS"});});
 it("returns a public active user and rejects missing user",async()=>{mocks.findOne.mockResolvedValueOnce({id:2,email:"u@x.com",name:"U",role:UserRole.USER,isActive:true}).mockResolvedValueOnce(null);await expect(new AuthLogic().findPublicUser(2)).resolves.toEqual({id:2,email:"u@x.com",name:"U",role:UserRole.USER});await expect(new AuthLogic().findPublicUser(9)).rejects.toMatchObject({code:"INVALID_USER"});});
 it("creates the bootstrap admin only when missing",async()=>{mocks.findOne.mockResolvedValue(null);mocks.save.mockImplementation(async(x)=>x);await new AuthLogic().bootstrapAdmin();expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({email:"admin@vimes.local",role:UserRole.ADMIN,passwordHash:"hash"}));mocks.save.mockClear();mocks.findOne.mockResolvedValue({id:1});await new AuthLogic().bootstrapAdmin();expect(mocks.save).not.toHaveBeenCalled();});
 it("seeds only missing role users",async()=>{mocks.find.mockResolvedValue([{email:"user@vimes.local"}]);mocks.save.mockImplementation(async(x)=>x);await new AuthLogic().bootstrapRoleUsers();expect(mocks.save).toHaveBeenCalledTimes(3);const saved=mocks.save.mock.calls.map(([user])=>user.role);expect(saved).toContain(UserRole.STOREKEEPER);expect(saved).toContain(UserRole.CHIEF_ACCOUNTANT);});
});
