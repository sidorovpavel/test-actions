const moment = require('moment');
const { mapIssue, mapIssueType } = require('./utils');
const fetch = require('./jiraFetch');

const jiraApi = (domain, user, token) => {
  const { setRequest, getRequest } = fetch(domain, user, token);

  return {
    getIssueType: () => getRequest('issuetype').then(mapIssueType),
    getIssue: (id) => getRequest(`issue/${id}/?fields=issuetype,summary,fixVersions`).then(mapIssue),
    getProjectId: (projectName) => getRequest(`project/${projectName}`).then(({ id }) => id),
    findProjectVersionByName: (projectName, version) => getRequest(`project/${projectName}/versions`).then((response) => response.find((item) => item.name === version)),
    createVersion: (projectId, version) => setRequest('version',
      `{"archived": false,"releaseDate": ${moment().format('YYYY-MM-DD')},"name": "${version}","projectId": ${projectId},"released": true}`),
    issueSetVersion: ({ key }, { id }) => setRequest(`issue/${key}`,
      `{ "update": { "fixVersions": [ { "set": [ { "id": "${id}" } ] } ] } }`,
      true),
  };
};

module.exports = jiraApi;
