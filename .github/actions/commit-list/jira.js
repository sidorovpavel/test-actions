const request = require("request-promise");

async function connectJira(domain, user, token) {
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
		if (issueTypes === undefined) {
			issueTypes = await request(body('issuetypes', false));
			console.log(issueTypes);
		}
		return {
			url: `https://${domain}.atlassian.net/browse/${key}`,
			key,
			issueType: fields.issueType,
		};
	};

	return {
		getIssue: async (id) => {
			const response = await request(body(`issue/${id}/?fields=issuetype,summary,fixVersions`));
			return mapIssue(response);
		},
	};
}

module.exports = connectJira;
