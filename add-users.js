const bcrypt = require("bcrypt");
const { dbQuery } = require("./lib/db-query");

addUsers = async () => {
  const users = [
    { username: "admin", password: "secret" },
    { username: "developer", password: "letmein" },
  ];

  const salt = bcrypt.genSaltSync(10);

  for (let user of users) {
    const username = user.username;
    let password = user.password;
    password = bcrypt.hashSync(password, salt);
    const ADD_USER =
      "INSERT INTO users (username, password, salt) VALUES ($1, $2, $3)";
    await dbQuery(ADD_USER, username, password, salt);
  }
};

addUsers();
