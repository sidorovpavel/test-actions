import { getInput, setFailed } from '@actions/core';
import jiraApi from './jira';
import githubApi from './github';
import { mapComment } from './utils';

async function run() {
	try {
		const githubToken = getInput('github-token', { required: true });
		const githubEmail = getInput('github-email', { required: true });
		const githubUser = getInput('github-user', { required: false });
		const domain = getInput('jira-domain', { required: true });
		const user = getInput('jira-user', { required: true });
		const token = getInput('jira-token', { required: true });
		const projectName = getInput('project-name', { required: true });
		const releaseVersion = getInput('release-version', { required: true });

		const defaultIssues = getInput('issues', { required: false });

		const github = githubApi(githubToken, githubEmail, githubUser);
		const jira = jiraApi(domain, user, token, projectName);

		const issues = defaultIssues ? JSON.parse(defaultIssues) : await github.getIssues();

		const jiraIssues = await jira.getIssues(issues);
		const commentText = jiraIssues.map(mapComment).join('\r\n');

		await Promise.all([
			github.createComment(commentText),
			github.createOrUpdateFileContents(releaseVersion, commentText),
			jira.setVersionToIssues(releaseVersion, jiraIssues),
		]);
	} catch (err) {
		setFailed(err.message);
	}
}

run();
