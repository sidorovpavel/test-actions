const request = require("request-promise");

async function connectJira(domain, user, token) {
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
	};

	const issueTypes =  await request(body('issuetype'));
	console.log(issueTypes);

	const mapIssue = ({key, fields}) => {
		return {
			url: `https://${domain}.atlassian.net/browse/${key}`,
			key,
			issueType: fields.issueType,
		};
	}

	return {
		getIssue: async (id) => {
			const response = await request(body(`issue/${id}/?fields=issuetype,summary,fixVersions`));
			return mapIssue(response);
		},
	};
}

module.exports = connectJira;
