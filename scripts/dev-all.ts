import { spawn } from "node:child_process";

function run(cmd: string, args: string[], label: string) {
  const proc = spawn(cmd, args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  proc.on("exit", (code) => {
    console.error(`[${label}] exited with code ${code}`);
    process.exit(code ?? 1);
  });
  return proc;
}

run("npm", ["run", "dev"], "next");
run("npm", ["run", "worker"], "worker");
