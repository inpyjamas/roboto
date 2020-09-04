// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/
import { Application } from "probot";
import { composeCreatePullRequest } from "octokit-plugin-create-pull-request";
import fs from "fs";
import path from "path";
const prBody = fs.readFileSync(
  path.resolve(__dirname, "../assets/pr-body.md"),
  "utf8"
);
const renovateJson = fs.readFileSync(
  path.resolve(__dirname, "../assets/renovate.json"),
  "utf8"
);
export = (app: Application) => {
  app.on("repository.created", async (context) => {
    const {
      payload: { repository },
      log,
    } = context;
    const configResponse = await context.github.repos.createOrUpdateFileContents(
      {
        owner: repository.owner.login,
        repo: repository.name,
        path: ".github/inpyjamas-roboto.config.yml",
        message: "init roboto config",
        content: Buffer.from("# hello world").toString("base64"),
      }
    );
    if (configResponse === null) return;
    log(configResponse);
    const response = await composeCreatePullRequest(context.github, {
      owner: repository.owner.login,
      repo: repository.name,
      title: "inpyjamas-roboto default configs",
      body: prBody,
      head: `chore/inpyjamas-roboto-onboard`,
      changes: {
        commit: "inpyjamas-roboto onboarding",

        files: {
          ".github/renovate.json": renovateJson,
          ".github/CODEOWNERS": `* @${repository.owner.login}`,
        },
      },
    });
    if (response === null) return;
    log(response);
  });
};
