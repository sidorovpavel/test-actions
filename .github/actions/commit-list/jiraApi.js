const moment = require('moment');
const { mapIssue, mapIssueType } = require('./utils');
const JiraFetch = require('./jiraFetch');

class JiraApi {
  #jiraFetch
  constructor(domain, user, token) {
    this.#jiraFetch = new JiraFetch(domain, user, token);
  }

  getIssueType = () => this.#jiraFetch.getRequest('issuetype').then(mapIssueType);

  getIssue = (id) => this.#jiraFetch.getRequest(`issue/${id}/?fields=issuetype,summary,fixVersions`).then(mapIssue);

  getProjectId = (projectName) => this.#jiraFetch.getRequest(`project/${projectName}`).then(({ id }) => id);

  findProjectVersionByName = (projectName, version) =>
    this.#jiraFetch.getRequest(`project/${projectName}/versions`)
      .then((response) => response.find((item) => item.name === version));

  createVersion = (projectId, version) => this.#jiraFetch.setRequest('version',
      `{"archived": false,"releaseDate": ${moment().format('YYYY-MM-DD')},"name": "${version}","projectId": ${projectId},"released": true}`);

  issueSetVersion = ({ key }, { id }) => this.#jiraFetch.setRequest(`issue/${key}`,
      `{ "update": { "fixVersions": [ { "set": [ { "id": "${id}" } ] } ] } }`,
      true);
}

module.exports = JiraApi;
