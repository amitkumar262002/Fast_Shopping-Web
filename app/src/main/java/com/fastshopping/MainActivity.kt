package com.fastshopping

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import coil.compose.AsyncImage
import com.fastshopping.firebase.FirebaseProduct
import com.fastshopping.firebase.FirebaseRepository
import com.fastshopping.payment.RazorpayManager
import com.fastshopping.viewmodels.MainViewModel
import com.razorpay.PaymentResultListener
import kotlinx.coroutines.*
import androidx.lifecycle.lifecycleScope
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import com.fastshopping.firebase.FirebaseAuthRepository
import com.fastshopping.screens.LoginScreen

/**
 * FAST SHOPPING - ANDROID MASTER EDITION
 * Futuristic Premium UI/UX Parity with Web Frontend
 */

val RoyalBlue = Color(0xFF2563EB)
val PurpleGradient = Color(0xFF7C3AED)
val AccentOrange = Color(0xFFF97316)
val SoftBG = Color(0xFFF8FAFC)

class MainActivity : ComponentActivity(), com.razorpay.PaymentResultWithDataListener {

    private val viewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        RazorpayManager.preload(this)
        
        createNotificationChannel()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 101)
            }
        }

        // Auto-create demo accounts on first launch
        createDemoAccounts()

        // Seed products to the new Firebase Realtime Database
        com.fastshopping.firebase.FirebaseRepository.seedData()

        setContent {
            FastShoppingApp(viewModel)
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Fast Shopping Alerts"
            val descriptionText = "Notifications for Orders and Deals"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel("FAST_SHOPPING_CHANNEL", name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createDemoAccounts() {
        val prefs = getSharedPreferences("fs_prefs", Context.MODE_PRIVATE)
        if (prefs.getBoolean("demo_created", false)) return // already done

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                com.fastshopping.firebase.FirebaseAuthRepository.registerWithEmail(
                    name = "Demo User", email = "user@fastshopping.com", password = "User@123"
                )
            } catch (_: Exception) {} // already exists 
            try {
                com.fastshopping.firebase.FirebaseAuthRepository.registerWithEmail(
                    name = "Admin User", email = "admin@fastshopping.com", password = "Admin@123"
                )
            } catch (_: Exception) {}
            prefs.edit().putBoolean("demo_created", true).apply()
        }
    }

    private fun sendRealNotification(title: String, message: String) {
        val builder = NotificationCompat.Builder(this, "FAST_SHOPPING_CHANNEL")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify((System.currentTimeMillis() % 10000).toInt(), builder.build())
    }

    override fun onPaymentSuccess(paymentId: String?, data: com.razorpay.PaymentData?) {
        val orderId = data?.orderId ?: "mock_order"
        val signature = data?.signature ?: "mock_sig"
        
        // Elite server-side verification handshake
        RazorpayManager.onPaymentSuccess(paymentId ?: "", orderId, signature)
        
        viewModel.placeOrder(paymentId ?: "direct_auth")
        Toast.makeText(this, "Master Fulfillment Initialized! 🚀", Toast.LENGTH_LONG).show()
        sendRealNotification("Payment Successful! 🚀", "Order Verified! Your protocol ID is ${paymentId ?: "captured"}")
    }

    override fun onPaymentError(code: Int, msg: String?, data: com.razorpay.PaymentData?) {
        Toast.makeText(this, "Order Disrupted: $msg", Toast.LENGTH_LONG).show()
    }
}

