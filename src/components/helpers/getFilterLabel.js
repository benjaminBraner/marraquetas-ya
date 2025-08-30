export const getFilterLabel = (filterValue) => {
		const labels = {
			all: 'Todos_los_Registros',
			sale: 'Ventas',
			stock: 'Movimientos_de_Stock',
			withdrawal: 'Retiros'
		}
		return labels[filterValue] || filterValue
	}