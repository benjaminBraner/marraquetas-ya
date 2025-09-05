import { useDispatch, useSelector } from "react-redux"
import { checkingCredentials, login, logout } from "../store/slices/authSlice"
import { loginWithEmailPassword, logoutFirebase } from "../../firebase/providers"
import { getUserRole } from "../helpers/getUserRole"
import toast from "react-hot-toast"

export const useAuthStore = () => {
	
	const dispatch = useDispatch()
	const { status, uid, email, displayName, role, errorMessage } = useSelector( state => state.auth )
	
	const startLogin = async ({ email, password, role }) => {
		dispatch(checkingCredentials())
		
		try {
			const result = await loginWithEmailPassword({ email, password })
			if (result.ok) {
				const userRole = await getUserRole(result.uid)
				console.log(userRole)
				
				if (userRole === role) {
					dispatch(login({...result, role: userRole}))
					toast.success('Inicio de sesion exitoso')
				} else {
					startLogout('El rol del usuario no es el correcto')
					toast.error('El rol del usuario no es el correcto')
				}
				
			} else {
				startLogout(result.message)
				toast.error('Error al iniciar sesion')
			}
		} catch (error) {
			console.log(error)
			startLogout(error.message)
			toast.error('Error al iniciar sesion')
		}
	}
	
	const startLogout = async (errorMessage = null) => {
			dispatch(checkingCredentials())
			await logoutFirebase()
			dispatch(logout(errorMessage))
	}
	
	
	return {
		// Propiedades
		status,
		uid,
		email,
		displayName,
		role,
		errorMessage,
		
		// Metodos
		startLogin,
		startLogout
	}

 
}
