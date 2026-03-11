import { spawn } from "node:child_process";

const cypressArgs = process.argv.slice(2);
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const command = process.platform === "win32" ? "cypress.cmd" : "cypress";
const child = spawn(command, cypressArgs, {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
