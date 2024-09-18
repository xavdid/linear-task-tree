import { Presets, SingleBar } from "cli-progress";

export const startProgressBar = (title: string, size: number): SingleBar => {
  const progressBar = new SingleBar(
    {
      format: `${title} | {bar} | {percentage}%`,
    },
    Presets.shades_classic
  );
  progressBar.start(size, 0);
  return progressBar;
};
