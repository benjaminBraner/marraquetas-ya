import { useEffect, useRef, useState } from 'react'
import { getTodayDate } from '../helpers/getTodayDate'

export const useDateChange = (callback) => {
	const [currentDate, setCurrentDate] = useState(getTodayDate())
	const callbackRef = useRef(callback)

	// Actualizar la referencia del callback
	useEffect(() => {
		callbackRef.current = callback
	}, [callback])

	useEffect(() => {
		const checkDateChange = () => {
			const newDate = getTodayDate()
			if (newDate !== currentDate) {
				setCurrentDate(newDate)
				callbackRef.current(newDate) // Ejecutar callback solo cuando cambie
			}
		}

		// Verificar cada minuto si cambió la fecha
		const interval = setInterval(checkDateChange, 60000)

		return () => clearInterval(interval)
	}, [currentDate])

	return currentDate
}
