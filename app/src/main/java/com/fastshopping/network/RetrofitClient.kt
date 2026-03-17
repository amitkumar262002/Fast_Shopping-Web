package com.fastshopping.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // Use "10.0.2.2" to connect from Android Emulator to local machine
    private const val BASE_URL = "http://10.0.2.2:8000/"

    val instance: FastShoppingApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(FastShoppingApi::class.java)
    }
}

object UnsplashClient {
    private const val BASE_URL = "https://api.unsplash.com/"

    val instance: UnsplashApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(UnsplashApi::class.java)
    }
}
