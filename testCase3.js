let balance = 1000;

async function withdraw(amount) {
    if (balance >= amount) {
        await new Promise(resolve => setTimeout(resolve, 100));

        balance -= amount;

        return {
            success: true,
            balance
        };
    }

    return {
        success: false,
        message: "Insufficient funds"
    };
}

async function main() {
    const results = await Promise.all([
        withdraw(800),
        withdraw(800)
    ]);

    console.log(results);
    console.log("Final balance:", balance);
}

main();