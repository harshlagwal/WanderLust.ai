import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  Auth,
  UserCredential
} from 'firebase/auth';

export interface AuthResult {
  user: any;
  method: 'popup' | 'redirect';
  error?: string;
}

class GoogleAuthService {
  private provider: GoogleAuthProvider;

  constructor() {
    this.provider = new GoogleAuthProvider();
    // Add scopes if needed
    this.provider.addScope('profile');
    this.provider.addScope('email');
  }

  /**
   * Attempts to sign in with Google using popup method.
   * Falls back to redirect method if popup is blocked or fails.
   */
  async signInWithGoogle(auth: Auth): Promise<AuthResult> {
    try {
      // Check if popup is blocked by attempting to open a test window
      const popupBlocked = this.isPopupBlocked();

      if (popupBlocked) {
        // If popup is likely blocked, use redirect method directly
        console.log('[AUTH] Popup appears to be blocked, using redirect method');
        return await this.signInWithGoogleRedirect(auth);
      }

      // Try popup method first
      console.log('[AUTH] Attempting Google sign-in with popup');
      const result = await signInWithPopup(auth, this.provider);
      return {
        user: result.user,
        method: 'popup'
      };
    } catch (error: any) {
      console.error('[AUTH] Popup sign-in failed:', error);

      // Check if the error is specifically related to popup closure
      if (this.isPopupError(error)) {
        console.log('[AUTH] Popup closed or blocked, falling back to redirect method');
        return await this.signInWithGoogleRedirect(auth);
      }

      // For other errors, re-throw
      throw error;
    }
  }

  /**
   * Signs in with Google using redirect method
   */
  private async signInWithGoogleRedirect(auth: Auth): Promise<AuthResult> {
    try {
      console.log('[AUTH] Attempting Google sign-in with redirect');
      await signInWithRedirect(auth, this.provider);
      // Note: For redirect, the user will be redirected and will return on page reload
      // The actual result will be handled by the onAuthStateChanged listener
      return {
        user: null, // Will be available after redirect
        method: 'redirect'
      };
    } catch (error: any) {
      console.error('[AUTH] Redirect sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Checks if popup is likely blocked
   */
  private isPopupBlocked(): boolean {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false;
      }

      // Check for common popup blockers by attempting to open a window
      const testPopup = window.open('', 'test', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        return false;
      }
      return true;
    } catch (e) {
      // If an exception is thrown, popup is likely blocked
      return true;
    }
  }

  /**
   * Determines if the error is related to popup closure
   */
  private isPopupError(error: any): boolean {
    return error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/cancelled-popup-request';
  }

  /**
   * Handles the redirect result when the user returns from Google authentication
   */
  async handleRedirectResult(auth: Auth): Promise<AuthResult | null> {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('[AUTH] Redirect result obtained:', result.user.email);
        return {
          user: result.user,
          method: 'redirect'
        };
      }
      return null;
    } catch (error: any) {
      console.error('[AUTH] Error getting redirect result:', error);
      throw error;
    }
  }

  /**
   * Checks if we just returned from a redirect-based sign-in
   */
  async checkRedirectResult(auth: Auth): Promise<AuthResult | null> {
    // For Firebase, we rely on the onAuthStateChanged listener
    // But we can check if the user is now available
    const user = auth.currentUser;
    if (user) {
      return {
        user,
        method: 'redirect'
      };
    }
    return null;
  }
}

// Create a singleton instance
const googleAuthService = new GoogleAuthService();
export default googleAuthService;
