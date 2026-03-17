package com.fastshopping.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fastshopping.firebase.FirebaseProduct
import com.fastshopping.firebase.FirebaseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class MainViewModel : ViewModel() {

    private val _products = MutableStateFlow<List<FirebaseProduct>>(emptyList())
    val products = _products.asStateFlow()

    private val _flashDeals = MutableStateFlow<List<FirebaseProduct>>(emptyList())
    val flashDeals = _flashDeals.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading = _isLoading.asStateFlow()

    private val _cartItems = MutableStateFlow<List<FirebaseProduct>>(emptyList())
    val cartItems = _cartItems.asStateFlow()

    private val _recentProducts = MutableStateFlow<List<FirebaseProduct>>(emptyList())
    val recentProducts = _recentProducts.asStateFlow()

    private val _userBalance = MutableStateFlow(5000.0) // Simulated 5k balance
    val userBalance = _userBalance.asStateFlow()

    private val _appliedCoupon = MutableStateFlow<String?>(null)
    val appliedCoupon = _appliedCoupon.asStateFlow()

    val cartCount get() = _cartItems.value.size

    init {
        observeProducts()
        observeFlashDeals()
    }

    private fun observeProducts() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val response = com.fastshopping.network.RetrofitClient.instance.getProducts()
                if (response.isSuccessful && response.body() != null) {
                    val list = response.body()!!
                    _products.value = list
                    _flashDeals.value = list.take(5) // Just taking first 5 for flash deals
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                _isLoading.value = false
            }
        }
    }

    private fun observeFlashDeals() {
        // Now handled by observeProducts
    }

    fun addToCart(product: FirebaseProduct) {
        val current = _cartItems.value.toMutableList()
        if (!current.any { it.id == product.id }) {
            current.add(product)
            _cartItems.value = current
        }
    }

    fun addToRecent(product: FirebaseProduct) {
        val current = _recentProducts.value.toMutableList()
        if (!current.any { it.id == product.id }) {
            current.add(0, product)
            _recentProducts.value = current.take(5)
        }
    }

    fun removeFromCart(product: FirebaseProduct) {
        _cartItems.value = _cartItems.value.filter { it.id != product.id }
    }

    fun applyCoupon(code: String) {
        _appliedCoupon.value = if (code.lowercase() == "festive20") code else null
    }

    fun getCartTotal(): Double {
        val subtotal = _cartItems.value.sumOf { it.price }
        val discount = if (_appliedCoupon.value != null) subtotal * 0.20 else 0.0
        return subtotal - discount + 40.0 // + 40 for delivery
    }

    fun addBalance(amount: Double) {
        _userBalance.value += amount
    }

    fun placeOrder(paymentId: String) {
        val total = getCartTotal()
        if (_userBalance.value >= total) {
            _userBalance.value -= total
            _cartItems.value = emptyList()
            _appliedCoupon.value = null
        }
    }
}
