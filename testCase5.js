const crypto = require("crypto");

async function reserveSeat(eventId, userId) {
    const reservationKey = `${eventId}:${userId}`;

    const existingReservation = await Reservation.findOne({
        key: reservationKey
    });

    if (existingReservation) {
        return existingReservation;
    }

    const event = await Event.findById(eventId);

    if (!event || event.availableSeats <= 0) {
        throw new Error("No seats available");
    }

    const reservation = await Reservation.create({
        key: reservationKey,
        eventId,
        userId,
        status: "pending",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    await Event.findByIdAndUpdate(eventId, {
        $inc: {
            availableSeats: -1
        }
    });

    return reservation;
}

async function confirmReservation(reservationId, paymentId) {
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    if (reservation.status !== "pending") {
        return reservation;
    }

    const payment = await Payment.findById(paymentId);

    if (!payment || payment.status !== "completed") {
        throw new Error("Payment not completed");
    }

    reservation.status = "confirmed";
    reservation.paymentId = paymentId;

    await reservation.save();

    return reservation;
}

async function expireReservations() {
    const expired = await Reservation.find({
        status: "pending",
        expiresAt: { $lt: new Date() }
    });

    for (const reservation of expired) {
        reservation.status = "expired";

        await reservation.save();

        await Event.findByIdAndUpdate(reservation.eventId, {
            $inc: {
                availableSeats: 1
            }
        });
    }
}

async function createPayment(userId, amount) {
    const idempotencyKey = crypto
        .createHash("sha256")
        .update(`${userId}:${amount}`)
        .digest("hex");

    const existingPayment = await Payment.findOne({
        idempotencyKey
    });

    if (existingPayment) {
        return existingPayment;
    }

    return Payment.create({
        userId,
        amount,
        idempotencyKey,
        status: "completed"
    });
}