const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
	try {
		const token = core.getInput("repo-token");

		const { repository, pull_request } = github.context.payload;

		const octokit = github.getOctokit(token);

		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number
		});

		console.log(response.data);
		console.log(response.data[0].commit);

		// octokit.request

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
