import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyASxmKuFJTFayVo0fQjmRBHdWT9vyEB5Jk',
  authDomain: 'bounty-c1dfb.firebaseapp.com',
  projectId: 'bounty-c1dfb',
  storageBucket: 'bounty-c1dfb.firebasestorage.app',
  messagingSenderId: '860757418911',
  appId: '1:860757418911:web:2ef747d6c0249ac20d13aa',
  measurementId: 'G-Q02Y9J8HE1',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics optional in restricted environments
    });
}

export function mapAuthError(err: unknown): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please check your details and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled yet in the Firebase Console for project bounty-c1dfb.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/unauthorized-domain':
      return 'This preview domain is not yet allowlisted in Firebase Auth Authorized Domains.';
    default:
      return err instanceof Error ? err.message : 'Authentication request failed.';
  }
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  if (name.trim()) {
    await updateProfile(cred.user, { displayName: name.trim() });
  }
  return cred;
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export async function updateUserProfileName(user: User, displayName: string) {
  return updateProfile(user, { displayName: displayName.trim() });
}

export async function signOutUser() {
  return signOut(auth);
}

export { onAuthStateChanged, type User };
