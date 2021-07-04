const request = require("request-promise");

async function getIssue(domain, id) {
	const res = await request({
			method: "GET",
			uri: `https://${domain}.atlassian.net/rest/agile/1.0/issue/${id}`,
			headers: {
				Accept: "application/json",
			},
			authorization: {
				Basic: btoa('psidorov@tangim.com' + ":" + 'G9BzF6RS23GieYa4Afca0987'),
			},
		json: true
	});
	return res;

}

module.exports = getIssue;
