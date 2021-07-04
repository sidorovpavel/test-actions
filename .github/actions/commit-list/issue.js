const request = require("request-promise");

async function getIssue(domain, id) {
	const res = await request({
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/agile/1.0/issue/${id}`,
			headers: {
				Accept: "application/json",
			},
		json: true
	});
	return res;

}

module.exports = getIssue;
