import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { FirebaseAuth } from './firebase-config'





export const registerUserWithEmailPassword = async ({ email, password, displayName }) => {
	try {
		const resp = await createUserWithEmailAndPassword(FirebaseAuth, email, password)
		console.log(resp)

		const { uid, photoURL } = resp.user

		//Actualiza displayName en firebase porque no lo actualiza por defecto con la funcion createUserWithEmailAndPassword
		await updateProfile(FirebaseAuth.currentUser, { displayName })

		return {
			ok: true,
			uid,
			photoURL,
			email,
			displayName,
			errorMessage: null
		}
	} catch (error) {
		console.log(error)

		return {
			ok: false,
			message: error.message
		}
	}
}


export const loginWithEmailPassword = async ({ email, password }) => {
	try {
		const resp = await signInWithEmailAndPassword(FirebaseAuth, email, password)
		const {uid, photoURL, displayName}  = resp.user
		console.log(resp)
		return {
			ok: true,
			uid,
			photoURL,
			displayName,
			email
		}
	} catch (error) {
		console.log(error)
		return {
			ok: false,
			message: error.message
		}
	}
	
}


export const logoutFirebase = async () => {
	return await FirebaseAuth.signOut()
}