import { useStockStore } from '../../../hooks/useStockStore'

export const StockSummary = ({ totalProducts }) => {
	const {getTotalQuantity, getLowStockProducts} = useStockStore()
	
	const totalQuantity = getTotalQuantity()
	const lowStockCount = getLowStockProducts().length

	return (
		<div className="stock-summary">
			<div className="summary-card">
				<h4>Productos en Stock</h4>
				<span className="summary-value">{totalProducts}</span>
			</div>
			<div className="summary-card">
				<h4>Cantidad Total</h4>
				<span className="summary-value">{totalQuantity}</span>
			</div>
			<div className="summary-card">
				<h4>Stock Bajo</h4>
				<span className="summary-value warning">{lowStockCount}</span>
			</div>
		</div>
	)
}
