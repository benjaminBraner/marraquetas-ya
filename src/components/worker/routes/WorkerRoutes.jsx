import { Navigate, Route, Routes } from 'react-router'
import { POS } from '../pages/POS'
import { History } from '../../admin/pages/History'

export const WorkerRoutes = () => {
	return (
		<Routes>
			<Route path="punto-de-venta" element={<POS />} />		
			<Route path="historial" element={<History />} />

			<Route path="*" element={<Navigate to="/venta" />} />
		</Routes>
	)
}
