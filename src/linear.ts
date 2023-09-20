import { LinearClient } from "@linear/sdk";
import { getStateId } from "./questions";

const _createIssue = async (
  linear: LinearClient,
  stateId: string,
  title: string,
  labelIds: string[],
  parentId?: string
): Promise<string> => {
  const task = await linear.createIssue({
    title,
    labelIds,
    parentId,
    stateId,
    teamId: "ef1f6c06-ac0f-4907-ae49-9d0a3352d2a0",
  });
  const issue = await task.issue;
  if (!issue) {
    throw new Error(`failed to create task "${title}"`);
  }
  return issue.id;
};

/**
 * generate a `linear` instance and bind some variables for a more ergonomic `createIssue` function
 */
export const setup = async (): Promise<{
  linear: LinearClient;
  createIssue: (
    title: string,
    labelIds: string[],
    parentId?: string
  ) => Promise<string>;
}> => {
  // this gets baked in at compile time
  if (!process.env.LINEAR_API_KEY) {
    throw new Error("expected `LINEAR_API_KEY to be defined in environment");
  }
  const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

  // my linear team

  // all tasks are put into this state
  const stateId = await getStateId();

  const createIssue = _createIssue.bind(null, linear, stateId);

  return { linear, createIssue };
};
