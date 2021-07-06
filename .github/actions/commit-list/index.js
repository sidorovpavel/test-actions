import {reduceIssues} from "./utils";

const core = require("@actions/core");
const github = require("@actions/github");
const connectJira = require("./jira");

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
		const jiraIssues = new Map();
		issues.forEach(key => {
			const issue = jira.getIssue(key);
			jiraIssues.set(key, issue);
		});



	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
