import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useApiKeyAuthStore } from '@/stores/apiKeyAuthStore'
import type { AuthHeader } from '@/types/authTypes'

export class AuthStoreError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthStoreError'
  }
}

export const useAuthStore = defineStore('auth', () => {
  const loading = ref(false)
  const currentUser = ref<null>(null)
  const isInitialized = ref(true)
  const balance = ref<null>(null)
  const lastBalanceUpdateTime = ref<Date | null>(null)
  const isFetchingBalance = ref(false)
  const tokenRefreshTrigger = ref(0)

  const isAuthenticated = computed(() => true)
  const userEmail = computed(() => null)
  const userId = computed(() => null)

  const getIdToken = async (): Promise<string | undefined> => {
    return undefined
  }

  const getAuthHeader = async (): Promise<AuthHeader | null> => {
    return useApiKeyAuthStore().getAuthHeader()
  }

  const getFirebaseAuthHeader = async (): Promise<AuthHeader | null> => {
    return null
  }

  const getAuthToken = async (): Promise<string | undefined> => {
    return undefined
  }

  const getAuthHeaderOrThrow = async (): Promise<AuthHeader> => {
    const authHeader = await getAuthHeader()
    if (!authHeader) {
      throw new AuthStoreError('User not authenticated')
    }
    return authHeader
  }

  const getFirebaseAuthHeaderOrThrow = async (): Promise<AuthHeader> => {
    throw new AuthStoreError('User not authenticated')
  }

  const fetchBalance = async (): Promise<null> => {
    return null
  }

  const login = async (): Promise<unknown> => {
    throw new AuthStoreError('Login is disabled')
  }

  const register = async (): Promise<unknown> => {
    throw new AuthStoreError('Registration is disabled')
  }

  const logout = async (): Promise<void> => {}

  const loginWithGoogle = async (): Promise<unknown> => {
    throw new AuthStoreError('Google login is disabled')
  }

  const loginWithGithub = async (): Promise<unknown> => {
    throw new AuthStoreError('GitHub login is disabled')
  }

  const initiateCreditPurchase = async (): Promise<unknown> => {
    throw new AuthStoreError('Credit purchase is disabled')
  }

  const accessBillingPortal = async (): Promise<unknown> => {
    throw new AuthStoreError('Billing portal is disabled')
  }

  const sendPasswordReset = async (): Promise<void> => {
    throw new AuthStoreError('Password reset is disabled')
  }

  const updatePassword = async (): Promise<void> => {
    throw new AuthStoreError('Password update is disabled')
  }

  const createCustomer = async (): Promise<unknown> => {
    throw new AuthStoreError('Customer creation is disabled')
  }

  return {
    loading,
    currentUser,
    isInitialized,
    balance,
    lastBalanceUpdateTime,
    isFetchingBalance,
    tokenRefreshTrigger,
    isAuthenticated,
    userEmail,
    userId,
    login,
    register,
    logout,
    createCustomer,
    getIdToken,
    loginWithGoogle,
    loginWithGithub,
    initiateCreditPurchase,
    fetchBalance,
    accessBillingPortal,
    sendPasswordReset,
    updatePassword,
    getAuthHeader,
    getAuthHeaderOrThrow,
    getFirebaseAuthHeader,
    getFirebaseAuthHeaderOrThrow,
    getAuthToken
  }
})
