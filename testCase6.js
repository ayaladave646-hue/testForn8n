async function completeCheckout(userId, cartId, paymentId) {
    const cart = await Cart.findOne({
        _id: cartId,
        userId,
        status: "active"
    });

    if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
    }

    const productIds = cart.items.map(item => item.productId);

    const products = await Product.find({
        _id: { $in: productIds }
    });

    const productMap = new Map(
        products.map(product => [
            product._id.toString(),
            product
        ])
    );

    let total = 0;

    for (const item of cart.items) {
        const product = productMap.get(
            item.productId.toString()
        );

        if (!product || product.stock < item.quantity) {
            throw new Error("Product unavailable");
        }

        total += product.price * item.quantity;
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        userId,
        status: "completed"
    });

    if (!payment || payment.amount !== total) {
        throw new Error("Invalid payment");
    }

    const order = await Order.create({
        userId,
        items: cart.items,
        total,
        paymentId,
        status: "confirmed"
    });

    for (const item of cart.items) {
        await Product.findByIdAndUpdate(
            item.productId,
            {
                $inc: {
                    stock: -item.quantity
                }
            }
        );
    }

    await Cart.findByIdAndUpdate(cartId, {
        status: "completed"
    });

    return order;
}

async function cancelOrder(orderId, userId) {
    const order = await Order.findOne({
        _id: orderId,
        userId,
        status: "confirmed"
    });

    if (!order) {
        throw new Error("Order not found");
    }

    await Order.findByIdAndUpdate(orderId, {
        status: "cancelled"
    });

    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.productId,
            {
                $inc: {
                    stock: item.quantity
                }
            }
        );
    }

    return {
        success: true
    };
}

async function retryCheckout(userId, cartId, paymentId) {
    try {
        return await completeCheckout(
            userId,
            cartId,
            paymentId
        );
    } catch (error) {
        return completeCheckout(
            userId,
            cartId,
            paymentId
        );
    }
}