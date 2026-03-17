package com.fastshopping.firebase

import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

import com.google.gson.annotations.SerializedName

data class FirebaseProduct(
    @SerializedName("id") val id: String = "",
    @SerializedName("title") val name: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("price") val price: Double = 0.0,
    @SerializedName("originalPrice") val originalPrice: Double = 0.0,
    @SerializedName("category") val category: String = "General",
    @SerializedName("brand") val brand: String = "",
    @SerializedName("image") val image: String = "",
    @SerializedName("rating") val rating: Double = 4.2,
    @SerializedName("stock") val stock: Int = 0,
    @SerializedName("specs") val specs: Map<String, String> = emptyMap()
)

object FirebaseRepository {
    private val database = FirebaseDatabase.getInstance()
    private val productsRef = database.getReference("products")

    private val _products = MutableStateFlow<List<FirebaseProduct>>(emptyList())
    val products: StateFlow<List<FirebaseProduct>> = _products

    fun seedData() {
        val sampleProducts = listOf(
            FirebaseProduct(
                id = "p1",
                name = "iPhone 15 Pro Max (Titanium)",
                category = "Mobiles",
                price = 148900.0,
                originalPrice = 159900.0,
                image = "https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/k/l/l/-original-imagtc688u7mcg99.jpeg?q=70",
                description = "The first iPhone with an aerospace-grade titanium design. Powered by the A17 Pro chip for peak mobile performance.",
                rating = 4.8,
                stock = 12450,
                specs = mapOf("RAM" to "8 GB", "Storage" to "256 GB", "Display" to "6.7 inch Super Retina XDR")
            ),
            FirebaseProduct(
                id = "p2",
                name = "MacBook Pro M3 Max 16\"",
                category = "Electronics",
                price = 349900.0,
                originalPrice = 399900.0,
                image = "https://rukminim2.flixcart.com/image/312/312/xif0q/computer/v/l/o/-original-imagykgpgp3zhyyz.jpeg?q=70",
                description = "The most advanced MacBook yet. Built for creators, researchers, and developers who need ultimate performance.",
                rating = 4.9,
                stock = 3200,
                specs = mapOf("Processor" to "M3 Max", "Unified Memory" to "36 GB", "SSD" to "1 TB")
            ),
            FirebaseProduct(
                id = "p3",
                name = "Sony WH-1000XM5 Headset",
                category = "Tech",
                price = 24900.0,
                originalPrice = 34990.0,
                image = "https://rukminim2.flixcart.com/image/612/612/l3747680/headphone/e/a/p/-original-imagehf967y6rexy.jpeg?q=70",
                description = "Industry-leading noise cancellation. Exceptional sound quality with newly developed driver unit.",
                rating = 4.7,
                stock = 8500,
                specs = mapOf("Battery" to "30 Hours", "Bluetooth" to "5.2", "Weight" to "250g")
            ),
            FirebaseProduct(
                id = "p4",
                name = "Nike Air Max 270 (Elite)",
                category = "Fashion",
                price = 12995.0,
                originalPrice = 14500.0,
                image = "https://rukminim2.flixcart.com/image/612/612/xif0q/shoe/g/i/n/10-dr8607-002-11-nike-black-white-original-imagpkyhzv9zhzaz.jpeg?q=70",
                description = "Nike's first lifestyle Air Max delivers style, comfort and big attitude with every step.",
                rating = 4.5,
                stock = 5600,
                specs = mapOf("Material" to "Mesh/Synth", "Sole" to "Air Bag", "Weight" to "Luxury Lightweight")
            ),
            FirebaseProduct(
                id = "p5",
                name = "Samsung Galaxy S24 Ultra",
                category = "Mobiles",
                price = 129999.0,
                originalPrice = 139999.0,
                image = "https://rukminim2.flixcart.com/image/312/312/xif0q/mobile/5/i/7/-original-imagxjn28v8ey6zh.jpeg?q=70",
                description = "Galaxy AI is here. Epic camera with 200MP and legendary S-Pen support for the elite user.",
                rating = 4.8,
                stock = 9800,
                specs = mapOf("Display" to "QHD+ Dynamic AMOLED", "NPU" to "AIGC Ready", "Battery" to "5000 mAh")
            ),
            FirebaseProduct(
                id = "p6",
                name = "Dyson V15 Detect Core",
                category = "Home",
                price = 65900.0,
                originalPrice = 75000.0,
                image = "https://rukminim2.flixcart.com/image/612/612/xif0q/vacuum-cleaner/j/h/g/v15-detect-extra-dyson-original-imagnv8pzzhg6yz7.jpeg?q=70",
                description = "The most powerful cord-free vacuum. Laser slim fluffy cleaner head reveals microscopic dust.",
                rating = 4.8,
                stock = 1200,
                specs = mapOf("Runtime" to "60 Mins", "Filtration" to "HEPA", "Suction" to "230 AW")
            ),
            FirebaseProduct(
                id = "p7",
                name = "Shure SM7B Vocal Mic",
                category = "Mics",
                price = 38900.0,
                originalPrice = 45000.0,
                image = "https://rukminim2.flixcart.com/image/612/612/xif0q/microphone/j/z/l/sm7b-shure-original-imagy7fzgzgyhg8g.jpeg",
                description = "The industry standard for broadcast, podcast, and studio recording. legendary warm sound.",
                rating = 4.9,
                stock = 450,
                specs = mapOf("Connector" to "XLR", "Type" to "Dynamic", "Pattern" to "Cardioid")
            ),
            FirebaseProduct(
                id = "p8",
                name = "Blue Yeti X Professional",
                category = "Mics",
                price = 14500.0,
                originalPrice = 18999.0,
                image = "https://rukminim2.flixcart.com/image/612/612/kcp4j680/microphone/m/8/n/blue-microphones-yeti-x-original-imaftscfy7qytzhv.jpeg",
                description = "Advanced USB microphone for professional-level gaming, Twitch streaming, and podcasting.",
                rating = 4.7,
                stock = 1200,
                specs = mapOf("Interface" to "USB", "Pick-up" to "4-Capsule Array", "Metering" to "LED")
            ),
            FirebaseProduct(
                id = "p9",
                name = "Sony Alpha A7 IV (Mirrorless)",
                category = "Electronics",
                price = 219999.0,
                originalPrice = 249000.0,
                image = "https://rukminim2.flixcart.com/image/312/312/l39j67k0/dslr-camera/q/l/h/alpha-7-iv-a7-iv-sony-original-imagefc9e3hyrxun.jpeg",
                description = "The all-rounder. Full-frame mirrorless camera for masters of their craft.",
                rating = 4.9,
                stock = 150,
                specs = mapOf("Sensor" to "33MP Full-Frame", "ISO" to "50-204,800", "Video" to "4K 60p")
            ),
            FirebaseProduct(
                id = "p10",
                name = "Samsung Odyssey G9 Monitor",
                category = "Gaming",
                price = 145000.0,
                originalPrice = 165000.0,
                image = "https://rukminim2.flixcart.com/image/612/612/xif0q/monitor/g/h/p/ls49cg954swxxl-uhd-49-ls49cg954swxxl-samsung-original-imahfhh4vkgkyygv.jpeg",
                description = "The world's first 49 inch Dual QHD gaming monitor with a 240Hz refresh rate.",
                rating = 4.8,
                stock = 300,
                specs = mapOf("Refresh" to "240Hz", "Panel" to "OLED G9", "Ratio" to "32:9")
            )
        )

        sampleProducts.forEach { productsRef.child(it.id).setValue(it) }
    }
}
