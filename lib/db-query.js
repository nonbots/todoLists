const {Client} = require("pg");
const logQuery = (statement, parameters) => {
  let timeStamp = new Date();
  let formattedTimeStamp = timeStamp.toString().substring(4, 24);
  console.log(formattedTimeStamp, statement, parameters);
};
module.exports = {
  async dbQuery(statement, ...values) {
    let client = new Client({ database: "todo-lists", user: "postgres", password: "mypassword" });
    await client.connect();
    console.log("Connection established");
    logQuery(statement, values);
    let result = await client.query(statement, values);
    await client.end();
    console.log("Connection closed"); 
    return result;
  }
}

