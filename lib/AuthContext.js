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

  const setupRecaptcha = (elementId) => {
    if (typeof window !== 'undefined') {
      // Clear existing verifier if any
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch (e) {
          // Ignore clear errors
        }
        window.recaptchaVerifier = null
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          // Reset reCAPTCHA
          window.recaptchaVerifier = null
        }
      })
    }
    return window.recaptchaVerifier
  }

  const sendOTP = async (phoneNumber) => {
    try {
      // Format phone number for Firebase (must include country code)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      
      const recaptchaVerifier = setupRecaptcha('recaptcha-container')
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      
      return { success: true, confirmationResult }
    } catch (error) {
      console.error('Error sending OTP:', error)
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
        } catch (e) {}
        window.recaptchaVerifier = null
      }
      return { success: false, error: error.message }
    }
  }

  const verifyOTP = async (confirmationResult, otp) => {
    try {
      const result = await confirmationResult.confirm(otp)
      // After verification, fetch the user profile
      if (result.user) {
        await fetchUserProfile(result.user.phoneNumber)
      }
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Error verifying OTP:', error)
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
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
