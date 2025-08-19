import { useState } from 'react'
import './_Layout.scss'
import { Navbar } from '../Navbar'
import { Sidebar } from '../Sidebar'

export const Layout = ({ children }) => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [submenuOpen, setSubmenuOpen] = useState(false)

	const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
	const closeSidebar = () => setSidebarOpen(false)
	const toggleSubmenu = () => setSubmenuOpen(!submenuOpen)

	return (
		<div className="layout-container">
			<Navbar toggleSidebar={toggleSidebar} />

			<Sidebar 
				sidebarOpen={sidebarOpen} 
				closeSidebar={closeSidebar} 
				submenuOpen={submenuOpen} 
				toggleSubmenu={toggleSubmenu} 
				toggleSidebar={toggleSidebar}
			/>

			<main className="main-content">
				{children}
			</main>
		</div>
	)
}
