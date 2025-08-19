import { useState, useMemo } from 'react'
import { Plus, Package, History, X, PackageX } from 'lucide-react'
import './_Stock.scss'
import { StockItem } from './StockItem'
import { useProductStore } from '../../../hooks/useProductStore'
import { useStockStore } from '../../../hooks/useStockStore'
import {StockHistoryItem} from './StockHistoryItem'
// Redux actions
import { StockHeader } from './StockHeader'
import { useStockHistoryStore } from '../../../hooks/useStockHistoryStore'
import { AddProductForm } from './AddProductForm'
import { StockSummary } from './StockSummary'
import { StockWithdrawal } from './StockWithdrawal'

export function Stock() {
	const { products } = useProductStore()
	const {startAddHistoryEntry, history} = useStockHistoryStore()
	
	const { 
		startAddStockToday, 
		startAddToExistingStock, 
		startRemoveFromStock,
		startWithdrawStock,
		stock, // Objeto: { productName: quantity }
		stockStatus,
		getTotalProducts,
		getStockAsArray
	} = useStockStore()

	
	// Local state para UI
	const [showAddProduct, setShowAddProduct] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState('')
	const [quantity, setQuantity] = useState('')
	const [showHistoryModal, setShowHistoryModal] = useState(false)
	const [showWithdrawal, setShowWithdrawal] = useState(false)



	// ✅ Productos que están en stock - convertir objeto a array para renderizar
	const stockProducts = useMemo(() => {
		return getStockAsArray().map(({ productName, quantity }) => {
			// Buscar datos adicionales del producto por nombre
			const product = products.find((p) => p.name === productName)
			return {
				id: product?.id || productName, // Fallback si no se encuentra el producto
				name: productName,
				category: product?.category || 'Sin categoría',
				unitPrice: product?.unitPrice || 0,
				prices: product?.prices || [],
				priceType: product?.priceType,
				stock: quantity,
				image: product?.image || '',
			}
		})
	}, [stock, products, getStockAsArray])
	// ✅ Cálculos derivados
	const totalProducts = getTotalProducts()

	const getCurrentStock = (productName) => {
		return stock[productName] || 0
	}

	const handleAddProductToStock = async () => {
		if (!selectedProduct || !quantity || quantity <= 0) return

		const product = products.find(p => p.id.toString() === selectedProduct)
		if (!product) return

		const productName = product.name
		const currentStock = getCurrentStock(productName)
		const newQuantity = parseInt(quantity)

		try {
			// ✅ Operación Firebase usando productName
			if (currentStock === 0) {
				// Producto nuevo
				await startAddStockToday(productName, newQuantity)
			} else {
				// Sumar a existente
				await startAddToExistingStock(productName, newQuantity)
			}

			// Agregar entrada al historial
			const historyEntry = {
				type: currentStock === 0 ? 'new' : 'addition',
				description: currentStock === 0 
					? `Producto agregado: ${productName}` 
					: `Stock añadido: ${productName}`,
				date: new Date().toISOString(),
				changes: [
					{
						productId: selectedProduct,
						productName: productName,
						quantity: newQuantity,
						previousQuantity: currentStock,
						newQuantity: currentStock + newQuantity
					}
				]
			}

			await startAddHistoryEntry(historyEntry)

			setSelectedProduct('')
			setQuantity('')
			setShowAddProduct(false)
		} catch (error) {
			console.error('Error agregando al stock:', error)
		}
	}

	// ✅ Añadir más cantidad a un producto existente
	const handleAddMoreStock = async (productName, additionalQuantity) => {
		if (additionalQuantity <= 0) return

		const currentStock = getCurrentStock(productName)

		try {
			await startAddToExistingStock(productName, additionalQuantity)

			// Agregar entrada al historial
			const historyEntry = {
				type: 'addition',
				description: `Stock añadido: ${productName}`,
				date: new Date().toISOString(),
				changes: [
					{
						productId: productName, // Usar productName como ID en historial
						productName: productName,
						quantity: additionalQuantity,
						previousQuantity: currentStock,
						newQuantity: currentStock + additionalQuantity
					}
				]
			}

			// dispatch(addHistoryEntry(historyEntry))
			startAddHistoryEntry(historyEntry)
			
		} catch (error) {
			console.error('Error añadiendo stock:', error)
		}
	}

	
	const handleWithdrawStock = async (withdrawalData) => {
		const { productName, quantity, type, reason, currentStock } = withdrawalData

		try {
			// Retirar del stock en Firebase
			await startWithdrawStock(productName, quantity)

			// Crear entrada para el historial
			const withdrawalTypes = {
				'damaged': 'Producto Dañado',
				'returned': 'Devolución',
				'expired': 'Producto Vencido',
				'lost': 'Producto Perdido'
			}

			const historyEntry = {
				type: 'withdrawal',
				description: `${withdrawalTypes[type]}: ${productName}`,
				date: new Date().toISOString(),
				changes: [
					{
						productId: productName,
						productName: productName,
						quantity: -quantity, // Negativo para indicar retiro
						previousQuantity: currentStock,
						newQuantity: currentStock - quantity,
						withdrawalType: type,
						reason: reason || 'Sin observaciones'
					}
				]
			}

			await startAddHistoryEntry(historyEntry)
			
			// Cerrar modal
			setShowWithdrawal(false)
			
		} catch (error) {
			console.error('Error procesando retiro:', error)
			alert('Error al procesar el retiro. Inténtalo de nuevo.')
		}
	}

	return (
		<div className="stock-container">
			{/* Header */}
			<StockHeader
				stockStatus={stockStatus}
				setShowHistoryModal={setShowHistoryModal}
			/>

			{/* Resumen de Stock */}
			{totalProducts > 0 && <StockSummary totalProducts={totalProducts} />}

			{/* Botón para agregar producto */}
			<div className="add-product-section">
				<button 
					className="btn btn-primary btn-add-product" 
					onClick={() => setShowAddProduct(true)}
					disabled={stockStatus === 'saving'}
				>
					<Plus size={20} />
					Agregar Producto al Stock
				</button>
				
				<button 
					className="btn btn-danger btn-withdraw-product" 
					onClick={() => setShowWithdrawal(true)}
					disabled={stockStatus === 'saving' || totalProducts === 0}
				>
					<PackageX size={20} />
					Retirar del Stock
				</button>
			</div>

			{/* Formulario para agregar producto */}
			{showAddProduct && (
				<AddProductForm 
					setShowAddProduct={setShowAddProduct}
					setSelectedProduct={setSelectedProduct}
					setQuantity={setQuantity}
					getCurrentStock={getCurrentStock}
					stockStatus={stockStatus}
					selectedProduct={selectedProduct}
					quantity={quantity}
					handleAddProductToStock={handleAddProductToStock}
				/>
			)}

			{/* Lista de productos en stock */}
			{totalProducts === 0 ? (
				<div className="empty-stock">
					<Package size={64} className="empty-icon" />
					<p className="empty-title">No hay productos en stock</p>
					<p className="empty-subtitle">Agrega tu primer producto usando el botón de arriba</p>
				</div>
			) : (
				<div className="stock-list">
					<div className="stock-items">
						{stockProducts.map((product) => {
							const isLowStock = product.stock <= 5 && product.stock > 0
							const isOutOfStock = product.stock === 0

							return (
								<StockItem
									key={product.name} // Usar name como key único
									product={product} 
									isLowStock={isLowStock} 
									isOutOfStock={isOutOfStock} 
									onAddMore={(quantity) => handleAddMoreStock(product.name, quantity)} 
									disabled={stockStatus === 'saving'}
								/>
							)
						})}
					</div>
				</div>
			)}


			{showWithdrawal && (
				<StockWithdrawal
					stockProducts={stockProducts}
					onWithdrawStock={handleWithdrawStock}
					stockStatus={stockStatus}
					isVisible={showWithdrawal}
					onClose={() => setShowWithdrawal(false)}
				/>
			)}


			{/* Modal de Historial */}
			{showHistoryModal && (
				<div className="modal-overlay">
					<div className="modal">
						<div className="modal-header">
							<h3 className="modal-title">
								<History size={20} />
								Historial de Stock
							</h3>
							<button className="btn-close" onClick={() => setShowHistoryModal(false)}>
								<X size={20} />
							</button>
						</div>

						<div className="modal-body">
							{history.length === 0 ? (
								<div className="empty-history">
									<History size={48} className="empty-icon" />
									<p>No hay movimientos registrados</p>
								</div>
							) : (
								<div className="history-list">
									{history.map((entry) => (
										<StockHistoryItem key={entry.date} entry={entry} />
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}