const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
	try {
		const test = core.getInput("test");
		console.log(process.env);
		// const jokeBody = core.getInput("joke");
		// const token = core.getInput("repo-token");
		//
		// const octokit = github.getOctokit(token);
		//
		// const newIssue = await octokit.issues.create({
		// 	repo: github.context.repo.repo,
		// 	owner: github.context.repo.owner,
		// 	title: issueTitle,
		// 	body: jokeBody
		// });
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
