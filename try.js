const bcrypt = require('bcrypt');

const enteredPassword = "fmv6asgb";  // Replace with the actual password you entered
const storedHash = "$2a$10$lLeAh3tqPl/VYzmiuAMvAekUGGQzm2NLwA0xhksYnkTtWrSbaP45q"; // Your stored password

const func = async () => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(enteredPassword, salt);

    
    const result = await bcrypt.compare(enteredPassword, this.Password , );
    
    console.log("hellp")

    console.log(enteredPassword);
    console.log(hashedPassword);
    console.log(result);
}
func();