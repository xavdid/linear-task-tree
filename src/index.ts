// doesn't work with bun yet, https://github.com/oven-sh/bun/issues/4787

import { LinearDocument } from "@linear/sdk";
import { Presets, SingleBar } from "cli-progress";
import { setup } from "./linear";
import { ask, askComponent, askSubtasks } from "./questions";

type BlockRecord = [blocker: string, blocked: string];

const createBlockRecords = (
  blockers: string[],
  blocked: string
): BlockRecord[] => blockers.map((blocker) => [blocker, blocked]);

const startProgressBar = (title: string, size: number): SingleBar => {
  const progressBar = new SingleBar(
    {
      format: `${title} | {bar} | {percentage}%`,
    },
    Presets.shades_classic
  );
  progressBar.start(size, 0);
  return progressBar;
};

const main = async (): Promise<void> => {
  const { linear, createIssue } = await setup();

  const initiativeTitle = await ask("What's the initiative called?");
  const componentId = await askComponent(linear);
  const labels = [componentId].filter(Boolean);

  const initiativeId = await createIssue(
    initiativeTitle,
    [
      ...labels,
      // `Initiative` label
      "5168e61c-b1df-48c8-a7d7-e11670ef2a97",
    ].filter(Boolean)
  );

  const subtasks = await askSubtasks();

  const issueCreationProgress = startProgressBar(
    "Creating subtasks",
    subtasks.length
  );
  const subtaskIds = await Promise.all(
    subtasks.map(async ({ name }) => {
      const id = await createIssue(name, labels, initiativeId);
      issueCreationProgress.increment();
      return id;
    })
  );
  issueCreationProgress.stop();

  const blocks: BlockRecord[] = [
    // all children block parent
    ...createBlockRecords(subtaskIds, initiativeId),
    // register any manual blockers
    ...[...subtasks.entries()]
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
      .flat(),
  ];

  const blockerProgress = startProgressBar("Creating blockers", blocks.length);
  await Promise.allSettled(
    blocks.map(async ([blocker, blocked]) => {
      await linear.createIssueRelation({
        issueId: blocker,
        type: LinearDocument.IssueRelationType.Blocks,
        relatedIssueId: blocked,
      });
      blockerProgress.increment();
    })
  );
  blockerProgress.stop();

  console.log(
    `done! Created "${initiativeTitle}" and its subtasks + blockers.`
  );
};

main().catch(console.error);
