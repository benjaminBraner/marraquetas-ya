import { ChevronDown, ChevronRight, Home, Calendar, Users, FileText, Settings, LogOut, ClipboardClock, ShoppingCart, Apple } from 'lucide-react'
import { NavLink } from 'react-router'
import './_Sidebar.scss'
import { useAuthStore } from '../hooks/useAuthStore'
import { useAuthStatus } from '../hooks/useAuthStatus'
import { getUserRole } from '../helpers/getUserRole'

export const Sidebar = ({ sidebarOpen, closeSidebar, submenuOpen, toggleSubmenu, toggleSidebar }) => {
	const { startLogout, role } = useAuthStore()
	
	
	const handleLogout = async (e) => {
		e.preventDefault()
		e.stopPropagation()

		try {
			await startLogout()
			closeSidebar()
		} catch (error) {
			console.error('Error durante logout:', error)
		}
	}
	

	return (
		<>
			<aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
				<nav className="sidebar-nav">
					<ul className="nav-list">
						{
							role === 'admin' && (
								<>
									<li className="nav-item">
										<NavLink to="/dashboard" className="nav-link" onClick={closeSidebar}>
											<Home size={20} />
											<span>Dashboard</span>
										</NavLink>
									</li>
									<li className="nav-item">
										<NavLink to="/stock" className="nav-link" onClick={closeSidebar}>
											<Calendar size={20} />
											<span>Stock</span>
										</NavLink>
									</li>
									<li className="nav-item">
										<NavLink to="/productos" className="nav-link" onClick={closeSidebar}>
											<Apple size={20} />
											<span>Productos</span>
										</NavLink>
									</li>
								</>
								
							)
						}
						{
							role === 'worker' && (
								<>
									<li className="nav-item">
										<NavLink to="/punto-de-venta" className="nav-link" onClick={closeSidebar}>
											<ShoppingCart size={20} />
											<span>Punto de Venta</span>
										</NavLink>
									</li>
								</>
							)
						}



						
						<li className="nav-item">
							<NavLink to="/historial" className="nav-link" onClick={closeSidebar}>
								<ClipboardClock	 size={20} />
								<span>Historial</span>
							</NavLink>
						</li>
						
						<li className="nav-item">
							<button className="nav-link logout-button" onClick={handleLogout}>
								<LogOut size={20} />
								<span>Salir</span>
							</button>
						</li>
					</ul>
				</nav>
			</aside>

			{/* Overlay para móvil */}
			{sidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
		</>
	)
}

{
	/* <li className="nav-item">
							<button 
								className={`nav-link submenu-toggle ${submenuOpen ? 'submenu-active' : ''}`} 
								onClick={toggleSubmenu}
							>
								<FileText size={20} />
								<span>Reportes</span>
								{submenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
							</button>

							{submenuOpen && (
								<ul className={`submenu ${submenuOpen ? 'submenu-open' : ''}`}>
									<li>
										<NavLink 
											to="/reportes/mensuales" 
											className="submenu-link" 
											onClick={closeSidebar}
										>
											Reportes Mensuales
										</NavLink>
									</li>
									<li>
										<NavLink 
											to="/reportes/ingresos" 
											className="submenu-link" 
											onClick={closeSidebar}
										>
											Análisis de Ingresos
										</NavLink>
									</li>
								</ul>
							)}
						</li> */
}
