import neatCsv from "neat-csv";
import { type Subtask } from "../utils/questions";

interface SubtaskRow {
  ID: string;
  Title: string;
  Notes: string;
  "Due Date": string;
  Completed: string;
  Color: string;
  Delegate: string;
  Location: string;
  Project: string;
  "Depends From": string;
  Tags: string;
}

export const parseCsv = async (path: string): Promise<Subtask[]> => {
  const csvStr = await Bun.file(path).text();

  const subtasks: Subtask[] = (await neatCsv<SubtaskRow>(csvStr)).map((r) => ({
    name: r.Title,
    // '1 2 3'
    blockedBy: r["Depends From"]
      .split(" ")
      .filter(Boolean)
      // taskheat tasks are 1-indexed
      .map((d) => parseInt(d) - 1),
    description: r.Notes || undefined,
  }));

  return subtasks;
};
