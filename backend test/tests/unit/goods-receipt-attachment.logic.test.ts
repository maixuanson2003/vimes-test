import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({attachment:{find:vi.fn(),findOneBy:vi.fn(),create:vi.fn((x)=>x),save:vi.fn(),remove:vi.fn()},receipt:{existsBy:vi.fn()},mkdir:vi.fn(),writeFile:vi.fn(),unlink:vi.fn()}));
vi.mock("../../src/config/env.js",()=>({env:{UPLOAD_DIR:"uploads"}}));
vi.mock("node:crypto",()=>({randomUUID:()=>"uuid"}));
vi.mock("node:fs/promises",()=>({mkdir:mocks.mkdir,writeFile:mocks.writeFile,unlink:mocks.unlink}));
vi.mock("../../src/config/database.js",()=>({AppDataSource:{getRepository:(entity:{name:string})=>entity.name==="GoodsReceiptAttachment"?mocks.attachment:mocks.receipt}}));
import { GoodsReceiptAttachmentLogic } from "../../src/modules/logic/goods-receipt-attachment.logic.js";
describe("GoodsReceiptAttachmentLogic",()=>{
 beforeEach(()=>{vi.clearAllMocks();mocks.unlink.mockResolvedValue(undefined);});
 it("lists attachments newest first",async()=>{mocks.attachment.find.mockResolvedValue([{id:1}]);await expect(new GoodsReceiptAttachmentLogic().list(2)).resolves.toEqual([{id:1}]);expect(mocks.attachment.find).toHaveBeenCalledWith({where:{receiptId:2},order:{createdAt:"DESC"}});});
 it("uploads a supported file",async()=>{mocks.receipt.existsBy.mockResolvedValue(true);mocks.attachment.save.mockImplementation(async(x)=>({...x,id:1}));const result=await new GoodsReceiptAttachmentLogic().upload(2,"invoice.pdf","application/pdf",Buffer.from("pdf"));expect(result).toMatchObject({id:1,receiptId:2,storedName:"uuid.pdf",size:3});expect(mocks.writeFile).toHaveBeenCalled();});
 it("rejects missing receipt, invalid extension and empty content",async()=>{mocks.receipt.existsBy.mockResolvedValue(false);await expect(new GoodsReceiptAttachmentLogic().upload(9,"a.pdf","application/pdf",Buffer.from("x"))).rejects.toMatchObject({statusCode:404});mocks.receipt.existsBy.mockResolvedValue(true);await expect(new GoodsReceiptAttachmentLogic().upload(1,"a.exe","",Buffer.from("x"))).rejects.toMatchObject({code:"INVALID_ATTACHMENT_TYPE"});await expect(new GoodsReceiptAttachmentLogic().upload(1,"a.pdf","",Buffer.alloc(0))).rejects.toMatchObject({code:"EMPTY_ATTACHMENT"});});
 it("gets and deletes an attachment",async()=>{const attachment={id:3,receiptId:2,storedName:"uuid.pdf"};mocks.attachment.findOneBy.mockResolvedValue(attachment);const logic=new GoodsReceiptAttachmentLogic();await expect(logic.get(2,3)).resolves.toMatchObject({attachment});await logic.delete(2,3);expect(mocks.attachment.remove).toHaveBeenCalledWith(attachment);expect(mocks.unlink).toHaveBeenCalled();});
 it("returns 404 for an unknown attachment",async()=>{mocks.attachment.findOneBy.mockResolvedValue(null);await expect(new GoodsReceiptAttachmentLogic().get(2,99)).rejects.toMatchObject({statusCode:404});});
});
