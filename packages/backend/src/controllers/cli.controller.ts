// Controller for console commands
import readline from "readline";
import { stdin as input, stdout as output } from "node:process";
import { TeamService } from "../services/team.service";
import { LapService } from "../services/laps.service";

const commands = {
  fetchTeams: () => {
    console.log("Fetching teams...");
    return TeamService.getInstance().fetch();
  },
  syncLaps: () => {
    return LapService.getInstance().syncMissingLaps();
  },
  help: () => {
    console.log("Available commands:");
    Object.keys(commands).forEach(option => {
      console.log(`  ${option}`);
    });
  },
  exit: () => {
    process.exit();
  },
};

const rl = readline.createInterface({ input, output });
if (process.stdin.isTTY) process.stdin.setRawMode(true);

rl.on("line", (line: string) => {
  if (line in commands) {
    commands[line as keyof typeof commands]();
    return;
  }
  console.log(`Unknown command: ${line}`);
});

export default () => {};
