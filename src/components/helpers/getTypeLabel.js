export const getTypeLabel = (type) => {
		const labels = {
			sale: 'Venta',
			withdrawal: 'Retiro',
			new: 'Nuevo',
			addition: 'Stock+'
		}
		return labels[type] || type
	}