const mapComment = ({
  issueType, key, url, summary,
}) => `<${issueType}>${key}(${url}) ${summary}`;

const mapIssue = async ({ key, fields }) => ({
  key,
  issueTypeId: fields.issuetype.id,
  summary: fields.summary,
  existFixVersions: fields.fixVersions.length > 0,
});

const mapIssueType = (response) => {
  const types = new Map();
  response.forEach((item) => {
    const { untranslatedName: name } = item;
    types.set(item.id, { name });
  });
  return types;
};

const jiraMatcher = /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g;


exports = { mapComment, mapIssueType, mapIssue };
