const request = require("request-promise");

function connectJira(domain, user, token) {
	const body = (command, isAgile = true) => {
		return {
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/${isAgile ? 'agile/1.0' : 'api/2'}/${command}`,
			headers: {
				Accept: "application/json",
			},
			auth: {
				user,
				pass: token,
			},
			json: true
		}
	};
	let issueTypes = undefined;

	const mapIssue = async ({key, fields}) => {
		return {
			url: `https://${domain}.atlassian.net/browse/${key}`,
			key,
			issueType: fields.issuetype.id,
			summary: fields.summary,
			existFixVersions: fields.fixVersions.length > 0
		};
	};

	const mapIssueType = (response) => {
		const types = new Map();
		response.forEach(item => {
			const {name} = item;
			types.set(item.id, { name });
		});
		return types;
	}

	const getIssue = async (id) => {
		const response = await request(body(`issue/${id}/?fields=issuetype,summary,fixVersions`));
		return mapIssue(response);
	};

	const getIssueType = async () => {
		const types = await request(body('issuetype', false));
		return mapIssueType(types);
	};

	return {
		getIssues: async (arr) => {
			const typePromise = new Promise((resolve) => {
				const types = getIssueType();
				resolve(types);
			});

			const issuePromises = arr.map(async (item) => {
				return getIssue(item);
			});
			const [types, ...issues] = await Promise.all([typePromise, ...issuePromises]);
			const result = issues.reduce((acc, item) => {

			}, []);
      console.log(issues);
			return issues;
		}
	};
}

module.exports = connectJira;
