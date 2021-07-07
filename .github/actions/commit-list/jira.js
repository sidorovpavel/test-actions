const request = require("request-promise");

function connectJira(domain, user, token, projectName) {
	const body = (command, isAgile = true) => {
		return {
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/api/3/${command}`,
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
		}
	};
}

module.exports = connectJira;