@Composable
fun FastShoppingApp(viewModel: MainViewModel) {
    MaterialTheme {
        val navController = rememberNavController()
        val isLoggedIn by FirebaseAuthRepository.isLoggedIn.collectAsState()

        NavHost(
            navController = navController,
            startDestination = if (isLoggedIn) "home" else "login"
        ) {
            composable("login") {
                LoginScreen(onLoginSuccess = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                })
            }
            composable("home") { MainContainer(navController, viewModel) }
            composable("orders") { ReturnsOrdersScreen(navController, viewModel.products.collectAsState().value) }
            composable("detail/{id}") { backstack ->
                val id = backstack.arguments?.getString("id")
                val product = viewModel.products.collectAsState().value.find { it.id == id }
                product?.let { PremiumDetail(navController, it, viewModel) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainContainer(navController: NavHostController, viewModel: MainViewModel) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val cartItems by viewModel.cartItems.collectAsState()
    val products by viewModel.products.collectAsState()

    Scaffold(
        topBar = { if (selectedTab == 0 || selectedTab == 1 || selectedTab == 4) FuturisticHeader() },
        bottomBar = {
            Surface(shadowElevation = 24.dp, color = Color.White) {
                NavigationBar(containerColor = Color.White, tonalElevation = 8.dp) {
                    val menu = listOf(
                        "Home" to Icons.Default.Home,
                        "You" to Icons.Default.Person,
                        "Wallet" to Icons.Default.AccountBalanceWallet,
                        "Cart" to Icons.Default.ShoppingCart,
                        "Menu" to Icons.Default.Menu
                    )
                    menu.forEachIndexed { index, pair ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            icon = {
                                BadgedBox(badge = {
                                    if (index == 3 && cartItems.isNotEmpty()) Badge { Text("${cartItems.size}") }
                                }) { Icon(pair.second, null) }
                            },
                            label = { Text(pair.first, fontSize = 10.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Color.Black,
                                selectedTextColor = Color.Black,
                                unselectedIconColor = Color.Gray,
                                indicatorColor = Color.Transparent
                            )
                        )
                    }
                }
            }
        }
    ) { padding ->
        Box(Modifier.padding(padding).fillMaxSize().background(Color.White)) {
            when (selectedTab) {
                0 -> AmazonHomeScreen(navController, products, viewModel)
                1 -> AmazonYouScreen(products, viewModel, onSignOut = {
                    FirebaseAuthRepository.signOut()
                    navController.navigate("login") { popUpTo("home") { inclusive = true } }
                })
                2 -> WalletTab(viewModel)
                3 -> PremiumCart(viewModel)
                4 -> AmazonMenuScreen()
            }
        }
    }
}

@Composable
fun FuturisticHeader() {
    Column(Modifier.background(Brush.verticalGradient(listOf(Color(0xFFFFE38E), Color(0xFFFFF1C1)))).padding(bottom = 8.dp)) {
        // --- SEARCH BAR ---
        Row(Modifier.fillMaxWidth().padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
            Surface(
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(8.dp),
                color = Color.White,
                shadowElevation = 2.dp,
                border = BorderStroke(1.dp, Color.LightGray.copy(0.5f))
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(horizontal = 12.dp)) {
                    Icon(Icons.Default.Search, null, tint = Color.Black)
                    Text(" Search for inventory...", color = Color.Gray, modifier = Modifier.weight(1f).padding(start = 8.dp), fontSize = 16.sp)
                    Icon(Icons.Default.CenterFocusStrong, null, tint = Color.Gray, modifier = Modifier.size(20.dp))
                    Spacer(Modifier.width(12.dp))
                    Icon(Icons.Default.Mic, null, tint = RoyalBlue, modifier = Modifier.size(22.dp))
                }
            }
            Spacer(Modifier.width(12.dp))
            Icon(Icons.Default.QrCodeScanner, null, tint = Color.Black, modifier = Modifier.size(28.dp))
        }

        // --- DELIVERY ROW ---
        Row(
            Modifier.fillMaxWidth().background(Color(0xFFCEF1F1)).padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.LocationOn, null, tint = Color.Black, modifier = Modifier.size(18.dp))
            Text(" Deliver to Ankit - Patna 801110", fontSize = 13.sp, modifier = Modifier.padding(start = 8.dp).weight(1f), fontWeight = FontWeight.Medium)
            Surface(color = RoyalBlue, shape = RoundedCornerShape(16.dp)) {
                Text("Join Prime", color = Color.White, modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}



@Composable
fun PremiumDetail(navController: NavHostController, p: FirebaseProduct, viewModel: MainViewModel) {
    Scaffold(
        bottomBar = {
            Surface(shadowElevation = 32.dp, color = Color.White, shape = RoundedCornerShape(topStart = 40.dp, topEnd = 40.dp)) {
                Row(Modifier.padding(24.dp).fillMaxWidth().height(64.dp), Arrangement.spacedBy(16.dp)) {
                    Button(onClick = { viewModel.addToCart(p) }, modifier = Modifier.weight(1f).fillMaxHeight(), shape = RoundedCornerShape(20.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9))) {
                        Text("ADD TO CART", color = Color.Black, fontWeight = FontWeight.Black)
                    }
                    Button(onClick = { /* Start Razorpay Flow */ }, modifier = Modifier.weight(1f).fillMaxHeight(), shape = RoundedCornerShape(20.dp), colors = ButtonDefaults.buttonColors(containerColor = RoyalBlue)) {
                        Text("BUY NOW", color = Color.White, fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    ) { padding ->
        Column(Modifier.padding(padding).fillMaxSize().background(Color.White).verticalScroll(rememberScrollState())) {
            Box(Modifier.height(400.dp).fillMaxWidth().background(Color(0xFFF8FAFC)), contentAlignment = Alignment.Center) {
                AsyncImage(model = p.image, null, Modifier.fillMaxSize().padding(40.dp), contentScale = ContentScale.Fit)
                IconButton(onClick = { navController.popBackStack() }, Modifier.align(Alignment.TopStart).padding(16.dp)) {
                    Icon(Icons.Default.ArrowBackIosNew, null)
                }
            }
            Column(Modifier.padding(28.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
                Text(p.category.uppercase(), color = RoyalBlue, fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 2.sp)
                Text(p.name, fontSize = 28.sp, fontWeight = FontWeight.Black, letterSpacing = (-1).sp, lineHeight = 32.sp)
                
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("₹${p.price.toInt()}", fontSize = 32.sp, fontWeight = FontWeight.Black, color = Color.DarkGray)
                    Text("₹${p.originalPrice.toInt()}", fontSize = 16.sp, color = Color.LightGray, textDecoration = TextDecoration.LineThrough)
                }

                Surface(shape = RoundedCornerShape(24.dp), color = Color.Black, modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(24.dp)) {
                        Text("PRODUCT DETAILS", color = RoyalBlue, fontWeight = FontWeight.Black, fontSize = 10.sp, letterSpacing = 2.sp)
                        Spacer(Modifier.height(8.dp))
                        Text(p.description, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Medium, lineHeight = 22.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun AmazonSquareCard(title: String, product: FirebaseProduct?, modifier: Modifier) {
    Surface(modifier, shape = RoundedCornerShape(12.dp), color = Color.White, shadowElevation = 1.dp) {
        Column(Modifier.padding(12.dp)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 16.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(8.dp))
            product?.let {
                AsyncImage(model = it.image, null, Modifier.height(110.dp).fillMaxWidth(), contentScale = ContentScale.Fit)
            }
        }
    }
}

@Composable
fun AmazonYouScreen(products: List<FirebaseProduct>, viewModel: MainViewModel, onSignOut: () -> Unit = {}) {
    val balance by viewModel.userBalance.collectAsState()
    val recent by viewModel.recentProducts.collectAsState()

    // Get real Firebase user info
    val userName = FirebaseAuthRepository.getDisplayName().ifEmpty { "Guest" }
    val userEmail = FirebaseAuthRepository.getEmail().ifEmpty { "Not signed in" }
    val userPhoto = FirebaseAuthRepository.getPhotoUrl()
    val avatarUrl = userPhoto.ifEmpty { "https://api.dicebear.com/7.x/avataaars/svg?seed=$userName" }

    LazyColumn(Modifier.fillMaxSize().background(Color(0xFFF1F5F9))) {
        item {
            // User header with premium gradient background
            Box(Modifier.fillMaxWidth().height(140.dp).background(Brush.verticalGradient(listOf(Color(0xFF84cc16).copy(0.1f), Color.White)))) {
                Row(Modifier.fillMaxSize().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(Modifier.size(64.dp), shape = CircleShape, border = BorderStroke(2.dp, RoyalBlue)) {
                        AsyncImage(model = avatarUrl, null, contentScale = ContentScale.Crop)
                    }
                    Column(Modifier.weight(1f).padding(start = 16.dp)) {
                        Text("Protocol: $userName", fontWeight = FontWeight.Black, fontSize = 24.sp, letterSpacing = (-1).sp)
                        Text(userEmail, color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Surface(Modifier.padding(top = 4.dp), color = RoyalBlue.copy(0.1f), shape = RoundedCornerShape(4.dp)) {
                            Text(" ELITE PRIME ACCESS ", Modifier.padding(horizontal = 4.dp, vertical = 2.dp), color = RoyalBlue, fontSize = 9.sp, fontWeight = FontWeight.Black)
                        }
                    }
                    IconButton(onClick = { }) { Icon(Icons.Default.Settings, null, tint = Color.DarkGray) }
                }
            }
        }
        
        item {
            // High-speed quick actions
            Row(Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                YouButton("Your Orders", Modifier.weight(1f)) { navController.navigate("orders") }
                YouButton("Buy Again", Modifier.weight(1f))
            }
            Spacer(Modifier.height(10.dp))
            Row(Modifier.padding(horizontal = 16.dp).fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                YouButton("Wishlist Matrix", Modifier.weight(1f))
                YouButton("Account Security", Modifier.weight(1f))
            }
        }

        item {
             Surface(Modifier.fillMaxWidth().padding(16.dp), shape = RoundedCornerShape(16.dp), color = Color.White, shadowElevation = 1.dp) {
                 Column(Modifier.padding(16.dp)) {
                     Row(verticalAlignment = Alignment.CenterVertically) {
                         Icon(Icons.Default.AccountBalanceWallet, null, tint = RoyalBlue, modifier = Modifier.size(20.dp))
                         Text(" Matrix Wallet Balance", fontWeight = FontWeight.Black, fontSize = 14.sp, modifier = Modifier.padding(start = 8.dp))
                         Spacer(Modifier.weight(1f))
                         Text("₹$balance", fontWeight = FontWeight.Black, fontSize = 20.sp, color = RoyalBlue)
                     }
                     Divider(Modifier.padding(vertical = 12.dp), color = Color.LightGray.copy(0.3f))
                     Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                         OutlinedButton(onClick = { viewModel.addBalance(100.0) }, shape = RoundedCornerShape(8.dp), modifier = Modifier.weight(1f)) {
                             Text("ANALYSIS", fontSize = 10.sp, fontWeight = FontWeight.Black)
                         }
                         Button(onClick = { viewModel.addBalance(1000.0) }, shape = RoundedCornerShape(8.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD814)), modifier = Modifier.weight(1f)) {
                             Text("ADD FUNDS", color = Color.Black, fontSize = 10.sp, fontWeight = FontWeight.Black)
                         }
                     }
                 }
             }
        }

        if (recent.isNotEmpty()) {
            item {
                Text("Recently Viewed Protocols", fontWeight = FontWeight.Black, fontSize = 18.sp, modifier = Modifier.padding(start = 16.dp, bottom = 12.dp))
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(recent) { p ->
                        Surface(Modifier.size(140.dp), shape = RoundedCornerShape(20.dp), color = Color.White, border = BorderStroke(1.dp, Color.LightGray.copy(0.2f))) {
                            AsyncImage(model = p.image, null, Modifier.padding(16.dp), contentScale = ContentScale.Fit)
                        }
                    }
                }
            }
        }

        item {
            Text("Personalized Recommendations", fontWeight = FontWeight.Black, fontSize = 18.sp, modifier = Modifier.padding(16.dp))
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(products.shuffled().take(6)) { p ->
                    Surface(Modifier.width(160.dp), shape = RoundedCornerShape(20.dp), color = Color.White, border = BorderStroke(1.dp, Color.LightGray.copy(0.2f))) {
                        Column(Modifier.padding(12.dp)) {
                            AsyncImage(model = p.image, null, Modifier.size(100.dp).align(Alignment.CenterHorizontally), contentScale = ContentScale.Fit)
                            Text(p.name, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text("₹${p.price.toInt()}", fontWeight = FontWeight.Black, fontSize = 14.sp, color = RoyalBlue)
                        }
                    }
                }
            }
        }

        // Sign Out button
        item {
            Spacer(Modifier.height(32.dp))
            TextButton(
                onClick = onSignOut,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(56.dp)
            ) {
                Icon(Icons.Default.Logout, null, tint = Color.Red, modifier = Modifier.size(20.dp))
                Spacer(Modifier.width(8.dp))
                Text("TERMINATE SESSION", color = Color.Red, fontWeight = FontWeight.Black, fontSize = 13.sp, letterSpacing = 1.sp)
            }
            Spacer(Modifier.height(100.dp))
        }
    }
}


@Composable
fun WalletTab(viewModel: MainViewModel) {
    val balance by viewModel.userBalance.collectAsState()
    Column(Modifier.fillMaxSize().background(Color.White)) {
        Surface(Modifier.fillMaxWidth().height(260.dp).padding(16.dp), shape = RoundedCornerShape(24.dp), color = Color(0xFF1E293B)) {
            Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("FAST WALLET PRO", color = Color.White.copy(0.6f), fontSize = 12.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(20.dp))
                Text("Available Balance", color = Color.White.copy(0.8f))
                Text("₹ $balance", color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.weight(1f))
                Button(onClick = { viewModel.addBalance(1000.0) }, colors = ButtonDefaults.buttonColors(containerColor = Color.White), shape = RoundedCornerShape(20.dp), modifier = Modifier.fillMaxWidth().height(50.dp)) {
                    Text("ADD ₹1000 INSTANTLY", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
        Text("Recent Transactions", fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(24.dp))
        LazyColumn(Modifier.padding(horizontal = 24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
             item { TransactionItem("Cashback Received", "+ ₹50.00", Color(0xFF16A34A)) }
             item { TransactionItem("Order FS8273", "- ₹1499.00", Color.Red) }
             item { TransactionItem("Money Added", "+ ₹500.00", Color(0xFF16A34A)) }
             item { TransactionItem("Refund Initiated", "+ ₹299.00", Color(0xFF16A34A)) }
        }
    }
}

@Composable
fun TransactionItem(title: String, amount: String, color: Color) {
    Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween, Alignment.CenterVertically) {
        Column {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text("Yesterday, 4:21 PM", color = Color.Gray, fontSize = 12.sp)
        }
        Text(amount, color = color, fontWeight = FontWeight.Black, fontSize = 16.sp)
    }
}

@Composable
fun PremiumCart(viewModel: MainViewModel) {
    val cartItems by viewModel.cartItems.collectAsState()
    val coupon by viewModel.appliedCoupon.collectAsState()
    val total = viewModel.getCartTotal()

    Column(Modifier.fillMaxSize().background(Color.White)) {
        if (cartItems.isNotEmpty()) {
            Row(Modifier.fillMaxWidth().background(Color(0xFFFEF9C3)).padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                 Icon(Icons.Default.Celebration, null, tint = Color(0xFFB45309))
                 Text(" Extra 20% OFF with FESTIVE20 Coupon!", Modifier.padding(start = 8.dp), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                 Spacer(Modifier.weight(1f))
                 Surface(Modifier.clickable { viewModel.applyCoupon("festive20") }, color = Color.Transparent) {
                     Text(if (coupon != null) "APPLIED" else "APPLY", color = RoyalBlue, fontWeight = FontWeight.Black, fontSize = 12.sp)
                 }
            }
        }
        
        LazyColumn(Modifier.weight(1f)) {
            items(cartItems) { p ->
                Row(Modifier.padding(16.dp).fillMaxWidth()) {
                    AsyncImage(model = p.image, null, Modifier.size(100.dp), contentScale = ContentScale.Fit)
                    Column(Modifier.padding(start = 16.dp).weight(1f)) {
                        Text(p.name, fontWeight = FontWeight.Medium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        Text("₹${p.price.toInt()}", fontWeight = FontWeight.Bold, fontSize = 20.sp)
                        Text("Eligible for FREE Shipping", color = Color(0xFF007600), fontSize = 11.sp, fontWeight = FontWeight.Medium)
                        Row(Modifier.padding(top = 12.dp), verticalAlignment = Alignment.CenterVertically) {
                           Surface(shape = RoundedCornerShape(8.dp), border = BorderStroke(1.dp, Color.LightGray.copy(0.5f))) {
                               Row(Modifier.padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                                   Text("Qty: 1", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                   Icon(Icons.Default.ArrowDropDown, null, Modifier.size(16.dp))
                               }
                           }
                           Spacer(Modifier.width(16.dp))
                           Text("Delete", color = Color(0xFF007185), fontSize = 13.sp, modifier = Modifier.clickable { viewModel.removeFromCart(p) })
                           Spacer(Modifier.width(16.dp))
                           Text("Save for later", color = Color(0xFF007185), fontSize = 13.sp)
                        }
                    }
                }
                Divider(Modifier.padding(horizontal = 16.dp), color = Color.LightGray.copy(0.3f), thickness = 0.5.dp)
            }
            if (cartItems.isNotEmpty()) {
                item {
                    Column(Modifier.padding(24.dp)) {
                         Text("Price Details (${cartItems.size} items)", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                         Spacer(Modifier.height(16.dp))
                         PriceRow("Subtotal", "₹${cartItems.sumOf { it.price }.toInt()}")
                         if (coupon != null) PriceRow("Promotion Applied (20%)", "-₹${(cartItems.sumOf { it.price } * 0.20).toInt()}", Color(0xFF16A34A))
                         PriceRow("Delivery Fee", "₹40.00")
                         Divider(Modifier.padding(vertical = 12.dp), color = Color.LightGray.copy(0.5f))
                         Row(Modifier.fillMaxWidth(), Arrangement.SpaceBetween) {
                             Text("Order Total", fontWeight = FontWeight.Black, fontSize = 20.sp)
                             Text("₹${total.toInt()}", fontWeight = FontWeight.Black, fontSize = 20.sp)
                         }
                    }
                }
                item {
                    Button(onClick = { viewModel.placeOrder("direct") }, modifier = Modifier.padding(24.dp).fillMaxWidth().height(56.dp), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD814)), shape = RoundedCornerShape(8.dp)) {
                        Text("Pay from Wallet (₹${total.toInt()})", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            } else {
                item {
                    Column(Modifier.fillParentMaxSize(), Arrangement.Center, Alignment.CenterHorizontally) {
                        Icon(Icons.Default.ShoppingBasket, null, Modifier.size(80.dp), tint = Color.LightGray.copy(0.5f))
                        Spacer(Modifier.height(16.dp))
                        Text("Your cart is empty", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                        Text("Search for products to add them here.", color = Color.Gray)
                    }
                }
            }
        }
    }
}

@Composable
fun PriceRow(label: String, value: String, valueColor: Color = Color.Black) {
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), Arrangement.SpaceBetween) {
        Text(label, color = Color.Gray, fontSize = 14.sp)
        Text(value, color = valueColor, fontWeight = FontWeight.Medium, fontSize = 14.sp)
    }
}

@Composable
fun SectionHeader(title: String) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 16.dp), Arrangement.SpaceBetween, Alignment.CenterVertically) {
        Text(title, fontWeight = FontWeight.Black, fontSize = 20.sp, letterSpacing = (-0.5).sp)
        Text("SEE ALL", color = RoyalBlue, fontWeight = FontWeight.Black, fontSize = 11.sp, letterSpacing = 1.sp)
    }
}

@Composable
fun FuturisticProductCard(p: FirebaseProduct, onClick: () -> Unit) {
    Surface(Modifier.width(220.dp).padding(8.dp).clickable { onClick() }, shape = RoundedCornerShape(32.dp), color = Color.White, shadowElevation = 2.dp) {
        Column(Modifier.padding(16.dp)) {
            Box(Modifier.height(140.dp).fillMaxWidth()) {
                AsyncImage(model = p.image, null, Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
                Surface(Modifier.align(Alignment.TopEnd), shape = CircleShape, color = Color.White.copy(0.8f)) {
                    Icon(Icons.Default.FavoriteBorder, null, Modifier.padding(8.dp), tint = Color.LightGray)
                }
            }
            Spacer(Modifier.height(12.dp))
            Text(p.name, fontWeight = FontWeight.Bold, fontSize = 14.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 4.dp)) {
                Text("₹${p.price.toInt()}", fontWeight = FontWeight.Black, fontSize = 16.sp, color = RoyalBlue)
                Spacer(Modifier.weight(1f))
                Surface(color = Color(0xFFF0FDF4), shape = CircleShape) {
                    Text("SALE", Modifier.padding(horizontal = 8.dp, vertical = 2.dp), color = Color(0xFF16A34A), fontSize = 9.sp, fontWeight = FontWeight.Black)
                }
            }
        }
    }
}


@Composable
fun AmazonHomeScreen(navController: NavHostController, products: List<FirebaseProduct>, viewModel: MainViewModel) {
    LazyColumn(Modifier.fillMaxSize().background(Color(0xFFF1F5F9))) {
        item {
            LazyRow(Modifier.padding(bottom = 2.dp).background(Color.White).fillMaxWidth()) {
                val menuItems = listOf(
                    Triple("Pay", Color(0xFFFFF9E1), Icons.Default.Payment),
                    Triple("Bazaar", Color(0xFFFFE8E8), Icons.Default.ShoppingBag),
                    Triple("Video", Color(0xFFE8F1FF), Icons.Default.PlayCircle),
                    Triple("Fresh", Color(0xFFEBFFF1), Icons.Default.AddModerator),
                    Triple("Mobiles", Color(0xFFF5F5F5), Icons.Default.Smartphone)
                )
                items(menuItems) { (label, color, icon) ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(16.dp)) {
                        Surface(Modifier.size(54.dp), shape = CircleShape, color = color) {
                            Box(contentAlignment = Alignment.Center) { Icon(icon, null, tint = Color.DarkGray, modifier = Modifier.size(24.dp)) }
                        }
                        Text(label, fontSize = 11.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 6.dp))
                    }
                }
            }
        }

        item {
            Surface(Modifier.fillMaxWidth().padding(12.dp), shape = RoundedCornerShape(12.dp), color = Color(0xFF131921)) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("LIGHTNING DEAL", color = Color(0xFFF59E0B), fontWeight = FontWeight.Black, fontSize = 10.sp, letterSpacing = 1.sp)
                        Text("Ends in 02:45:10", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Black)
                        Text("Save big on electronics", color = Color.White.copy(0.7f), fontSize = 13.sp)
                    }
                    Button(onClick = {}, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF2C911)), shape = RoundedCornerShape(20.dp), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)) {
                        Text("GRAB IT", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }

        item {
            LazyRow(Modifier.padding(vertical = 4.dp)) {
                items(products.take(3)) { p ->
                    Surface(
                        Modifier.width(360.dp).height(240.dp).padding(horizontal = 8.dp).clickable { 
                            viewModel.addToRecent(p)
                            navController.navigate("detail/${p.id}") 
                        },
                        shape = RoundedCornerShape(12.dp), color = Color.White
                    ) {
                        AsyncImage(model = p.image, null, Modifier.fillMaxSize().padding(20.dp), contentScale = ContentScale.Fit)
                    }
                }
            }
        }

        item {
                   })
             }
        }

        item {
            // --- ENTERPRISE MATRIX ANALYTICS ---
            Surface(
                Modifier.fillMaxWidth().padding(12.dp),
                shape = RoundedCornerShape(24.dp),
                color = Color(0xFF0F172A),
                shadowElevation = 8.dp
            ) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(Modifier.size(32.dp), shape = CircleShape, color = RoyalBlue.copy(0.2f)) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.QueryStats, null, tint = RoyalBlue, modifier = Modifier.size(18.dp))
                            }
                        }
                        Column(Modifier.padding(start = 12.dp)) {
                            Text("MATRIX ANALYTICS", color = Color.White, fontWeight = FontWeight.Black, fontSize = 12.sp, letterSpacing = 2.sp)
                            Text("SECURITY STATUS: ENCRYPTED", color = Color(0xFF22C55E), fontSize = 8.sp, fontWeight = FontWeight.Black)
                        }
                        Spacer(Modifier.weight(1f))
                        Icon(Icons.Default.Refresh, null, tint = Color.Gray.copy(0.5f), modifier = Modifier.size(18.dp))
                    }
                    
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Column(Modifier.weight(1f).background(Color.White.copy(0.05f), RoundedCornerShape(16.dp)).padding(12.dp)) {
                            Text("VELOCITY", color = Color.Gray, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            Text("1.2 GB/S", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black)
                        }
                        Column(Modifier.weight(1f).background(Color.White.copy(0.05f), RoundedCornerShape(16.dp)).padding(12.dp)) {
                            Text("NODES", color = Color.Gray, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            Text("14.8K", color = RoyalBlue, fontSize = 16.sp, fontWeight = FontWeight.Black)
                        }
                        Column(Modifier.weight(1f).background(Color.White.copy(0.05f), RoundedCornerShape(16.dp)).padding(12.dp)) {
                            Text("UPLINK", color = Color.Gray, fontSize = 9.sp, fontWeight = FontWeight.Black)
                            Text("99.9%", color = Color(0xFFF59E0B), fontSize = 16.sp, fontWeight = FontWeight.Black)
                        }
                    }
                    
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        LinearProgressIndicator(
                            progress = 0.82f, // Use a literal float here.
                            modifier = Modifier.weight(1f).height(4.dp).clip(CircleShape),
                            color = RoyalBlue,
                            trackColor = Color.White.copy(0.1f)
                        )
                        Text("ACTIVE STREAM: 184 ASSETS", color = Color.White.copy(0.4f), fontSize = 8.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }

        item { SectionHeader("Mega Bank Offers") }
        item {
            Surface(Modifier.fillMaxWidth().padding(horizontal = 16.dp), shape = RoundedCornerShape(8.dp), color = Color(0xFFEFF6FF), border = BorderStroke(1.dp, Color(0xFFBFDBFE))) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.CreditCard, null, tint = RoyalBlue)
                    Text(" 10% Instant Discount on HDFC Bank Cards. T&C Apply.", Modifier.padding(start = 12.dp), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        item { SectionHeader("Fresh Inventory Protocols") }
        item {
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                items(products.reversed().take(5)) { p ->
                    Surface(
                        Modifier.width(180.dp).clickable { 
                            viewModel.addToRecent(p)
                            navController.navigate("detail/${p.id}") 
                        },
                        shape = RoundedCornerShape(24.dp), color = Color.White, border = BorderStroke(1.dp, Color.LightGray.copy(0.2f))
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Box(Modifier.height(110.dp).fillMaxWidth()) {
                                AsyncImage(model = p.image, null, Modifier.fillMaxSize(), contentScale = ContentScale.Fit)
                                Surface(Modifier.align(Alignment.TopEnd), shape = RoundedCornerShape(4.dp), color = Color(0xFF16A34A)) {
                                    Text(" NEW ", Modifier.padding(horizontal = 4.dp, vertical = 2.dp), color = Color.White, fontSize = 8.sp, fontWeight = FontWeight.Black)
                                }
                            }
                            Text(p.name, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text("₹${p.price.toInt()}", fontWeight = FontWeight.Black, color = RoyalBlue)
                        }
                    }
                }
            }
        }

        item { SectionHeader("High-Volume Best Sellers") }
        item {
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                items(products.shuffled().take(5)) { p ->
                    Surface(
                        Modifier.size(100.dp).clickable { 
                            viewModel.addToRecent(p)
                            navController.navigate("detail/${p.id}") 
                        },
                        shape = CircleShape, color = Color.White, border = BorderStroke(1.5.dp, Color(0xFFFFD814))
                    ) {
                        AsyncImage(model = p.image, null, Modifier.padding(16.dp), contentScale = ContentScale.Fit)
                    }
                }
            }
        }

        item { SectionHeader("Recommended Mobiles") }
        item {
            LazyRow(contentPadding = PaddingValues(horizontal = 16.dp)) {
                items(products.filter { it.category == "Mobiles" }) { p ->
                    FuturisticProductCard(p) { 
                        viewModel.addToRecent(p)
                        navController.navigate("detail/${p.id}") 
                    }
                }
            }
        }
        item { Spacer(Modifier.height(20.dp)) }
    }
}

@Composable
fun YouButton(label: String, modifier: Modifier, onClick: () -> Unit = {}) {
    Surface(modifier.clickable { onClick() }, shape = RoundedCornerShape(24.dp), border = BorderStroke(1.dp, Color.LightGray.copy(0.4f)), color = Color(0xFFF1F5F9)) {
        Text(label, Modifier.padding(vertical = 12.dp).fillMaxWidth(), textAlign = TextAlign.Center, fontWeight = FontWeight.Medium, fontSize = 14.sp)
    }
}

@Composable
fun AmazonMenuScreen() {
    var selectedCat by remember { mutableIntStateOf(0) }
    val categories = listOf("Mobiles & Electronics", "Deals & Savings", "Fashion & Beauty", "Home & Furniture", "Groceries", "Bazaar", "Books")
    val icons = listOf(Icons.Default.Smartphone, Icons.Default.Percent, Icons.Default.Checkroom, Icons.Default.Weekend, Icons.Default.LocalGroceryStore, Icons.Default.Storefront, Icons.Default.Book)
    
    Row(Modifier.fillMaxSize().background(Color.White)) {
        Column(Modifier.width(115.dp).fillMaxHeight().background(Color(0xFFF7F8F8))) {
            categories.forEachIndexed { index, cat ->
                Column(Modifier.fillMaxWidth().height(90.dp).clickable { selectedCat = index }
                    .background(if (selectedCat == index) Color.White else Color.Transparent)
                    .padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Icon(icons[index], null, tint = if (selectedCat == index) RoyalBlue else Color.Gray, modifier = Modifier.size(24.dp))
                    Spacer(Modifier.height(4.dp))
                    Text(cat, textAlign = TextAlign.Center, fontSize = 10.sp, fontWeight = if (selectedCat == index) FontWeight.Bold else FontWeight.Normal, lineHeight = 12.sp)
                }
            }
        }
        LazyVerticalGrid(columns = GridCells.Fixed(3), Modifier.weight(1f).padding(12.dp), verticalArrangement = Arrangement.spacedBy(16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            val subItems = listOf("Mobiles", "Laptops", "TVs", "Audio", "Watches", "Gaming", "Cameras", "Appliances", "Tablets", "Printers", "Software", "Monitors")
            items(subItems) { item ->
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(4.dp)) {
                    Surface(Modifier.size(64.dp), shape = RoundedCornerShape(12.dp), color = Color(0xFFF1F5F9)) {
                         Box(contentAlignment = Alignment.Center) { Icon(Icons.Default.Image, null, tint = Color.LightGray) }
                    }
                    Text(item, fontSize = 10.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp), lineHeight = 12.sp, fontWeight = FontWeight.Medium)
                }
            }
        }
    }
}

@Composable
fun ReturnsOrdersScreen(navController: NavHostController, products: List<FirebaseProduct>) {
    Column(Modifier.fillMaxSize().background(Color.White)) {
        // Professional Header
        Surface(Modifier.fillMaxWidth(), shadowElevation = 8.dp, color = Color.White) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.Default.ArrowBackIosNew, null, tint = Color.Black)
                }
                Text("RETURNS & ORDERS", fontSize = 18.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                Spacer(Modifier.weight(1f))
                Icon(Icons.Default.FilterList, null, tint = RoyalBlue)
            }
        }

        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(20.dp), modifier = Modifier.weight(1f)) {
            item {
                Text("Command Center", fontWeight = FontWeight.Black, color = Color.Gray, fontSize = 11.sp, letterSpacing = 2.sp)
                Spacer(Modifier.height(8.dp))
            }

            items(products.take(3)) { p ->
                Surface(
                    Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    border = BorderStroke(1.dp, Color.LightGray.copy(0.3f)),
                    color = Color.White
                ) {
                    Column(Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(Modifier.size(70.dp), shape = RoundedCornerShape(16.dp), color = Color(0xFFF8FAFC)) {
                                AsyncImage(model = p.image, null, Modifier.padding(12.dp), contentScale = ContentScale.Fit)
                            }
                            Column(Modifier.padding(start = 16.dp).weight(1f)) {
                                Text(p.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                Text("Delivered on Oct 24, 2023", color = Color(0xFF16A34A), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            Icon(Icons.Default.ChevronRight, null, tint = Color.LightGray)
                        }

                        Divider(Modifier.padding(vertical = 16.dp), color = Color.LightGray.copy(0.2f))

                        // Logistics Protocol Visualization
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            LogisticsNode("Ordered", true)
                            LogisticsNode("Shipped", true)
                            LogisticsNode("Out for Delivery", true)
                            LogisticsNode("Arrived", true)
                        }

                        Spacer(Modifier.height(20.dp))

                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { /* Initiate Return Protocol */ },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9)),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("RETURN", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 11.sp)
                            }
                            Button(
                                onClick = { /* Buy Again */ },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = RoyalBlue),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("BUY AGAIN", color = Color.White, fontWeight = FontWeight.Black, fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LogisticsNode(label: String, isActive: Boolean) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Surface(
            Modifier.size(10.dp),
            shape = CircleShape,
            color = if (isActive) Color(0xFF16A34A) else Color.LightGray
        ) {}
        Spacer(Modifier.height(4.dp))
        Text(label, fontSize = 8.sp, fontWeight = FontWeight.Black, color = if (isActive) Color.Black else Color.Gray)
    }
}

