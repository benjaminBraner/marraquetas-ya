// Función para formatear la fecha seleccionada
export const formatSelectedDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00') // Evitar problemas de timezone
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} de ${month} de ${year}`
}

// Función para formatear la fecha de hoy
const formatTodayDate = (todayDateString) => {
    return formatSelectedDate(todayDateString) // Reutilizar la misma función
}