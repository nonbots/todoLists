const { Client } = require("pg");
const logQuery = (statement, parameters) => {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
};
module.exports = {
  getClient: function () {
    let client = new Client({
      database: "todo-lists",
      password: "AccessDatabase",
    });
    return client;
  }, async dbQuery(statement, client, ...values) {
    await client.connect();
    console.log("Connection established");
    logQuery(statement, values);
    let result = await client.query(statement, values);

    console.log("Connection closed");
    return result;
  },
};
