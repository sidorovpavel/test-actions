const { context, getOctokit } =  require('@actions/github');
const { reduceIssues } = require('./utils');

const githubApi = (githubToken, githubEmail, githubUser) => {
  const { repo: { owner, repo }, issue: { number: pullNumber } } = context;

  const { rest } = getOctokit(githubToken);

  return {
    getIssues: async () => {
      console.log({
        owner,
        repo,
        pull_number: pullNumber,
      });

      console.log(rest);

      const response = await rest.pulls.listCommits({
        owner,
        repo,
        pull_number: pullNumber,
      });

      return response.data.reduce(reduceIssues, []);
    },

    createComment: async (body) => rest.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    }),

    createOrUpdateFileContents: async (releaseVersion, content) => await rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `Version ${releaseVersion}.md`,
      message: `feat: Added Version ${releaseVersion}.md`,
      content: Buffer.from(content).toString('base64'),
      committer: {
        name: githubUser || owner,
        email: githubEmail,
      },
      author: {
        name: githubUser || owner,
        email: githubEmail,
      },
    }),
  };
};

module.exports = githubApi;
