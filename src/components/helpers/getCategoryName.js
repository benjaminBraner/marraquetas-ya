export const getCategoryName = (category) => {
		const categorias = {
			panes: 'Panes',
			pasteleria: 'Pastelería',
			bebidas: 'Bebidas',
			otros: 'Otros'
		}
		return categorias[category] || category
	}