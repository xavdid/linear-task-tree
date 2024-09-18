import { program } from "@commander-js/extra-typings";
import addCmd from "./commands/add";
import aocCmd from "./commands/aoc";
import { parseCsv } from "./utils/taskheat";

program
  .name("linear-task-tree")
  .description("Create dependent trees of tasks in Linear")
  .version();

program
  .command("add")
  .description("add a new task tree under an initiative")
  .action(async () => {
    // gets a wrapper because it has optional args that i'm not passing here
    await addCmd();
  });
program
  .command("aoc")
  .description("build the whole AoC task tree for this calendar year")
  .action(aocCmd);
program
  .command("import")
  .argument("<path>", "the path to a TaskHeat CSV file")
  .description("import a project from TaskHeat")
  .action(async (path) => {
    const subtasks = await parseCsv(path);
    await addCmd(subtasks);
  });

await program.parseAsync();
