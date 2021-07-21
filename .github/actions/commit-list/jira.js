const jiraApi = require('./jiraApi');

function jira(domain, user, token, projectName) {
  const api = jiraApi(domain, user, token);

  return {
    getIssues: async (arr) => {
      const [types, ...issues] = await Promise.all([
        api.getIssueType(),
        ...arr.map(async (item) => api.getIssue(item)),
      ]);

      const sortArray = ['Bug', 'Improvement', 'New feature'];

      return issues
        .map((item) => ({ ...item, issueType: types.get(item.issueTypeId).name, url: `https://${domain}.atlassian.net/browse/${item.key}` }))
        .filter((item) => item.issueType.toLowerCase() !== 'bug' || !item.existFixVersions)
        .sort((a, b) => sortArray.indexOf(b.issueType) - sortArray.indexOf(a.issueType));
    },

    setVersionToIssues: async (versionName, issues) => {
      let version = await api.findProjectVersionByName(projectName, versionName);
      if (!version) {
        const projectId = await api.getProjectId(projectName);
        version = await api.createVersion(projectId, versionName);
      }
      await Promise.all([
        ...issues.map(async (item) => api.issueSetVersion(item, version)),
      ]);
    },
  };
}

module.exports = jira;
