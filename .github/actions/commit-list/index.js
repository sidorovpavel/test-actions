const core = require("@actions/core");
const github = require("@actions/github");
const connectJira = require("./jira");
const reduceIssues = require("./reduceIssues");

async function run() {
	try {
		const token = core.getInput("repo-token");
		const domain = core.getInput("jira-domain");
		const user = core.getInput("jira-user");
		const pass = core.getInput("jira-token");
		const projectName = core.getInput("project-name");
		const releaseVersion = core.getInput("release-version");

		const { repository, pull_request } = github.context.payload;
		const octokit = github.getOctokit(token);

		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number
		});

		const issues = response.data.reduce(reduceIssues, []);

		JSON.stringify(issues)

		const jira = connectJira(domain, user, pass, projectName);

		const jiraIssues = await jira.getIssues(issues);

		const comment = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number,
		})

		console.log(comment);

		await jira.setVersionToIssues(releaseVersion, jiraIssues);
	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
