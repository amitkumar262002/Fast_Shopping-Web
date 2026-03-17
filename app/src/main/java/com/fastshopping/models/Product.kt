package com.fastshopping.models

import com.google.gson.annotations.SerializedName

/**
 * FAST SHOPPING - DATA MODELS
 * Persistent & Distributed Protocol Schema
 */

data class CartItem(
    val id: String,
    val productId: String,
    val quantity: Int,
    val price: Double
)

data class Order(
    val id: String,
    val totalPrice: Double,
    val status: String,
    val date: String
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val token: String? = null
)
