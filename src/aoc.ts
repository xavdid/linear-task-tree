// create my preferred AoC structure

import { LABEL_IDS, setup, type BlockRecord } from "./linear";
import { startProgressBar } from "./progressBar";
import { confirm } from "./questions";

const year = new Date().getFullYear().toString();

if (
  !(await confirm(`Creating full AoC structure for ${year}. Proceed?`, false))
) {
  process.exit(1);
}
console.log("pro-ceedin'!");

// "todo" state id
const { createIssue, createBlockingRelationships } = await setup(
  "d63d145b-7346-4e63-a53f-8d5f7e9a1364"
);

const rootId = await createIssue(`Advent of Code ${year}`, [
  LABEL_IDS.initiative,
  LABEL_IDS.adventOfCode,
]);

const blocks: BlockRecord[] = [];
const tasksProgress = startProgressBar("Creating Tasks", 125);
for (let day = 1; day <= 25; day++) {
  const dayId = await createIssue(
    `Day ${day}`,
    [LABEL_IDS.initiative, LABEL_IDS.adventOfCode],
    { parentId: rootId }
  );
  tasksProgress.increment();

  const [part1, part1Writeup, part2, part2Writeup] = await Promise.all(
    ["Part 1", "Part 1 Writeup", "Part 2", "Part 2 Writeup"].map(
      async (name) => {
        const id = await createIssue(name, [LABEL_IDS.adventOfCode], {
          parentId: dayId,
          dueDate: `${year}-12-${day.toString().padStart(2, "0")}`,
        });
        tasksProgress.increment();
        return id;
      }
    )
  );

  blocks.push([part1, part1Writeup]);
  blocks.push([part1, part2]);
  blocks.push([part2, part2Writeup]);
  blocks.push([part1Writeup, part2Writeup]);
}
tasksProgress.stop();

await createBlockingRelationships(blocks);
console.log(`Done! Enjoy Advent of Code ${year}.`);
