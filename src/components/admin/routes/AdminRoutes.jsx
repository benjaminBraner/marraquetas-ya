import { Navigate, Route, Routes } from 'react-router'
import { Dashboard } from '../pages/Dashboard'
import { Stock } from '../pages/stock/Stock'
import { Products } from '../pages/Products'
import { POS } from '../../worker/pages/POS'
import { History } from '../pages/History'

export const AdminRoutes = () => {
	return ( 
		<Routes>
			<Route path="dashboard" element={<Dashboard />} />		
			<Route path="stock" element={<Stock />} />		
			<Route path="productos" element={<Products />} />		
			<Route path="historial" element={<History />} />		
			
			<Route path="*" element={<Navigate to="/dashboard" />} />		
		</Routes>
	)
}
