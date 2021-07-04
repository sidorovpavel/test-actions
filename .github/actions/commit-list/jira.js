const request = require("request-promise");

function connectJira(domain, user, token) {
	const body = (command) => {
		return {
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/api/2/${command}`,
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

	return {
		getIssue: async (id) => { await request(body(`issue/${id}`)) },
		getIssueTypes: async () => { await request(body('issuetype')) },
	}
}

module.exports = connectJira;
