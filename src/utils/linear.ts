import { LinearClient, LinearDocument } from "@linear/sdk";
import { startProgressBar } from "./progressBar";
import { askComponent as _askComponent, getStateId } from "./questions";

export const LABEL_IDS = {
  initiative: "5168e61c-b1df-48c8-a7d7-e11670ef2a97",
  adventOfCode: "6bc9897f-d00d-46c9-be21-feeadaf1b076",
};

const _createIssue = async (
  linear: LinearClient,
  stateId: string,
  title: string,
  labelIds: string[],
  {
    parentId,
    dueDate,
    description,
  }: { parentId?: string; dueDate?: string; description?: string } = {}
): Promise<string> => {
  const task = await linear.createIssue({
    title,
    labelIds,
    parentId,
    stateId,
    teamId: "ef1f6c06-ac0f-4907-ae49-9d0a3352d2a0",
    dueDate,
    description,
  });
  const issue = await task.issue;
  if (!issue) {
    throw new Error(`failed to create task "${title}"`);
  }
  return issue.id;
};

const _createBlockingRelationships = async (
  linear: LinearClient,
  blocks: BlockRecord[]
): Promise<void> => {
  const progress = startProgressBar("Creating blockers", blocks.length);

  await Promise.allSettled(
    blocks.map(async ([blocker, blocked]) => {
      await linear.createIssueRelation({
        issueId: blocker,
        type: LinearDocument.IssueRelationType.Blocks,
        relatedIssueId: blocked,
      });
      progress.increment();
    })
  );

  progress.stop();
};

/**
 * generate a `linear` instance and bind some variables for a more ergonomic `createIssue` function
 */
export const setup = async (
  stateId?: string
): Promise<{
  createIssue: (
    title: string,
    labelIds: string[],
    options?: { parentId?: string; dueDate?: string; description?: string }
  ) => Promise<string>;
  createBlockingRelationships: (blocks: BlockRecord[]) => Promise<void>;
  askComponent: () => Promise<string>;
}> => {
  // this gets baked in at compile time
  if (!process.env.LINEAR_API_KEY) {
    throw new Error("expected `LINEAR_API_KEY to be defined in environment");
  }
  const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

  // all tasks are put into this state
  if (!stateId) {
    stateId = await getStateId();
  }

  const createIssue = _createIssue.bind(null, linear, stateId);

  const createBlockingRelationships = _createBlockingRelationships.bind(
    null,
    linear
  );

  const askComponent = _askComponent.bind(null, linear);

  return { createIssue, createBlockingRelationships, askComponent };
};

export type BlockRecord = [blocker: string, blocked: string];

/**
 * given a number of blockers for a single task, create a list of pairs describing the blocker => blocked relationship
 */
export const createBlockRecords = (
  blockers: string[],
  blocked: string
): BlockRecord[] => blockers.map((blocker) => [blocker, blocked]);
