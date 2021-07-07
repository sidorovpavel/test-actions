const request = require("request-promise");

function connectJira(domain, user, token, projectName) {

 	const baseQuery = {
	  headers: {
		  Accept: "application/json",
	  },
	  auth: {
		  user,
		  pass: token,
	  },
	  json: true,
  }

  const getRequest = (command) => {
	  return {
		  method: "PUT",
		  uri: `https://${domain}.atlassian.net/rest/api/3/${command}`,
		  ...baseQuery,
	  }
	}

	const postRequest = (command, bodyData) => {
		return {
			method: "POST",
			uri: `https://${domain}.atlassian.net/rest/api/3/${command}`,
			body: bodyData,
			...baseQuery,
		}
	}

	const mapIssue = async ({key, fields}) => {
		return {
			url: `https://${domain}.atlassian.net/browse/${key}`,
			key,
			issueTypeId: fields.issuetype.id,
			summary: fields.summary,
			existFixVersions: fields.fixVersions.length > 0
		};
	};

	const mapIssueType = (response) => {
		const types = new Map();
		response.forEach(item => {
			const { untranslatedName: name} = item;
			types.set(item.id, { name });
		});
		return types;
	}

	const getIssue = async (id) => {
		const response = await request(getRequest(`issue/${id}/?fields=issuetype,summary,fixVersions`));
		return mapIssue(response);
	};

	const getIssueType = async () => {
		const types = await request(getRequest('issuetype'));
		return mapIssueType(types);
	};

	return {
		getIssues: async (arr) => {
			const typePromise = new Promise((resolve) => {
				const types = getIssueType();
				resolve(types);
			});

			let issuePromises = arr.map(async (item) => {
				return getIssue(item);
			});
			const [types, ...issues] = await Promise.all([typePromise, ...issuePromises]);

			const sortArray = ['Bug', 'Improvement', 'New feature'];

			return issues
				.map(item => {
					return { ...item, issueType: types.get(item.issueTypeId).name };
				})
				.filter(item => {
					return item.issueType.toLowerCase() !== 'bug' || !item.existFixVersions
				})
				.sort((a, b) => sortArray.indexOf(b.issueType) - sortArray.indexOf(a.issueType));
		},
		createVersion: async (project, version) => {
			const bodyData = `{
			  "archived": false,
			  "releaseDate": "2010-07-06",
			  "name": "New Version 1",
			  "description": "An excellent version",
			  "projectId": 10036,
			  "released": true
			}`;

			const res = await postRequest(`project/${project}`, bodyData);
			console.log(res);
			return res;
		}
	};
}

module.exports = connectJira;
