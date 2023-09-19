# linear-task-tree

A script to create a parent task and many subtasks in [Linear](https://linear.app/).

> note: Currently hardcodes data about my workspace, so it won't be widely useful yet.

## Motivation

Setting up my preferred dependent task setup took too many clicks in the UI, so I condensed it into a more refined script. I described that setup briefly to Linear support as follows:

---

My big needs for a project / epic are to:

1. be able to mark an issue as part of a larger initiative
2. See progress on the initiative (preferably as a `done/total` or a visual indicator)
3. Apply a component label to the project and everything under it, so I can tie work back to a specific codebase

I don't care about:

- which teams(s) are assigned (I use this as a solo dev)
- who the lead is (it's always me!)
- start/end dates (would love "hide until" dates for individual tasks, but don't need it for project-level things)

My main view is "Active issues", which shows tasks in todo / in progress / blocked. When I use parent issues, I can see more of the title on the sub issues and there's more relevant data on the task:

![](https://cdn.zappy.app/e056a4a78556ecaf0f4fdfc2f3534ebe.png)

Also, I can make a view for my parent issues and see them all (and their progress / status) in a single place:

![](https://cdn.zappy.app/ecfaf2c6e4e61afc588e9548ed263d12.png)

the projects view is much less useful:

![](https://cdn.zappy.app/604c7da488b4338bd92b5fd418d7ff99.png)

So I get nearly everything I need from parent issues, except for having to check their status and manually start/close them when their children are done.

## Development:

> note: this doesn't actually work with bun yet; ignore the following for now

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
