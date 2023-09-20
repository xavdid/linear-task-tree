// doesn't work with bun yet, https://github.com/oven-sh/bun/issues/4787

import { checkbox, confirm, input, select } from "@inquirer/prompts";
import { LinearClient, LinearDocument } from "@linear/sdk";

// this gets baked in at compile time
if (!process.env.LINEAR_API_KEY) {
  throw new Error("expected `LINEAR_API_KEY to be defined in environment");
}

// static ids for my team
const INITIATIVE_LABEL_UUID = "5168e61c-b1df-48c8-a7d7-e11670ef2a97";

const STATE_CHOICES = [
  { name: "Todo", value: "d63d145b-7346-4e63-a53f-8d5f7e9a1364" },
  { name: "Soonish", value: "e3ff2360-e51c-4299-8b37-73efc10736ff" },
  { name: "Someday", value: "aafce9df-bda1-4fd0-8ffc-74775471d2d0" },
];

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

const teams = await linear.teams();
const teamId = teams.nodes[0].id;

const components = (
  await linear.issueLabels({
    filter: { parent: { name: { eq: "Component" } } },
  })
).nodes.map((l) => ({ value: l.id, name: l.name }));

components.sort((a, b) => (a.name > b.name ? 1 : -1)); // might be able to use `.toSorted` w/ bun directly; supported in node 20

const componentId = await select({
  message: "Which component?",
  choices: components,
});

const initiativeTitle = await input({
  message: "What's the initiative called?",
});

const stateId = await select({
  message: "Which state should everything be in?",
  choices: STATE_CHOICES,
});

const childTasks: Array<{ name: string; blockedBy: number[] }> = [];

do {
  console.log();
  const name = await input({ message: "What's a subtask?" });
  let blockedBy: number[] = [];
  if (childTasks.length > 0) {
    blockedBy = await checkbox({
      message: "Is this blocked by any previous tasks?",
      choices: childTasks.map((t, index) => ({
        name: t.name,
        value: index,
      })),
    });
  }
  childTasks.push({ name, blockedBy });
} while (await confirm({ message: "Add more?" }));

const createIssue = async (
  title: string,
  labelIds: string[],
  parentId?: string
): Promise<string> => {
  const task = await linear.createIssue({
    title,
    labelIds,
    teamId,
    parentId,
    stateId,
  });
  const issue = await task.issue;
  if (!issue) {
    throw new Error(`failed to create task "${title}"`);
  }
  return issue.id;
};

const parentId = await createIssue(initiativeTitle, [
  componentId,
  INITIATIVE_LABEL_UUID,
]);

const childIds = await Promise.all(
  childTasks.map(async ({ name }) => {
    const id = await createIssue(name, [componentId], parentId);

    return id;
  })
);

type Block = [blocker: string, blocked: string];

const createBlocks = async (blocks: Block[]): Promise<unknown> => {
  return await Promise.allSettled(
    blocks.map(async ([blocker, blocked]) => {
      await linear.createIssueRelation({
        issueId: blocker,
        type: LinearDocument.IssueRelationType.Blocks,
        relatedIssueId: blocked,
      });
    })
  );
};

const createBlockRecords = (blockers: string[], blocked: string): Block[] =>
  blockers.map((blocker) => [blocker, blocked]);

const blocks: Block[] = [
  // all children block parent
  ...createBlockRecords(childIds, parentId),
  // register any manual blockers
  ...[...childTasks.entries()]
    .map(([index, { blockedBy }]) =>
      blockedBy.length > 0
        ? createBlockRecords(
            blockedBy.map((i) => childIds[i]),
            childIds[index]
          )
        : []
    )
    .flat(),
];

await createBlocks(blocks);
