package com.fastshopping.firebase

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.ktx.Firebase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.tasks.await

/**
 * Fast Shopping — Firebase Auth Repository (Android)
 * Handles: Email/Password, Google Sign-In, State Observation
 */
object FirebaseAuthRepository {

    private val auth: FirebaseAuth = Firebase.auth
    private val database = FirebaseDatabase.getInstance()

    // ── AUTH STATE ────────────────────────────────────────────────────────────
    private val _currentUser = MutableStateFlow<FirebaseUser?>(auth.currentUser)
    val currentUser: StateFlow<FirebaseUser?> = _currentUser

    private val _isLoggedIn = MutableStateFlow(auth.currentUser != null)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn

    init {
        // Listen for auth state changes in real time
        auth.addAuthStateListener { firebaseAuth ->
            _currentUser.value = firebaseAuth.currentUser
            _isLoggedIn.value = firebaseAuth.currentUser != null
        }
    }

    // ── EMAIL / PASSWORD ──────────────────────────────────────────────────────

    /**
     * Sign in with email and password.
     * @return Result.success(FirebaseUser) or Result.failure(Exception)
     */
    suspend fun signInWithEmail(email: String, password: String): Result<FirebaseUser> {
        return try {
            val result = auth.signInWithEmailAndPassword(email, password).await()
            Result.success(result.user!!)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Register a new user with email, password, and display name.
     */
    suspend fun registerWithEmail(
        name: String,
        email: String,
        password: String,
        phone: String = ""
    ): Result<FirebaseUser> {
        return try {
            val result = auth.createUserWithEmailAndPassword(email, password).await()
            val user = result.user!!

            // Update display name
            val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest.Builder()
                .setDisplayName(name)
                .build()
            user.updateProfile(profileUpdates).await()

            // Save extra user data to Realtime DB
            saveUserToDatabase(user.uid, name, email, phone)

            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── GOOGLE SIGN-IN ────────────────────────────────────────────────────────

    /**
     * Complete Google Sign-In with the ID token from Google Sign-In client.
     */
    suspend fun signInWithGoogle(idToken: String): Result<FirebaseUser> {
        return try {
            val credential = GoogleAuthProvider.getCredential(idToken, null)
            val result = auth.signInWithCredential(credential).await()
            val user = result.user!!

            // Save to DB if new user
            if (result.additionalUserInfo?.isNewUser == true) {
                saveUserToDatabase(
                    uid = user.uid,
                    name = user.displayName ?: "User",
                    email = user.email ?: "",
                    phone = user.phoneNumber ?: ""
                )
            }

            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── PASSWORD RESET ────────────────────────────────────────────────────────

    suspend fun sendPasswordResetEmail(email: String): Result<Unit> {
        return try {
            auth.sendPasswordResetEmail(email).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ── SIGN OUT ──────────────────────────────────────────────────────────────

    fun signOut() {
        auth.signOut()
    }

    // ── HELPERS ───────────────────────────────────────────────────────────────

    private fun saveUserToDatabase(uid: String, name: String, email: String, phone: String) {
        val userData = mapOf(
            "uid" to uid,
            "name" to name,
            "email" to email,
            "phone" to phone,
            "created_at" to System.currentTimeMillis(),
            "wallet_balance" to 5000.0,
            "is_prime" to false
        )
        database.getReference("users").child(uid).setValue(userData)
    }

    fun getDisplayName(): String = auth.currentUser?.displayName ?: "User"
    fun getEmail(): String = auth.currentUser?.email ?: ""
    fun getPhotoUrl(): String = auth.currentUser?.photoUrl?.toString() ?: ""
    fun getUid(): String = auth.currentUser?.uid ?: ""
}
