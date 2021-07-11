const fetch = require("node-fetch");
const moment = require("moment");

function connectJira(domain, user, token, projectName) {

  const AuthString = Buffer.from(`${user}:${token}`).toString('base64');

	async function getRequest(command){
		const res = await fetch(
			`https://${domain}.atlassian.net/rest/api/3/${command}`,
			{
				method: "GET",
				headers: {
					"Accept": "application/json",
					"Authorization": `Basic ${AuthString}`,
				},
			});
		return await res.json();
	}

 	const setRequest = async (command, body, isUpdate = false) => {
		const opts = {
			method: isUpdate ? "PUT" : "POST",
			headers: {
				"Accept": "application/json",
				"Authorization": `Basic ${AuthString}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body),
		};
		console.log(opts);
	  const res = await fetch(`https://${domain}.atlassian.net/rest/api/3/${command}`, opts);
	  return await res.json();
  };

	const mapIssue = async ({ key, fields }) => {
		return {
			uri: `https://${domain}.atlassian.net/browse/${key}`,
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

	const getIssue = async (id) => mapIssue(await getRequest(`issue/${id}/?fields=issuetype,summary,fixVersions`));
	const getIssueType = async () => mapIssueType(await getRequest('issuetype'));
	const getProjectId = async () => {
		const response = await getRequest(`project/${projectName}`);
		return response.id;
	};
	const findProjectVersionByName = async (version) =>
		(await getRequest(`project/${projectName}/versions`))
			.find(item => item.name === version);

	const createVersion = async (projectId, version) =>
		await setRequest(`version`,
			{
				"archived": false,
				"releaseDate": moment().format("YYYY-MM-DD"),
				"name": version,
				"projectId": projectId,
				"released": true
			});

	const getOrCreateVersion = async (versionName) => {
		const version = await findProjectVersionByName(versionName);
		if (!version) {
			const projectId = await getProjectId();
			return await createVersion(projectId, versionName)
		}
		return version;
	};

	const issueSetVersion = async ({ key }, { id }) => {
	  return setRequest(`issue/${key}`,
		  { "update": { "fixVersions": [ { "set": [ { id } ] } ] } },
		  true
		)};

	const setVersionToIssues = async (version, issues) => {
		return await Promise.all([
			...issues.map(async item => issueSetVersion(item, version))
		]);
	};

	return {
		getIssues: async (arr) => {
			const [types, ...issues] = await Promise.all([
				getIssueType(),
				...arr.map(async item => getIssue(item))
			]);

			const sortArray = ['Bug', 'Improvement', 'New feature'];

			return issues
				.map(item => {
					return { ...item, issueType: types.get(item.issueTypeId).name };
				})
				.filter(item => {
					return item.issueType.toLowerCase() !== 'bug' || !item.existFixVersions
				})
				.sort((a, b) => sortArray.indexOf(b.issueType) - sortArray.indexOf(a.issueType));
		},

		setVersionToIssues: async (versionName, issues) => {
			const version = await getOrCreateVersion(versionName);
			return setVersionToIssues(version, issues);
		},
	};
}

module.exports = connectJira;
