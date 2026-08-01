'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { auth } from './firebase'
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile
  const fetchUserProfile = async (phoneNumber) => {
    try {
      const encodedPhone = encodeURIComponent(phoneNumber)
      const response = await fetch(`/api/users/${encodedPhone}`)
      const data = await response.json()
      if (data.success) {
        setUserProfile(data.user)
        return data.user
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  useEffect(() => {
    // If Firebase auth is not initialized, set loading to false and return
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch user profile from backend with encoded phone
        await fetchUserProfile(firebaseUser.phoneNumber)
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const RECAPTCHA_ID = 'recaptcha-container'

  // Fully tear down the reCAPTCHA widget.
  //
  // verifier.clear() unregisters the widget with grecaptcha but it does NOT
  // remove the markup grecaptcha injected into the host element. If we then
  // build a new RecaptchaVerifier over that same dirty node, the new widget
  // never solves and Firebase rejects the request with captcha-check-failed.
  // That is why a mistyped phone number used to poison every later attempt
  // until the page was reloaded. Replacing the host node gives each attempt a
  // clean element to render into.
  const destroyRecaptcha = () => {
    if (typeof window === 'undefined') return

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear()
      } catch (e) {
        // Already torn down - nothing to do.
      }
      window.recaptchaVerifier = null
    }

    const stale = document.getElementById(RECAPTCHA_ID)
    if (stale) {
      const fresh = document.createElement('div')
      fresh.id = RECAPTCHA_ID
      stale.replaceWith(fresh)
    }
  }

  const setupRecaptcha = () => {
    if (typeof window === 'undefined' || !auth) return null

    destroyRecaptcha()

    // The container normally lives in layout.js, but recreate it if a previous
    // teardown or a route change removed it.
    if (!document.getElementById(RECAPTCHA_ID)) {
      const host = document.createElement('div')
      host.id = RECAPTCHA_ID
      document.body.appendChild(host)
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_ID, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Tear the widget down properly so the next attempt starts clean.
        destroyRecaptcha()
      }
    })

    return window.recaptchaVerifier
  }

  // Firebase surfaces raw codes like "auth/invalid-phone-number"; show something
  // a customer can act on instead.
  const friendlyAuthError = (error) => {
    const code = (error && error.code) || ''
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'That phone number does not look right. Please check and try again.'
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few minutes and try again.'
      case 'auth/captcha-check-failed':
      case 'auth/missing-verification-code':
        return 'Verification failed. Please try again.'
      case 'auth/quota-exceeded':
        return 'We could not send an OTP right now. Please try again shortly.'
      default:
        return (error && error.message) || 'Something went wrong. Please try again.'
    }
  }

  const sendOTP = async (phoneNumber) => {
    if (!auth) {
      return { success: false, error: 'Authentication service is not available' }
    }
    try {
      // Format phone number for Firebase (must include country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      
      const recaptchaVerifier = setupRecaptcha()
      if (!recaptchaVerifier) {
        return { success: false, error: 'Could not start verification. Please reload the page and try again.' }
      }

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)

      return { success: true, confirmationResult }
    } catch (error) {
      console.error('Error sending OTP:', error)

      // Always tear the widget down on failure. A wrong number, a rejected
      // captcha or a rate limit all leave a spent widget behind, and reusing
      // it is what produced the "captcha failed" loop on the retry.
      destroyRecaptcha()

      return { success: false, error: friendlyAuthError(error) }
    }
  }

  const verifyOTP = async (confirmationResult, otp) => {
    try {
      const result = await confirmationResult.confirm(otp)
      // After verification, fetch the user profile
      if (result.user) {
        // First, try to store/update user in MongoDB
        try {
          await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: result.user.uid,
              phone: result.user.phoneNumber,
              createdAt: new Date().toISOString()
            })
          })
        } catch (e) {
          console.error('Error storing user data:', e)
        }
        await fetchUserProfile(result.user.phoneNumber)
      }
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    if (!auth) {
      setUser(null)
      setUserProfile(null)
      return { success: true }
    }
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setUserProfile(null)
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    }
  }

  const updateUserProfile = async (profileData) => {
    if (!user?.phoneNumber) {
      return { success: false, error: 'No user logged in' }
    }
    
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: user.phoneNumber,
          ...profileData
        })
      })
      const data = await response.json()
      if (data.success) {
        setUserProfile(data.user)
      }
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  // Refresh user profile from backend
  const refreshProfile = async () => {
    if (user?.phoneNumber) {
      return await fetchUserProfile(user.phoneNumber)
    }
    return null
  }

  const value = {
    user,
    userProfile,
    loading,
    sendOTP,
    verifyOTP,
    resetRecaptcha: destroyRecaptcha,
    signOut,
    updateUserProfile,
    refreshProfile
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
