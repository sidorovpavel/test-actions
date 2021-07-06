const request = require("request-promise");

function connectJira(domain, user, token) {
	const body = (command) => {
		return {
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/agile/1.0/${command}`,
			headers: {
				Accept: "application/json",
			},
			auth: {
				user,
				pass: token,
			},
			json: true
		}
	}

	const mapIssue = (response) => {
		return response;
	}

	const mapIssueTypes = (response) => {
		console.log(response);
		return response;
	}

	return {
		getIssue: async (id) => {
			const response = await request(body(`issue/${id}/?fields=issuetype,summary,fixVersions`));
			return mapIssue(response);
		},
		getIssueTypes: async () => {
			const response = await request(body('issuetype'));
			return mapIssueTypes(response);
		},
	}
}

module.exports = connectJira;
