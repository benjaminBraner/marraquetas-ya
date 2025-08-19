import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useDispatch, useSelector } from 'react-redux'
import { checkingCredentials, login, logout } from '../store/slices/authSlice'
import { FirebaseAuth } from '../../firebase/firebase-config'
import { getUserRole } from '../helpers/getUserRole'

export const useAuthStatus = () => {
	const dispatch = useDispatch()
	const { status, uid, displayName, email } = useSelector(state => state.auth)
	
	useEffect(() => {
		// Inicializar estado de checking
		dispatch(checkingCredentials())
		
		const unsubscribe = onAuthStateChanged(FirebaseAuth, async (firebaseUser) => {
			if (firebaseUser) {
				const { displayName, email, uid } = firebaseUser
				const role = await getUserRole(uid)
				// Usuario autenticado
				const userData = { displayName, email, uid, role }
				// console.log('Usuario autenticado:', userData)
				dispatch(login(userData))
			} else {
				// No autenticado
				// console.log('Usuario no autenticado')
				dispatch(logout())
			}
		})

		// Limpieza
		return () => unsubscribe()
	}, [dispatch])

	// Crear objeto user desde Redux en lugar de useState local
	const user = uid ? { displayName, email, uid } : null

	return { user, status }
}