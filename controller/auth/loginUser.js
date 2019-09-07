let { user } = require("../../models/index");
const { generateToken } = require("../../lib/token");
const hash = require("../../lib/hash");

module.exports = async (req, res) => {
  try {
    let { userId, password } = req.body;
    password = hash(password);
    console.log(password);
    const payload = {
      userId,
      password
    };
    const check = value => {
      if (!value) {
        // user does not exist
        throw new Error("login failed");
      } else {
        // user exists, check the password
        if (value.dataValues.password === password) {
          // create a promise that generates jwt asynchronously
          let token = generateToken(payload);
          res.cookie("access_token", token, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 1
          });
          return token;
        } else {
          throw new Error("login failed");
        }
      }
    };

    const respond = token => {
      res.json({
        message: "LOGIN SUCCESS",
        token
      });
    };

    const onError = error => {
      res.status(403).json({
        message: error.message
      });
    };

    // TODO: find by username
    const findByUsername = async userId => {
      return await user.findOne({ where: { userId } });
    };

    // TODO: 실행
    findByUsername(userId)
      .then(check)
      .then(respond)
      .catch(onError);
  } catch (e) {
    console.error(e);
    res.status(500).send("500 ERROR");
  }
};
