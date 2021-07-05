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

	return {
		getIssue: async (id) => await request(body(`issue/${id}/?fields=issuetype.untranslatedName,summary`)),
		getIssueTypes: async () => await request(body('issuetype')),
	}
}

module.exports = connectJira;
