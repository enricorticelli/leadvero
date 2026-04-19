import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import path from "path";

const template = path.resolve("electron/leadvero-template.db");

if (existsSync(template)) unlinkSync(template);

const env = { ...process.env, DATABASE_URL: `file:${template}` };

execSync("npx prisma db push --skip-generate", { stdio: "inherit", env });
execSync("tsx prisma/seed-admin.ts", { stdio: "inherit", env });

console.log(`Template DB created: ${template}`);
