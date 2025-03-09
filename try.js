const bcrypt = require('bcrypt');

const enteredPassword = "0mdhprhs";  // Replace with the actual password you entered
const storedHash = "$2a$10$HpsiLWmgWB2YlIYS0ExY8OByXDENwQBHhI8pSlWonzBJYMBpk3STG"; // Your stored password

console.log()

bcrypt.compare(enteredPassword, storedHash, (err, result) => {
    console.log("Password Matches?", result);
    console.log("Error (if any):", err);
});
