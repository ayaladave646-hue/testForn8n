const express = require("express");

const app = express();

app.post("/transfer", async (req, res) => {
    const { fromAccount, toAccount, amount } = req.body;

    const sender = await Account.findById(fromAccount);

    if (!sender) {
        return res.status(404).json({
            message: "Account not found"
        });
    }

    if (sender.balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    await Account.findByIdAndUpdate(
        fromAccount,
        {
            $inc: {
                balance: -amount
            }
        }
    );

    await Account.findByIdAndUpdate(
        toAccount,
        {
            $inc: {
                balance: amount
            }
        }
    );

    res.json({
        success: true
    });
});

app.listen(3000);