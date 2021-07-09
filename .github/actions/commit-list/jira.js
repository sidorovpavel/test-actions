const request = require("request-promise");
const moment = require("moment");

function connectJira(domain, user, token, projectName) {

 	const execCommand = async (command, body) => {
	  const baseQuery = {
		  headers: {
			  Accept: "application/json",
		  },
		  auth: {
			  user,
			  pass: token,
		  },
		  json: true,
	  };

	  return await request({
		  uri: `https://${domain}.atlassian.net/rest/api/3/${command}`,
		  ...baseQuery,
		  ...body,
	  });
  }

  const getRequest = async (command) => await execCommand(command, {method: "GET"});
  const setRequest = async (command, bodyData, isUpdate = false) => await execCommand(command,
	  {
	  	method: isUpdate ? "PUT" : "POST",
		  headers: {
			  Accept: "application/json",
			  contentType: 'application/json'
		  },
		  body: bodyData,
	  }
  );

	const mapIssue = async ({key, fields}) => {
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
				archived: false,
				releaseDate: moment().format("YYYY-MM-DD"),
				name: version,
				projectId: projectId,
				released: true
			});

	const getOrCreateVersion = async (versionName) => {
		const version = await findProjectVersionByName(versionName);
		if (!version) {
			const projectId = await getProjectId();
			return await createVersion(projectId, versionName)
		}
		return version;
	};

	const issueSetVersion = async ({ key }, version) =>
		setRequest(`issue/${key}`,
			{update: {fixVersions:[{ set: [{ id: version }] }]} },
		true
		);

	const setVersionToIssues = async (version, issues) => {
		return await Promise.all([
			...issues.map(async item => issueSetVersion(item, version))
		]);
	};

	return {
		getIssues: async (arr) => {
			const typePromise = new Promise((resolve) => {
				resolve(getIssueType());
			});

			const [types, ...issues] = await Promise.all([
				typePromise,
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
