import {
  LABEL_IDS,
  createBlockRecords,
  setup,
  type BlockRecord,
} from "../utils/linear";
import { startProgressBar } from "../utils/progressBar";
import { ask, askSubtasks, confirm, type Subtask } from "../utils/questions";

export default async (importedTasks?: Subtask[]): Promise<void> => {
  const { createIssue, createBlockingRelationships, askComponent } =
    await setup();
  const initiativeTitle = await ask("What's the initiative called?");
  const componentId = await askComponent();
  const labels = [componentId].filter(Boolean);

  // a list of tasks and the indexes by which they're blocked
  const subtasks = importedTasks ?? (await askSubtasks());

  if (
    importedTasks &&
    !(await confirm(
      `Found ${importedTasks.length} imported tasks. Proceed with creation?`,
      false
    ))
  ) {
    process.exitCode = 1;
    return;
  }

  const initiativeId = await createIssue(
    initiativeTitle,
    [...labels, LABEL_IDS.initiative].filter(Boolean)
  );

  const issueCreationProgress = startProgressBar(
    "Creating subtasks",
    subtasks.length
  );
  // the linear ID for each item in the array
  const subtaskIds = await Promise.all(
    subtasks.map(async ({ name, description }) => {
      const id = await createIssue(name, labels, {
        parentId: initiativeId,
        description,
      });
      issueCreationProgress.increment();
      return id;
    })
  );
  issueCreationProgress.stop();

  const blocks: BlockRecord[] = [...subtasks.entries()] // basically enumerate([])
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

  console.log(
    `done! Created "${initiativeTitle}" and its subtasks + blockers.`
  );
};
