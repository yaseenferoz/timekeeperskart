const jwt = require('jsonwebtoken');

// simple login (hardcoded for now)
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    return res.json({ token });
  }

  res.status(401).json({ message: "Invalid credentials" });
};