const { Client } = require("pg");
const logQuery = (statement, parameters) => {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
};
module.exports = {
  getClient: async function () {
    let client = new Client({
      database: "todo-lists",
      password: "AccessDatabase",
    });

    await client.connect();

    return client;
  }, async dbQuery(statement, client, ...values) {

    console.log("Connection established");
    logQuery(statement, values);
    let result = await client.query(statement, values);

    console.log("Connection closed");
    return result;
  },
};
