// doesn't work with bun yet, https://github.com/oven-sh/bun/issues/4787

import {
  LABEL_IDS,
  createBlockRecords,
  setup,
  type BlockRecord,
} from "./linear";
import { startProgressBar } from "./progressBar";
import { ask, askSubtasks } from "./questions";

const { createIssue, createBlockingRelationships, askComponent } =
  await setup();

const initiativeTitle = await ask("What's the initiative called?");
const componentId = await askComponent();
const labels = [componentId].filter(Boolean);

const initiativeId = await createIssue(
  initiativeTitle,
  [...labels, LABEL_IDS.initiative].filter(Boolean)
);

const subtasks = await askSubtasks();

const issueCreationProgress = startProgressBar(
  "Creating subtasks",
  subtasks.length
);
const subtaskIds = await Promise.all(
  subtasks.map(async ({ name }) => {
    const id = await createIssue(name, labels, { parentId: initiativeId });
    issueCreationProgress.increment();
    return id;
  })
);
issueCreationProgress.stop();

const blocks: BlockRecord[] = [...subtasks.entries()]
  // iterate subtasks and their indexes
  .map(([index, { blockedBy }]) =>
    // if there are blockers
    blockedBy.length > 0
      ? // register each
        createBlockRecords(
          blockedBy.map((i) => subtaskIds[i]),
          subtaskIds[index]
        )
      : []
  )
  // flatten 1 level
  .flat();

await createBlockingRelationships(blocks);

console.log(`done! Created "${initiativeTitle}" and its subtasks + blockers.`);
