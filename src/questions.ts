import { checkbox, confirm, input, select } from "@inquirer/prompts";
import type { LinearClient } from "@linear/sdk";

export const ask = async (message: string): Promise<string> => {
  return await input({ message });
};

const getComponents = async (
  linear: LinearClient
): Promise<Array<{ name: string; value: string }>> => {
  const labels = await linear.issueLabels({
    filter: { parent: { name: { eq: "Component" } } },
  });
  const components = labels.nodes.map((l) => ({ value: l.id, name: l.name }));

  components.sort((a, b) =>
    a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
  ); // might be able to use `.toSorted` w/ bun directly; supported in node 20

  return components;
};

/**
 * select which component label to use
 */
export const askComponent = async (linear: LinearClient): Promise<string> =>
  await select({
    message: "What component is it under?",
    choices: await getComponents(linear),
  });

// ---

const STATE_CHOICES = [
  { name: "Todo", value: "d63d145b-7346-4e63-a53f-8d5f7e9a1364" },
  { name: "Soonish", value: "e3ff2360-e51c-4299-8b37-73efc10736ff" },
  { name: "Someday", value: "aafce9df-bda1-4fd0-8ffc-74775471d2d0" },
];

/**
 * choose which state all tasks should start in (basically, do now or later)
 */
export const getStateId = async (): Promise<string> =>
  await select({
    message: "Which state should everything be in?",
    choices: STATE_CHOICES,
  });

// ---

/**
 * repeatedly get title of subtasks and note blockers
 */
export const askSubtasks = async (): Promise<
  Array<{ name: string; blockedBy: number[] }>
> => {
  const childTasks: Array<{ name: string; blockedBy: number[] }> = [];

  do {
    console.log();
    const name = await ask("What's a subtask?");
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

  return childTasks;
};
