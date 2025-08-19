import { Check, X } from 'lucide-react'
import { useProductStore } from '../../../hooks/useProductStore'

export const AddProductForm = ({
	setShowAddProduct,
	setSelectedProduct,
	setQuantity,
	getCurrentStock,
	stockStatus,
	selectedProduct,
	quantity,
	handleAddProductToStock
}) => {
	
	const {products} = useProductStore()
	
	return (
    		<div className="add-product-form">
			<div className="form-header">
				<h3>Agregar Nuevo Producto</h3>
				<button
					onClick={() => {
						setShowAddProduct(false)
						setSelectedProduct('')
						setQuantity('')
					}}
					className="btn-close"
				>
					<X size={20} />
				</button>
			</div>

			<div className="form-inputs">
				{/* Selector de producto */}
				<select 
					value={selectedProduct} 
					onChange={(e) => setSelectedProduct(e.target.value)} 
					className="product-select"
					disabled={stockStatus === 'saving'}
				>
					<option value="">Seleccionar producto</option>
					{products.map((product) => {
						const currentStock = getCurrentStock(product.name)
						return (
							<option key={product.id} value={product.id}>
								{product.name} ({product.category}) 
								{currentStock > 0 && ` - Stock actual: ${currentStock}`}
							</option>
						)
					})}
				</select>

				{/* Input de cantidad */}
				<input 
					type="number" 
					min="1" 
					placeholder="Cantidad" 
					value={quantity} 
					onChange={(e) => setQuantity(e.target.value)} 
					className="quantity-input"
					disabled={stockStatus === 'saving'}
				/>
			</div>

			<button 
				onClick={handleAddProductToStock} 
				disabled={!selectedProduct || !quantity || quantity <= 0 || stockStatus === 'saving'} 
				className="btn btn-success btn-confirm"
			>
				<Check size={18} />
				{stockStatus === 'saving' ? 'Guardando...' : 'Confirmar'}
			</button>
		</div>
  )
}
