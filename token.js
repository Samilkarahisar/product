
var jwt = require("jsonwebtoken");

function generate(email){
    const date = new Date();
    date.setHours(date.getHours + 1);
    return jwt.sign({email, expiation: date}, process.env.JWT_SECRET);
}