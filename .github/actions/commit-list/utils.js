const jira_matcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

export const reduceIssues = (issues, item) => {
	const names = item.commit.message.split("").reverse().join("").match(jira_matcher);
	if (!names) {
		return issues;
	}
	names.forEach(res => {
		const id = res.split("").reverse().join("");
		if(issues.indexOf(id)===-1) {
			issues.push(id)
		}
	})
	return issues;
};
