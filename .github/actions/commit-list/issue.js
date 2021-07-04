const request = require("request-promise");

async function getIssue(domain, id) {
	const res = await request({
			method: "GET",
			uri: `https://tangem.atlassian.net/rest/agile/1.0/issue/MM-1`,
			headers: {
				Accept: "application/json",
			},
			authorization: {
				Basic: Buffer.from('psidorov@tangem.com' + ":" + 'G9BzF6RS23GieYa4Afca0987').toString('base64'),
			},
		json: true
	});
	return res;

}

module.exports = getIssue;
