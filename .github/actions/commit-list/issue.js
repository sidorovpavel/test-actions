const request = require("request-promise");

async function getIssue(domain, id) {
	const res = await request({
			method: "GET",
			uri: `https://tangem.atlassian.net/rest/agile/1.0/issue/AND-905`,
			headers: {
				Accept: "application/json",
			},
			auth: {
				'user': 'psidorov@tangem.com',
				'pass': 'G9BzF6RS23GieYa4Afca0987'
			},
		json: true
	});
	return res;

}

module.exports = getIssue;
