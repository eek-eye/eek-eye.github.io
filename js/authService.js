// Auth Service - Centralized Firebase Authentication
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuZpT46hKccS6-t2b4-gWXF93BNBu9ErQ",
    authDomain: "eeks-eye.firebaseapp.com",
    projectId: "eeks-eye",
    storageBucket: "eeks-eye.firebasestorage.app",
    messagingSenderId: "662530364021",
    appId: "1:662530364021:web:454ba95f835655502c9e3c",
    measurementId: "G-3Q7X3M2KRN"
};

// Initialize Firebase (only if not already initialized)
let app;
const apps = getApps();
if (apps.length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = apps[0];
}

// Get Auth instance
const auth = getAuth(app);

// Auth Service Class
class AuthService {
    constructor() {
        this.auth = auth;
    }

    /**
     * Sign in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - User credential
     */
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} - User credential
     */
    async signUp(email, password) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign in with Google
     * @returns {Promise} - User credential
     */
    async signInWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Sign out current user
     * @returns {Promise}
     */
    async signOut() {
        try {
            await signOut(this.auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Send password reset email
     * @param {string} email - User email
     * @returns {Promise}
     */
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return { success: true };
        } catch (error) {
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }

    /**
     * Get current user
     * @returns {Object|null} - Current user or null
     */
    getCurrentUser() {
        return this.auth.currentUser;
    }

    /**
     * Listen to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    /**
     * Convert error code to user-friendly message
     * @param {string} errorCode - Firebase error code
     * @returns {string} - Error message
     */
    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
                return 'No account found with this email';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'This email is already registered';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            case 'auth/popup-blocked':
                return 'Popup was blocked by the browser';
            case 'auth/popup-closed-by-user':
                return 'Sign in was cancelled';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection';
            default:
                return 'An error occurred. Please try again';
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;

