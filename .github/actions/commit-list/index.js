const core = require("@actions/core");
const github = require("@actions/github");
const getIssue = require("./issue");

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

		// const messages = response.data.map();
		const jira_matcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;
		const issues = response.data.reduce((issues, item) => {
			const names = item.commit.message.split("").reverse().join("").match(jira_matcher);
			names.forEach(res => {
				const id = res.split("").reverse().join("");
				if(issues.indexOf(id)===-1) {
					issues.push(id)
				}
			})
			return issues;
		}, []);
		console.log(issues);

		const domain = core.getInput("jira-domain");
		const d = await getIssue(domain, issues[0]);
		console.log(d);
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
