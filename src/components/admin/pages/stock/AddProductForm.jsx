import { useState } from 'react'
import { Check, X, Loader } from 'lucide-react'
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
	
	const { products } = useProductStore()
	
	// Estado local para prevenir múltiples clics
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleAddProduct = async (e) => {
		e.preventDefault()
		
		// Prevenir múltiples clics
		if (isSubmitting || stockStatus === 'saving') return
		
		if (!selectedProduct || !quantity || quantity <= 0) return

		// Activar estado de carga inmediatamente
		setIsSubmitting(true)

		try {
			await handleAddProductToStock()
			
			// Limpiar formulario solo si fue exitoso
			setSelectedProduct('')
			setQuantity('')
			
			// Cerrar formulario automáticamente tras éxito
			setTimeout(() => {
				setShowAddProduct(false)
			}, 500)
			
		} catch (error) {
			console.error('Error al agregar producto al stock:', error)
		} finally {
			// Desactivar estado de carga
			setIsSubmitting(false)
		}
	}

	const handleClose = () => {
		// No permitir cerrar mientras se está procesando
		if (isSubmitting || stockStatus === 'saving') return
		
		setShowAddProduct(false)
		setSelectedProduct('')
		setQuantity('')
		setIsSubmitting(false)
	}

	// Estados de carga combinados
	const isLoading = isSubmitting || stockStatus === 'saving'
	const canSubmit = selectedProduct && quantity && quantity > 0 && !isLoading
	
	return (
		<div className={`add-product-form ${isLoading ? 'processing' : ''}`}>
			{/* Overlay de carga */}
			{isLoading && (
				<div className="loading-overlay">
					<div className="loading-spinner">
						<Loader size={24} className="spinner" />
						<span>Agregando producto...</span>
					</div>
				</div>
			)}

			<div className="form-header">
				<h3>Agregar Nuevo Producto</h3>
				<button
					onClick={handleClose}
					className="btn-close"
					disabled={isLoading}
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
					disabled={isLoading}
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
					disabled={isLoading}
				/>
			</div>

			<button 
				onClick={handleAddProduct} 
				disabled={!canSubmit} 
				className={`btn btn-success btn-confirm ${!canSubmit ? 'disabled' : ''}`}
				style={{
					pointerEvents: !canSubmit ? 'none' : 'auto',
					opacity: !canSubmit ? 0.6 : 1
				}}
			>
				{isLoading ? (
					<>
						<Loader size={18} className="spinner" />
						Agregando...
					</>
				) : (
					<>
						<Check size={18} />
						Confirmar
					</>
				)}
			</button>
		</div>
	)
}