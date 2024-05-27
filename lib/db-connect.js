const { Client } = require("pg");
module.exports = {
  getClient: async function () {
    let client = new Client({
      database: "todo-lists",
      password: "AccessDatabase",
    });

    await client.connect();

    return client;
  },
};
