package com.fastshopping.network

import com.fastshopping.BuildConfig
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Unsplash API Service
 * Access Key: configured via BuildConfig
 * Docs: https://unsplash.com/documentation
 */
interface UnsplashApi {

    @GET("search/photos")
    suspend fun searchPhotos(
        @Query("query") query: String,
        @Query("per_page") perPage: Int = 10,
        @Query("client_id") clientId: String = BuildConfig.UNSPLASH_ACCESS_KEY
    ): UnsplashSearchResponse

    @GET("photos/random")
    suspend fun getRandomPhoto(
        @Query("query") query: String = "shopping",
        @Query("client_id") clientId: String = BuildConfig.UNSPLASH_ACCESS_KEY
    ): UnsplashPhoto
}

data class UnsplashSearchResponse(
    val total: Int,
    val results: List<UnsplashPhoto>
)

data class UnsplashPhoto(
    val id: String = "",
    val description: String? = null,
    val urls: UnsplashUrls = UnsplashUrls()
)

data class UnsplashUrls(
    val raw: String = "",
    val full: String = "",
    val regular: String = "",
    val small: String = "",
    val thumb: String = ""
)
