function calculateCartTotal(items, discount) {
    let total = 0;

    for (const item of items) {
        total += item.price * item.quantity;
    }

    if (discount) {
        total -= discount;
    }

    if (total < 0) {
        total = 0;
    }

    return total;
}

function applyCoupon(total, coupon) {
    if (coupon.type === "percentage") {
        return total - total * coupon.value;
    }

    return total - coupon.value;
}

const cart = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
];

const coupon = {
    type: "percentage",
    value: 20
};

const total = calculateCartTotal(cart, 10);
const finalTotal = applyCoupon(total, coupon);

console.log(finalTotal);