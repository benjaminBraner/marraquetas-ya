export const StockHistoryItem = ({ entry }) => {
	// Formatear fecha
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString()
	}
	
	const getStockChangeText = (entry, change) => {
		if (entry.type === 'new') {
			return `Stock inicial: ${change.quantity}`
		}

		if (entry.type === 'addition') {
			return `+${change.quantity} (${change.previousQuantity} → ${change.newQuantity})`
		}

		if (entry.type === 'withdrawal') {
			const quantity = Math.abs(change.quantity)
			return `-${quantity} (${change.previousQuantity} → ${change.newQuantity})`
		}
		if (entry.type === 'sale') {
			const quantity = Math.abs(change.quantity)
			return `-${quantity} (${change.previousQuantity} → ${change.newQuantity}) ${change.price * quantity}Bs`
		}

		if (entry.type === 'removal') {
			return 'Eliminado del stock'
		}

		return `${change.quantity} unidades`
	}
	
	const getTypeText = (type) => {
		if (type === 'new') return 'Nuevo'
		if (type === 'addition') return 'Adición'
		if (type === 'withdrawal') return 'Retiro'
		if (type === 'removal') return 'Eliminado'
		if (type === 'sale') return 'Venta'
		return 'Desconocido'
	}

	return (
		<div className="history-entry" onClick={() => console.log(entry)}>
			<div className="history-header">
				<span className={`history-type ${entry.type}`}>{getTypeText(entry.type)}</span>
				<span className="history-date">{formatDate(entry.date)}</span>
			</div>
			<p className="history-description">{entry.description}</p>
			<div className="history-changes">
				{entry.changes.map((change, index) => (
					<div key={index} className="change-item">
						<span className="product-name">{change.productName}</span>
						<span className="quantity-change">
							{getStockChangeText(entry, change)}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
