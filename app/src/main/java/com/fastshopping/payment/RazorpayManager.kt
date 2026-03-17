package com.fastshopping.payment

import android.app.Activity
import android.widget.Toast
import com.fastshopping.BuildConfig
import com.fastshopping.firebase.FirebaseRepository
import com.razorpay.Checkout
import com.razorpay.PaymentResultListener
import org.json.JSONObject
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

/**
 * Razorpay Payment Manager for Fast Shopping.
 *
 * Usage:
 *   - Your Activity must implement PaymentResultListener.
 *   - Call RazorpayManager.startPayment(activity, amount, description)
 *   - Handle onPaymentSuccess / onPaymentError in your Activity.
 */
object RazorpayManager {

    fun preload(activity: Activity) {
        Checkout.preload(activity.applicationContext)
    }

    /**
     * @param amountInPaise  Amount in PAISE (e.g. ₹199 = 19900)
     */
    fun startPayment(
        activity: Activity,
        amountInPaise: Int,
        description: String = "Fast Shopping Order",
        customerName: String = "",
        customerEmail: String = "",
        customerPhone: String = ""
    ) {
        try {
            val co = Checkout()
            co.setKeyID(BuildConfig.RAZORPAY_KEY_ID)
            co.setImage(com.fastshopping.R.drawable.ic_launcher_foreground)

            val options = JSONObject().apply {
                put("name", "Fast Shopping")
                put("description", description)
                put("currency", "INR")
                put("amount", amountInPaise)

                val prefill = JSONObject().apply {
                    put("name", customerName)
                    put("email", customerEmail)
                    put("contact", customerPhone)
                }
                put("prefill", prefill)

                val theme = JSONObject().apply {
                    put("color", "#6200EE")
                }
                put("theme", theme)
            }

            co.open(activity, options)
        } catch (e: Exception) {
            Toast.makeText(activity, "Payment Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    /**
     * Call this from Activity's onPaymentSuccess
     */
    fun onPaymentSuccess(paymentId: String, orderId: String, signature: String) {
        // Handshake protocol with Backend for Enterprise Verification
        kotlinx.coroutines.GlobalScope.launch {
            try {
                val verificationData = mapOf(
                    "razorpay_payment_id" to paymentId,
                    "razorpay_order_id" to orderId,
                    "razorpay_signature" to signature
                )
                val response = com.fastshopping.network.RetrofitClient.instance.verifyPayment(verificationData)
                if (response.isSuccessful) {
                    println("Payment Verified and Order Updated in Backend.")
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
