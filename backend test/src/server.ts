import "reflect-metadata";
import { createApp } from "./app.js";
import { AppDataSource } from "./config/database.js";
import { env } from "./config/env.js";
import { AuthLogic } from "./modules/logic/auth.logic.js";
import { OrganizationBootstrapLogic } from "./modules/logic/organization-bootstrap.logic.js";

await AppDataSource.initialize();
await new AuthLogic().bootstrapAdmin();
await new AuthLogic().bootstrapRoleUsers();
await new OrganizationBootstrapLogic().bootstrap();

const server = createApp().listen(env.PORT, () => console.log(`API: http://localhost:${env.PORT}`));
const shutdown = () => server.close(async () => { await AppDataSource.destroy(); process.exit(0); });
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
