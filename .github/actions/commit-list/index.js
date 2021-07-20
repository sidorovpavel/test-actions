const core = require("@actions/core");
const github = require("@actions/github");
const connectJira = require("./jira_old");
const reduceIssues = require("./reduceIssues");

async function run() {
	try {
		const token = core.getInput("repo-token");
		const domain = core.getInput("jira-domain");
		const user = core.getInput("jira-user");
		const pass = core.getInput("jira-token");
		const projectName = core.getInput("project-name");
		const releaseVersion = core.getInput("release-version");

		console.log(github.context);

		console.log(github.context.payload);

		const {repository, pull_request} = github.context.payload;

		console.log(repository);

		console.log(pull_request);
		// const octokit = github.getOctokit(token);

		/*
		const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/commits', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number
		});

		const issues = response.data.reduce(reduceIssues, []);

		const jira = connectJira(domain, user, pass, projectName);



		const jiraIssues = await jira.getIssues(issues);
		const commentText = jiraIssues.map(({ issueType, key, uri, summary }) => `<${issueType}>${key}(${uri}) ${summary}`)
	.join('\r\n');

		const comment = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', {
			owner: repository.owner.login,
			repo: repository.name,
			pull_number: pull_request.number,
		})

		console.log(comment);

		await github.repos.createOrUpdateFileContents({
			owner: context.repo.owner,
			repo: context.repo.repo,
			path: "OUTPUT.md",
			message: "feat: Added OUTPUT.md programatically",
			content: Buffer.from(commentText).toString('base64'),
			committer: {
				name: "Octokit Bot",
				email: "sidorovpav@yandex.ru",
			},
			author: {
				name: context.repo.owner,
				email: "sidorovpav@yandex.ru",
			}});

*/

	} catch (err) {
		core.setFailed(err.message);
	}
}

run();
