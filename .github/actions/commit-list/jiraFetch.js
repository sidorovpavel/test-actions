import fetch from 'node-fetch';

const jiraFetch = (domain, user, token) => {
  const AuthString = Buffer.from(`${user}:${token}`).toString('base64');

  return {
    getRequest: async (command) => {
      const res = await fetch(
        `https://${domain}.atlassian.net/rest/api/3/${command}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${AuthString}`,
          },
        },
      );
      return res.json();
    },

    setRequest: async (command, body, isUpdate = false) => {
      const res = await fetch(`https://${domain}.atlassian.net/rest/api/3/${command}`,
        {
          method: isUpdate ? 'PUT' : 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Basic ${AuthString}`,
            'Content-Type': 'application/json',
          },
          body,
        });
      return isUpdate ? res : res.json();
    },
  };
};

export { jiraFetch as default };
