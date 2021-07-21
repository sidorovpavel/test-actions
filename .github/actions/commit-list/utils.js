export const mapComment = ({
  issueType, key, url, summary,
}) => `<${issueType}>${key}(${url}) ${summary}`;

export const mapIssue = async ({ key, fields }) => ({
  key,
  issueTypeId: fields.issuetype.id,
  summary: fields.summary,
  existFixVersions: fields.fixVersions.length > 0,
});

export const mapIssueType = (response) => {
  const types = new Map();
  response.forEach((item) => {
    const { untranslatedName: name } = item;
    types.set(item.id, { name });
  });
  return types;
};

const jiraMatcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;

export const reduceIssues = (issues, item) => {
  const names = item.commit.message.split('').reverse().join('').match(jiraMatcher);
  if (!names) {
    return issues;
  }
  names.forEach((res) => {
    const id = res.split('').reverse().join('');
    if (issues.indexOf(id) === -1) {
      issues.push(id);
    }
  });
  return issues;
};
