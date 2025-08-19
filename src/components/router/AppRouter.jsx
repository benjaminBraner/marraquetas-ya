import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import LoginPage from '../pages/public/LoginPage'
import { PrivateRoutes } from '../routes/PrivateRoutes'
import { useAuthStatus } from '../hooks/useAuthStatus'
import { useAuthStore } from '../hooks/useAuthStore'
import { Loader } from 'lucide-react'

export const AppRouter = () => {
	const { user, status } = useAuthStatus()


	if (status === 'checking') {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh'
				}}
			>
				
				<Loader type='progress'/>
			</div>
		)
	}
	return (
		<Routes>
			{user ? (
				<Route path="/*" element={<PrivateRoutes />} />
			) : (
				<>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/*" element={<Navigate to="/login" />} />
				</>
			)}
		</Routes>
	)
}
