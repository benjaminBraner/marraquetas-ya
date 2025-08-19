import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
	name: 'auth',
	initialState: {
		status: 'checking', // checking, not-authenticated, authenticated
		uid: null,
		email: null,
		displayName: null,
		role: null,
		errorMessage: null
	},

	reducers: {
		login: (state, { payload }) => {
			state.status = 'authenticated'
			state.uid = payload.uid
			state.email = payload.email
			state.displayName = payload.displayName
			state.role = payload.role
			state.errorMessage = null
		},
		logout: (state, { payload }) => {
			state.status = 'not-authenticated'
			state.uid = null
			state.email = null
			state.displayName = null
			state.role = null
			state.errorMessage = payload || null
		},
		checkingCredentials: (state) => {
			state.status = 'checking'
		}
	}
})

export const { login, logout, checkingCredentials } = authSlice.actions
