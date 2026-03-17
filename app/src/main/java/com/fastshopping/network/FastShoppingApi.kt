package com.fastshopping.network

import com.fastshopping.firebase.FirebaseProduct
import retrofit2.Response
import retrofit2.http.*

/**
 * FAST SHOPPING - GLOBAL NETWORK INTERFACE (RETROFIT)
 * Enterprise-level API Handshake Protocol
 */

interface FastShoppingApi {

    // --- AUTH PROTOCOL ---
    @POST("api/auth/login")
    suspend fun login(@Body creds: Map<String, String>): Response<Map<String, Any>>

    @POST("api/auth/register")
    suspend fun register(@Body user: Map<String, String>): Response<Map<String, Any>>

    // --- INVENTORY PROTOCOL ---
    @GET("api/products/")
    suspend fun getProducts(): Response<List<FirebaseProduct>>

    @GET("api/products/{id}")
    suspend fun getProduct(@Path("id") id: String): Response<FirebaseProduct>

    // --- TRANSACTION PROTOCOLS ---
    @GET("api/cart")
    suspend fun getCart(@Query("user_id") userId: Int): Response<Map<String, Any>>

    @POST("api/cart/add")
    suspend fun addToCart(@Body item: Map<String, Any>): Response<Map<String, Any>>

    @POST("api/cart/remove")
    suspend fun removeFromCart(@Query("item_id") itemId: Int): Response<Map<String, Any>>

    // --- LOGISTICS PROTOCOL ---
    @POST("api/orders/create")
    suspend fun createOrder(@Body order: Map<String, Any>): Response<Map<String, Any>>

    @GET("api/orders")
    suspend fun getOrders(@Query("user_id") userId: Int): Response<List<Map<String, Any>>>

    @POST("api/orders/payment/verify")
    suspend fun verifyPayment(@Body payment: Map<String, Any>): Response<Map<String, Any>>
}
