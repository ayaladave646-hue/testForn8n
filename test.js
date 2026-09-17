const express = require("express");

const app = express();

app.get("/user", (req, res) => {
    const userId = req.query.id;

    // Security issue: SQL injection
    const query = "SELECT * FROM users WHERE id = " + userId;

    // Bug: user may not exist
    const user = database.query(query)[0];

    // Bug: password is exposed
    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password
    });
});

app.get("/calculate", (req, res) => {
    const price = req.query.price;
    const quantity = req.query.quantity;

    // Bug: values from query parameters are strings
    const total = price + quantity;

    res.json({
        total: total
    });
});

app.get("/divide", (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    // Bug: division by zero is not handled
    const result = a / b;

    res.json({
        result: result
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
