import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import './LoginPage.css'
import { useAuthStore } from '../../hooks/useAuthStore'
import toast from 'react-hot-toast'

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: '',
		role: '',
		password: ''
	})
	const [showPassword, setShowPassword] = useState(false)
	
	const {startLogin} = useAuthStore()

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		// console.log('Login attempt:', formData)
		// Aquí iría la lógica de autenticación
			startLogin(formData)
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	return (
		<div className="login-container">
			<div className="login-card">
				<div className="login-header">
					<img src="/logo.png" alt="Logo" className="logo" />
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input 
							type="email" 
							id="email" 
							name="email" 
							value={formData.email} 
							onChange={handleInputChange} 
							placeholder="ejemplo@correo.com" 
							required 
						/>
					</div>

					<div className="form-group">
						<label htmlFor="role">Rol</label>
						<select id="role" name="role" value={formData.role} onChange={handleInputChange} required>
							<option value="">Selecciona un rol</option>
							<option value="admin">Administrador</option>
							<option value="worker">Trabajador</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="password">Contraseña</label>
						<div className="password-input-container">
							<input 
								type={showPassword ? 'text' : 'password'} 
								id="password" 
								name="password" 
								value={formData.password} 
								onChange={handleInputChange} 
								placeholder="Escribe tu contraseña" 
								required 
							/>
							<button 
								type="button" 
								className="password-toggle" 
								onClick={togglePasswordVisibility} 
								aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<button type="submit" className="login-button">
						Iniciar Sesión
					</button>
				</form>

				<div className="login-footer">
					<a href="#forgot-password" className="forgot-password">
						¿Olvidaste tu contraseña?
					</a>
				</div>
			</div>
		</div>
	)
}

export default LoginPage
