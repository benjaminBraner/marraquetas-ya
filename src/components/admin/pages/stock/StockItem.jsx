import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

// Componente para cada item de stock
export function StockItem({ product, isLowStock, isOutOfStock, onAddMore}) {
	const [addQuantity, setAddQuantity] = useState('')

	const handleAddMore = () => {
		const quantity = parseInt(addQuantity)
		if (quantity > 0) {
			onAddMore(quantity)
			setAddQuantity('')
		}
	}
	return (
		<div className={`stock-item ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''}`}>
			<div className="stock-item-content">
				{/* Imagen del producto */}
				<img src={product.image} alt={product.name} className="product-image-stock" />

				{/* Información del producto */}
				<div className="product-info">
					<h4 className="product-title">{product.name}</h4>
					<p className="product-category">{product.category}</p>
					<div className="stock-info">
						<span className="stock-label">Stock actual:</span>
						<span 
							className={`stock-value ${isOutOfStock ? 'out-of-stock-text' : isLowStock ? 'low-stock-text' : ''}`}>
								{product.stock}
						</span>
						{isLowStock && <span className="stock-badge low-stock-badge">Stock Bajo</span>}
						{isOutOfStock && <span className="stock-badge out-of-stock-badge">Agotado</span>}
					</div>
				</div>

				{/* Controles */}
				<div className="stock-controls">
					<input 
						type="number" 
						min="1" 
						placeholder="Cantidad" 
						value={addQuantity} 
						onChange={(e) => setAddQuantity(e.target.value)} 
						className="control-input" 
					/>
					<button 
						onClick={handleAddMore} 
						disabled={!addQuantity || addQuantity <= 0} 
						className="btn btn-success btn-small" 
						title="Añadir cantidad"
					>
						<Plus size={16} />
					</button>
					
				</div>
			</div>
		</div>
	)
}
