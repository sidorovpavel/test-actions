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

		const { repository, pull_request } = github.context.payload;
		const octokit = github.getOctokit(token);

		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number
		});

		const issues = response.data.reduce(reduceIssues, []);

		const jira = connectJira(domain, user, pass);
		console.log(jira);

		const issue = await jira.getIssue('MM-1');
		console.log(issue);
		//const jiraIssues = new Map();

		// for (const key of issues) {
		// 	console.log(key);
		// 	const issue = await jira.getIssue(key);
		// 	jiraIssues.set(key, issue);
		// }

	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
