// doesn't work with bun yet, https://github.com/oven-sh/bun/issues/4787

import { LinearDocument } from "@linear/sdk";
import { setup } from "./linear";
import { ask, askComponent, askSubtasks } from "./questions";

type BlockRecord = [blocker: string, blocked: string];

const createBlockRecords = (
  blockers: string[],
  blocked: string
): BlockRecord[] => blockers.map((blocker) => [blocker, blocked]);

const main = async (): Promise<void> => {
  const { linear, createIssue } = await setup();

  const initiativeTitle = await ask("What's the initiative called?");
  const componentId = await askComponent(linear);

  const parentId = await createIssue(initiativeTitle, [
    componentId,
    // `Initiative` label
    "5168e61c-b1df-48c8-a7d7-e11670ef2a97",
  ]);

  const subtasks = await askSubtasks();
  const subtaskIds = await Promise.all(
    subtasks.map(
      async ({ name }) => await createIssue(name, [componentId], parentId)
    )
  );

  const blocks: BlockRecord[] = [
    // all children block parent
    ...createBlockRecords(subtaskIds, parentId),
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

  await Promise.allSettled(
    blocks.map(async ([blocker, blocked]) => {
      await linear.createIssueRelation({
        issueId: blocker,
        type: LinearDocument.IssueRelationType.Blocks,
        relatedIssueId: blocked,
      });
    })
  );
};

main().catch(console.error);
