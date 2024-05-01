const {Client} = require("pg");

module.exports = {
  async dbQuery(statement, ...values) {
    let client = new Client({ database: "todo-lists", user: "postgres", password: "mypassword" });
    await client.connect();
    console.log("Connection established");
    let result = await client.query(statement, values);
    await client.end();
    console.log("Connection closed"); 
    return result;
  }
}

