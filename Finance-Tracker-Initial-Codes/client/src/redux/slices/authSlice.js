import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.login(data)
    return response.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const signupUser = createAsyncThunk('auth/signup', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.signup(data)
    return response.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const refreshUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getMe()
    return response.data.user
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const updateProfileThunk = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const response = await authService.updateProfile(data)
    return response.data.user
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const storedUser = localStorage.getItem('user')
const parseStoredUser = () => {
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const initialState = {
  user: parseStoredUser(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: '',
  isAuthenticated: !!localStorage.getItem('token')
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token)
      }
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    updateUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(refreshUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  }
})

export const { setLoading, setUser, updateUser, logout } = authSlice.actions
export default authSlice.reducer