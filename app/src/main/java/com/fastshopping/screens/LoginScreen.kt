package com.fastshopping.screens

import android.app.Activity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fastshopping.firebase.FirebaseAuthRepository
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.auth.api.signin.GoogleSignInStatusCodes
import com.google.android.gms.common.api.ApiException
import kotlinx.coroutines.launch

// ── Brand Colors ──────────────────────────────────────────────────────────────
private val RoyalBlue  = Color(0xFF2563EB)
private val DeepPurple = Color(0xFF7C3AED)
private val DarkBG     = Color(0xFF0F172A)

private const val WEB_CLIENT_ID =
    "712353400797-b8lt5cuthbbkjj75opjg9lget7rs4jod.apps.googleusercontent.com"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {

    var mode          by remember { mutableStateOf("login") } // login | register | forgot
    var name          by remember { mutableStateOf("") }
    var email         by remember { mutableStateOf("") }
    var phone         by remember { mutableStateOf("") }
    var password      by remember { mutableStateOf("") }
    var showPassword  by remember { mutableStateOf(false) }
    var loading       by remember { mutableStateOf(false) }
    var googleLoading by remember { mutableStateOf(false) }
    var errorMsg      by remember { mutableStateOf("") }
    var infoMsg       by remember { mutableStateOf("") }

    // ── FIXED: Get Activity properly via LocalContext ─────────────────────────
    val context  = LocalContext.current
    val activity = context as? Activity
    val scope    = rememberCoroutineScope()
    val snackbar = remember { SnackbarHostState() }

    // ── Google Sign-In Launcher ───────────────────────────────────────────────
    val googleLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        scope.launch {
            googleLoading = true
            errorMsg = ""
            try {
                val task    = GoogleSignIn.getSignedInAccountFromIntent(result.data)
                val account = task.getResult(ApiException::class.java)
                val idToken = account.idToken

                if (idToken == null) {
                    // idToken is null — means Google Sign-In succeeded but Firebase
                    // couldn't get a token (common if OAuth not fully set up).
                    // Fallback: auto-login with email from Google account
                    val gEmail = account.email ?: ""
                    val gName  = account.displayName ?: gEmail.substringBefore("@")
                    if (gEmail.isNotEmpty()) {
                        // Try registering with a deterministic password
                        val gPass = "GOOGLE_${account.id?.take(12) ?: "user123"}"
                        val reg = FirebaseAuthRepository.registerWithEmail(gName, gEmail, gPass)
                        if (reg.isSuccess) {
                            snackbar.showSnackbar("Welcome, $gName! 🎉")
                            onLoginSuccess()
                        } else {
                            // Already registered — try signing in
                            val login = FirebaseAuthRepository.signInWithEmail(gEmail, gPass)
                            if (login.isSuccess) {
                                snackbar.showSnackbar("Welcome back, $gName! 🎉")
                                onLoginSuccess()
                            } else {
                                errorMsg = "Google login succeeded but Firebase sync failed. Try email/password."
                            }
                        }
                    } else {
                        errorMsg = "Could not get email from Google. Try email/password login."
                    }
                } else {
                    // Normal flow: use Firebase credential
                    val authResult = FirebaseAuthRepository.signInWithGoogle(idToken)
                    if (authResult.isSuccess) {
                        snackbar.showSnackbar("Welcome, ${account.displayName}! 🎉")
                        onLoginSuccess()
                    } else {
                        errorMsg = "Google Sign-In failed. Try email/password."
                    }
                }
            } catch (e: ApiException) {
                // Translate ApiException status codes to user-friendly messages
                errorMsg = when (e.statusCode) {
                    GoogleSignInStatusCodes.SIGN_IN_CANCELLED       -> "" // user cancelled — no error shown
                    GoogleSignInStatusCodes.SIGN_IN_CURRENTLY_IN_PROGRESS -> "Sign-in already in progress"
                    GoogleSignInStatusCodes.SIGN_IN_FAILED          -> "Google Sign-In failed. Check internet."
                    GoogleSignInStatusCodes.NETWORK_ERROR           -> "No internet connection"
                    12500 -> "SHA-1 not registered. Use email/password for now." // DEVELOPER_ERROR
                    12501 -> "" // user cancelled
                    else  -> "Google Sign-In error (${e.statusCode}). Try email login."
                }
            } catch (e: Exception) {
                errorMsg = "Unexpected error: ${e.message}"
            } finally {
                googleLoading = false
            }
        }
    }

    fun launchGoogle() {
        if (activity == null) { errorMsg = "Activity not found. Try email login."; return }
        errorMsg = ""
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(WEB_CLIENT_ID)
            .requestEmail()
            .requestProfile()
            .build()
        val client = GoogleSignIn.getClient(activity, gso)
        // Always sign out first to show account picker
        client.signOut().addOnCompleteListener {
            try { googleLauncher.launch(client.signInIntent) }
            catch (e: Exception) { errorMsg = "Cannot open Google Sign-In: ${e.message}" }
        }
    }

    // ── Email / Password Handler ──────────────────────────────────────────────
    fun handleSubmit() {
        errorMsg = ""
        if (email.isBlank() || !email.contains("@")) { errorMsg = "Enter a valid email"; return }
        if (mode != "forgot" && password.length < 6)  { errorMsg = "Password must be 6+ chars"; return }
        if (mode == "register" && name.isBlank())      { errorMsg = "Enter your full name"; return }

        scope.launch {
            loading = true
            try {
                when (mode) {
                    "login" -> {
                        val r = FirebaseAuthRepository.signInWithEmail(email.trim(), password)
                        if (r.isSuccess) { snackbar.showSnackbar("Welcome back! 🎉"); onLoginSuccess() }
                        else errorMsg = friendlyError(r.exceptionOrNull()?.message ?: "")
                    }
                    "register" -> {
                        val r = FirebaseAuthRepository.registerWithEmail(name.trim(), email.trim(), password, phone.trim())
                        if (r.isSuccess) { snackbar.showSnackbar("Account created! 🚀"); onLoginSuccess() }
                        else errorMsg = friendlyError(r.exceptionOrNull()?.message ?: "")
                    }
                    "forgot" -> {
                        val r = FirebaseAuthRepository.sendPasswordResetEmail(email.trim())
                        if (r.isSuccess) { infoMsg = "Reset email sent! Check inbox."; mode = "login" }
                        else errorMsg = "Could not send reset email."
                    }
                }
            } finally { loading = false }
        }
    }

    // ── UI ────────────────────────────────────────────────────────────────────
    Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { pad ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(pad)
                .verticalScroll(rememberScrollState())
                .background(Color.White)
        ) {

            // ── BRAND HERO ──────────────────────────────────────────────────
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(240.dp)
                    .background(Brush.verticalGradient(listOf(DarkBG, Color(0xFF1E3A5F)))),
                contentAlignment = Alignment.Center
            ) {
                val inf = rememberInfiniteTransition(label = "blob")
                val sc  by inf.animateFloat(
                    initialValue = 0.9f, targetValue = 1.1f,
                    animationSpec = infiniteRepeatable(tween(2000), RepeatMode.Reverse),
                    label = "bs"
                )
                /* animated blobs */
                Box(Modifier.size(160.dp * sc).clip(CircleShape)
                    .background(RoyalBlue.copy(.12f)).align(Alignment.CenterStart).offset(x = (-50).dp))
                Box(Modifier.size(110.dp).clip(CircleShape)
                    .background(DeepPurple.copy(.12f)).align(Alignment.BottomEnd).offset(x = 35.dp, y = 35.dp))

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier.size(60.dp)
                            .background(Brush.linearGradient(listOf(RoyalBlue, DeepPurple)), RoundedCornerShape(18.dp)),
                        contentAlignment = Alignment.Center
                    ) { Icon(Icons.Default.FlashOn, null, tint = Color.White, modifier = Modifier.size(30.dp)) }

                    Spacer(Modifier.height(12.dp))
                    Text("Fast Shopping", color = Color.White, fontWeight = FontWeight.Black, fontSize = 26.sp, letterSpacing = (-1).sp)
                    Text("FUTURE OF RETAIL", color = Color.White.copy(.5f), fontWeight = FontWeight.Bold, fontSize = 10.sp, letterSpacing = 4.sp)
                    Spacer(Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("🚀 Fast Delivery", "🔒 Secure", "⭐ 4.8 Rated").forEach { l ->
                            Surface(shape = RoundedCornerShape(20.dp), color = Color.White.copy(.12f)) {
                                Text(l, Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    color = Color.White.copy(.85f), fontSize = 10.sp, fontWeight = FontWeight.Medium)
                            }
                        }
                    }
                }
            }

            // ── FORM ────────────────────────────────────────────────────────
            Column(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp).offset(y = (-16).dp)
            ) {

                // Tab switcher
                if (mode != "forgot") {
                    Row(
                        modifier = Modifier.fillMaxWidth()
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(14.dp))
                            .padding(4.dp)
                    ) {
                        listOf("login" to "Sign In", "register" to "Create Account").forEach { (k, lbl) ->
                            Box(
                                Modifier.weight(1f).clip(RoundedCornerShape(11.dp))
                                    .background(if (mode == k) Color.White else Color.Transparent)
                                    .clickable { mode = k; errorMsg = "" }
                                    .padding(vertical = 11.dp),
                                Alignment.Center
                            ) {
                                Text(lbl, fontWeight = if (mode == k) FontWeight.Black else FontWeight.Normal,
                                    fontSize = 13.sp, color = if (mode == k) Color.Black else Color.Gray)
                            }
                        }
                    }
                    Spacer(Modifier.height(18.dp))
                }

                // Heading
                Text(
                    when (mode) { "register" -> "Join Us"; "forgot" -> "Reset Password"; else -> "Welcome Back" },
                    fontSize = 30.sp, fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, letterSpacing = (-1).sp
                )
                Text(
                    when (mode) { "register" -> "Create your account in seconds"; "forgot" -> "We'll send a reset link to your email"; else -> "Sign in to your account" },
                    color = Color.Gray, fontSize = 13.sp, modifier = Modifier.padding(bottom = 18.dp)
                )

                // Info banner (e.g. reset email sent)
                if (infoMsg.isNotEmpty()) {
                    Surface(Modifier.fillMaxWidth().padding(bottom = 12.dp), shape = RoundedCornerShape(10.dp), color = Color(0xFFDCFCE7)) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.CheckCircle, null, tint = Color(0xFF16A34A), modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(infoMsg, color = Color(0xFF15803D), fontSize = 13.sp)
                        }
                    }
                }

                // ── GOOGLE BUTTON ──────────────────────────────────────────
                if (mode != "forgot") {
                    OutlinedButton(
                        onClick = { launchGoogle() },
                        modifier = Modifier.fillMaxWidth().height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        border = BorderStroke(1.5.dp, Color(0xFFE2E8F0)),
                        enabled = !googleLoading && !loading
                    ) {
                        if (googleLoading) {
                            CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp, color = RoyalBlue)
                        } else {
                            /* Coloured G */
                            Text("G", color = Color(0xFF4285F4), fontWeight = FontWeight.Black, fontSize = 20.sp)
                            Spacer(Modifier.width(10.dp))
                            Text("Continue with Google", fontWeight = FontWeight.SemiBold, color = Color(0xFF374151), fontSize = 14.sp)
                        }
                    }

                    // OR divider
                    Row(Modifier.padding(vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                        Divider(Modifier.weight(1f), color = Color(0xFFE2E8F0))
                        Text("  OR  ", color = Color(0xFFCBD5E1), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Divider(Modifier.weight(1f), color = Color(0xFFE2E8F0))
                    }
                }

                // ── FIELDS ────────────────────────────────────────────────
                if (mode == "register") {
                    FSField(name, { name = it }, "Full Name", Icons.Default.Person)
                    Spacer(Modifier.height(10.dp))
                }

                FSField(email, { email = it }, "Email Address", Icons.Default.Email, KeyboardType.Email)

                if (mode == "register") {
                    Spacer(Modifier.height(10.dp))
                    FSField(phone, { phone = it }, "Phone (optional)", Icons.Default.Phone, KeyboardType.Phone)
                }

                if (mode != "forgot") {
                    Spacer(Modifier.height(10.dp))
                    FSField(
                        value = password, onValueChange = { password = it },
                        label = "Password", icon = Icons.Default.Lock,
                        keyboardType = KeyboardType.Password,
                        visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        trailingIcon = {
                            IconButton(onClick = { showPassword = !showPassword }) {
                                Icon(if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility, null, tint = Color.Gray)
                            }
                        }
                    )
                }

                if (mode == "login") {
                    TextButton(onClick = { mode = "forgot"; errorMsg = "" }, modifier = Modifier.align(Alignment.End)) {
                        Text("Forgot Password?", color = RoyalBlue, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }

                // Error box
                AnimatedVisibility(visible = errorMsg.isNotEmpty()) {
                    Surface(Modifier.fillMaxWidth().padding(vertical = 8.dp), shape = RoundedCornerShape(10.dp), color = Color(0xFFFEE2E2)) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ErrorOutline, null, tint = Color.Red, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(errorMsg, color = Color(0xFF991B1B), fontSize = 13.sp)
                        }
                    }
                }

                Spacer(Modifier.height(8.dp))

                // ── SUBMIT BUTTON ──────────────────────────────────────────
                Button(
                    onClick = { handleSubmit() },
                    modifier = Modifier.fillMaxWidth().height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = DarkBG),
                    enabled = !loading && !googleLoading
                ) {
                    if (loading) {
                        CircularProgressIndicator(Modifier.size(22.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Text(
                            when (mode) { "register" -> "Create Account →"; "forgot" -> "Send Reset Email"; else -> "Sign In →" },
                            fontWeight = FontWeight.Black, fontStyle = FontStyle.Italic, fontSize = 15.sp
                        )
                    }
                }

                if (mode == "forgot") {
                    TextButton(onClick = { mode = "login"; errorMsg = "" }, Modifier.fillMaxWidth()) {
                        Text("← Back to Sign In", color = Color.Gray, fontSize = 13.sp)
                    }
                }

                // Firebase badge
                Row(Modifier.fillMaxWidth().padding(vertical = 14.dp), Arrangement.Center, Alignment.CenterVertically) {
                    Icon(Icons.Default.Shield, null, tint = Color(0xFF16A34A), modifier = Modifier.size(13.dp))
                    Spacer(Modifier.width(5.dp))
                    Text("SECURED BY FIREBASE AUTHENTICATION", color = Color(0xFFCBD5E1), fontSize = 9.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                }

                // Demo credentials
                if (mode == "login") {
                    Surface(
                        Modifier.fillMaxWidth().padding(bottom = 24.dp),
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFFEFF6FF),
                        border = BorderStroke(1.dp, Color(0xFFBFDBFE))
                    ) {
                        Column(Modifier.padding(12.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Info, null, tint = RoyalBlue, modifier = Modifier.size(13.dp))
                                Spacer(Modifier.width(5.dp))
                                Text("DEMO CREDENTIALS", color = RoyalBlue, fontWeight = FontWeight.Black, fontSize = 10.sp, letterSpacing = 1.sp)
                            }
                            Spacer(Modifier.height(5.dp))
                            Text("👤 user@fastshopping.com / User@123", color = Color(0xFF1D4ED8), fontSize = 12.sp,
                                modifier = Modifier.clickable { email = "user@fastshopping.com"; password = "User@123" })
                            Text("🔑 admin@fastshopping.com / Admin@123", color = Color(0xFF1D4ED8), fontSize = 12.sp,
                                modifier = Modifier.clickable { email = "admin@fastshopping.com"; password = "Admin@123" })
                            Spacer(Modifier.height(4.dp))
                            Text("↑ Tap to auto-fill credentials", color = Color(0xFF93C5FD), fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

// ── Reusable Field ────────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FSField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    keyboardType: KeyboardType = KeyboardType.Text,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailingIcon: @Composable (() -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, fontSize = 13.sp) },
        leadingIcon = { Icon(icon, null, tint = Color(0xFF94A3B8), modifier = Modifier.size(20.dp)) },
        trailingIcon = trailingIcon,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        visualTransformation = visualTransformation,
        singleLine = true,
        colors = OutlinedTextFieldDefaults.colors(
            unfocusedBorderColor = Color(0xFFE2E8F0),
            focusedBorderColor   = Color(0xFF2563EB),
            unfocusedContainerColor = Color(0xFFF8FAFC),
            focusedContainerColor   = Color.White,
        )
    )
}

// ── Error message mapper ──────────────────────────────────────────────────────
private fun friendlyError(msg: String) = when {
    "INVALID_LOGIN_CREDENTIALS" in msg ||
    "wrong-password"            in msg -> "Incorrect email or password"
    "user-not-found"            in msg -> "No account found. Please register."
    "email-already-in-use"      in msg -> "Email already registered. Sign in instead."
    "weak-password"             in msg -> "Weak password — use 6+ characters"
    "invalid-email"             in msg -> "Invalid email address"
    "too-many-requests"         in msg -> "Too many attempts. Wait a moment."
    "network"                   in msg -> "No internet connection"
    else -> "Authentication failed. Please try again."
}
