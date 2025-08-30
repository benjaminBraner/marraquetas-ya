import { Menu } from 'lucide-react'
import './_Navbar.scss'
import { useAuthStore } from '../hooks/useAuthStore'

export const Navbar = ({ toggleSidebar }) => {
	
	const {role} = useAuthStore()
	return (
		<nav className="navbar">
			<div className="navbar-content">
				<button className="menu-toggle" onClick={toggleSidebar}>
					<Menu size={24} />
				</button>
				<div className="logo">
					<span>Marraquetas Yaa!</span>
				</div>
				<div className="navbar-actions">
					<span>{role}</span>
				</div>
			</div>
		</nav>
	)
}
