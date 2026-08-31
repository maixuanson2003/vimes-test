import { describe, expect, it, vi } from "vitest";
import type { BaseRepository } from "../../src/modules/repositories/base.repository.js";
import { BaseLogic } from "../../src/modules/logic/base.logic.js";

type TestEntity = { id: number; name: string };

const createRepository = () =>
  ({
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }) as unknown as BaseRepository<TestEntity>;

describe("BaseLogic", () => {
  it("returns an entity by id", async () => {
    const repository = createRepository();
    vi.mocked(repository.findById).mockResolvedValue({ id: 1, name: "Test" });
    await expect(
      new BaseLogic(repository, "Test entity").findById(1),
    ).resolves.toEqual({ id: 1, name: "Test" });
  });

  it("throws 404 when an entity does not exist", async () => {
    const repository = createRepository();
    vi.mocked(repository.findById).mockResolvedValue(null);
    await expect(
      new BaseLogic(repository, "Test entity").findById(99),
    ).rejects.toMatchObject({ statusCode: 404, code: "ENTITY_NOT_FOUND" });
  });

  it("delegates create, update and delete to repository", async () => {
    const repository = createRepository();
    vi.mocked(repository.create).mockResolvedValue({ id: 1, name: "New" });
    vi.mocked(repository.update).mockResolvedValue({ id: 1, name: "Updated" });
    vi.mocked(repository.delete).mockResolvedValue(true);
    const logic = new BaseLogic(repository, "Test entity");
    await expect(logic.create({ name: "New" })).resolves.toMatchObject({
      name: "New",
    });
    await expect(logic.update(1, { name: "Updated" })).resolves.toMatchObject({
      name: "Updated",
    });
    await expect(logic.delete(1)).resolves.toBeUndefined();
  });
});
