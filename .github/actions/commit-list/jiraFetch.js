const fetch = require('node-fetch');

class JiraFetch {
  #authString;
  #url;

  constructor(domain, user, token) {
    this.#authString = Buffer.from(`${user}:${token}`).toString('base64');
    this.#url = (command) => `https://${domain}.atlassian.net/rest/api/3/${command}`;
  }

  getRequest = async (command) => {
    const res = await fetch(
      this.#url(command),
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${(this.#authString)}`,
        },
      },
    );
    return res.json();
  };

  setRequest = async(command, body, isUpdate = false) => {
    const res = await fetch(this.#url(command),
      {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${this.#authString}`,
          'Content-Type': 'application/json',
        },
        body,
      });
    return isUpdate ? res : res.json();
  };
}

module.exports = JiraFetch;
