const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payment/order
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; 

    const options = {
      amount: Math.round(amount * 100), // Convert ₹ to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    
    // We return 'order' which contains the 'id' your frontend needs
    res.status(200).json(order); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Create the expected signature using your Secret Key
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // Compare our generated signature with the one from the frontend
    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully" 
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid signature sent!" 
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};