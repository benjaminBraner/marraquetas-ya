import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { useAuthStore } from '../hooks/useAuthStore'
import { useFirebaseSync } from '../hooks/useFirebaseSync' // Importa el hook
import { Layout } from '../ui/layout/Layout'
import { AdminRoutes } from '../admin/routes/AdminRoutes'
import { WorkerRoutes } from '../worker/routes/WorkerRoutes'

export const PrivateRoutes = () => {
	const { uid, role } = useAuthStore()
	
	// 🔥 Usa el hook para sincronización automática
	useFirebaseSync()
	
	
	return (
		<>
			<Layout>
				<Routes>
					{
						role === 'admin' ? (
							<Route path="/*" element={<AdminRoutes />} />
						) : (
							<Route path="/*" element={<WorkerRoutes />} />
						)
					}
				</Routes>
			</Layout>
		</>
	)
}