package com.fastshopping.models

data class Product(
    val id: Int,
    val sku: String,
    val name: String,
    val slug: String,
    val description: String?,
    val price: Double,
    val inventory: Int,
    val image_url: String?,
    val category_id: Int?
)

data class Category(
    val id: Int,
    val name: String,
    val slug: String,
    val description: String?,
    val image_url: String?
)
