const crypto = require("crypto");
const Donation = require("../models/Donation");
const Partnership = require("../models/Partnership");
const Partner = require("../models/Partner");
const Notification = require("../models/Notification");

// @desc Paystack webhook — this is the SOURCE OF TRUTH for payment confirmation.
//       Never trust the frontend's "success" redirect alone; Paystack calls this
//       server-to-server, and we verify the signature before doing anything.
// @route POST /api/paystack/webhook
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(req.rawBody) // rawBody is captured by the raw-body middleware in server.js
      .digest("hex");

    if (hash !== signature) {
      console.warn("[Paystack Webhook] Invalid signature — request ignored");
      return res.sendStatus(401);
    }

    const event = req.body;

    switch (event.event) {
      case "charge.success": {
        const { reference } = event.data;

        // Prevent duplicate processing if Paystack retries the webhook
        const donation = await Donation.findOne({ transactionReference: reference });
        if (donation && donation.paymentStatus !== "success") {
          donation.paymentStatus = "success";
          await donation.save();

          if (donation.donor) {
            await Notification.create({
              user: donation.donor,
              title: "Payment received",
              message: `Your donation of ${donation.currency} ${donation.amount.toLocaleString()} was successful. Thank you!`,
              type: "payment_success",
            });
          }
        }
        break;
      }

      case "subscription.create": {
        const { subscription_code, customer } = event.data;
        const partner = await Partner.findOne({ paystackCustomerCode: customer.customer_code });
        if (partner) {
          partner.paystackSubscriptionCode = subscription_code;
          partner.status = "active";
          await partner.save();
        }
        break;
      }

      case "invoice.payment_failed": {
        const { customer } = event.data;
        const partner = await Partner.findOne({ paystackCustomerCode: customer.customer_code });
        if (partner) {
          const user = partner.user;
          await Notification.create({
            user,
            title: "Payment failed",
            message: "Your recurring partnership payment could not be processed. Please update your payment details.",
            type: "payment_failed",
          });
        }
        break;
      }

      default:
        // Unhandled event types are safely ignored
        break;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("[Paystack Webhook] Error:", err.message);
    res.sendStatus(500);
  }
};

module.exports = { handleWebhook };
