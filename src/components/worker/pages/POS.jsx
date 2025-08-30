import { useState, useMemo } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, DollarSign, Receipt, Check, Search, Zap, History, X } from 'lucide-react'
import { useStockStore } from '../../hooks/useStockStore'
import { usePosStore } from '../../hooks/usePosStore'
import { useStockHistoryStore } from '../../hooks/useStockHistoryStore'
import './_Pos.scss'
import { useProductStore } from '../../hooks/useProductStore'
import { StockHistoryItem } from '../../admin/pages/stock/StockHistoryItem'

export function POS() {
	const { products } = useProductStore()
	const { stock, getStockAsArray, startWithdrawStock, stockStatus } = useStockStore()
	const [showHistoryModal, setShowHistoryModal] = useState(false)

	const { startAddSale, sales, getTodayTotal, getTotalSales, posStatus } = usePosStore()

	const { startAddHistoryEntry, history } = useStockHistoryStore()

	// Estados locales
	const [cart, setCart] = useState([])
	const [searchTerm, setSearchTerm] = useState('')
	const [paymentMethod, setPaymentMethod] = useState('cash')
	const [isProcessing, setIsProcessing] = useState(false)

	// Productos disponibles para venta (solo los que tienen stock)
	const availableProducts = useMemo(() => {
		return getStockAsArray()
			.filter(({ quantity }) => quantity > 0)
			.map(({ productName, quantity }) => {
				const product = products.find((p) => p.name === productName)
				return {
					name: productName,
					stock: quantity,
					price: product?.unitPrice || 0,
					prices: product?.prices || [],
					priceType: product?.priceType,
					category: product?.category || 'Sin categoría',
					image: product?.image || '',
					id: product?.id || productName
				}
			})
			.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase()))
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [getStockAsArray, products, searchTerm])

	// Funciones del carrito optimizadas
	const addToCart = (product, quantity = 1) => {
		const existingItem = cart.find((item) => item.name === product.name)

		if (existingItem) {
			const newQuantity = existingItem.quantity + quantity
			if (newQuantity > product.stock) {
				return // Silenciosamente no agregar si excede stock
			}

			setCart(cart.map((item) => (item.name === product.name ? { ...item, quantity: newQuantity } : item)))
		} else {
			if (quantity > product.stock) {
				return
			}

			setCart([
				...cart,
				{
					name: product.name,
					price: product.price,
					quantity: quantity,
					stock: product.stock,
					image: product.image
				}
			])
		}
	}

	const updateCartQuantity = (productName, newQuantity) => {
		if (newQuantity <= 0) {
			removeFromCart(productName)
			return
		}

		const product = availableProducts.find((p) => p.name === productName)
		if (newQuantity > product.stock) {
			return
		}

		setCart(cart.map((item) => (item.name === productName ? { ...item, quantity: newQuantity } : item)))
	}

	const removeFromCart = (productName) => {
		setCart(cart.filter((item) => item.name !== productName))
	}

	const clearCart = () => {
		setCart([])
	}

	// Cálculos del carrito
	const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
	const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0)

	// Procesar venta optimizada
	const processSale = async () => {
		if (cart.length === 0 || isProcessing) return

		setIsProcessing(true)

		try {
			const sale = {
				items: cart.map((item) => ({
					productName: item.name,
					price: item.price,
					quantity: item.quantity,
					total: item.price * item.quantity
				})),
				total: cartTotal,
				paymentMethod,
				itemsCount: cartItemsCount
			}
console.log(paymentMethod)
			// Procesar en paralelo para mayor velocidad
			const [savedSale] = await Promise.all([startAddSale(sale), ...cart.map((item) => startWithdrawStock(item.name, item.quantity))])
			console.log(savedSale)
			const historyEntry = {
				type: 'sale',
				description: `Venta realizada - ${cartItemsCount} productos`,
				date: new Date().toISOString(),
				method: paymentMethod,
				changes: cart.map((item) => ({
					productName: item.name,
					quantity: -item.quantity,
					previousQuantity: item.stock,
					newQuantity: item.stock - item.quantity,
					price: item.price,
					total: item.price * item.quantity,
					saleId: savedSale.id
				}))
			}

			await startAddHistoryEntry(historyEntry)

			// Limpiar y mostrar éxito
			clearCart()
			setSearchTerm('')
		} catch (error) {
			console.error('Error procesando venta:', error)
		} finally {
			setIsProcessing(false)
		}
	}

	// Teclas de acceso rápido
	const handleKeyPress = (e) => {
		if (e.key === 'Enter' && e.ctrlKey) {
			processSale()
		} else if (e.key === 'Escape') {
			clearCart()
		}
	}

	const paymentMethods = [
		{ value: 'efectivo', label: 'Efectivo', icon: DollarSign, key: '1' },
		{ value: 'QR', label: 'QR', key: '3' }
	]

	return (
		<div className="pos-container-split" onKeyDown={handleKeyPress} tabIndex="0">
			{/* Header compacto */}
			<div className="pos-header-compact">
				<div className="pos-title-compact">
					<div className="header-actions">
					<button className="btn btn-secondary" onClick={() => setShowHistoryModal(true)}>
						<History size={18} />
						Historial
					</button>
				</div>
				</div>

				<div className="pos-stats-compact">
					<span>
						Hoy: {getTotalSales()} ventas | Bs.{getTodayTotal().toFixed(2)}
					</span>
				</div>

				<div className="cart-summary-header">
					<span className="cart-count">{cartItemsCount} items</span>
					<span className="cart-total-header">Bs.{cartTotal.toFixed(2)}</span>
				</div>
			</div>

			<div className="pos-main-split">
				{/* LADO IZQUIERDO: Productos */}
				<div className="products-section">
					<div className="search-section-compact">
						<div className="search-input-container">
							<Search size={16} />
							<input type="text" placeholder="Buscar productos" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input-fast" autoFocus />
						</div>
					</div>

					<div className="products-grid-fast">
						{availableProducts.length === 0 ? (
							<div className="no-products-compact">
								<p>Sin productos disponibles</p>
							</div>
						) : (
							availableProducts.map((product) => (
								<div key={product.name} className="product-card-fast" onClick={() => addToCart(product)}>
									{/* Imagen del producto */}
									<div className="product-image-container">
										{product.image ? (
											<img 
												src={product.image} 
												alt={product.name}
												className="product-image"
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.nextSibling.style.display = 'flex';
												}}
											/>
										) : null}
										<div className="product-image-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
											<Receipt size={24} />
										</div>
									</div>

									<div className="product-info-compact">
										<h4 className="product-name-fast">{product.name}</h4>
										<div className="product-details-fast">
											<span className="product-price-fast">Bs.{product.price}</span>
											<span className="product-stock-fast">({product.stock})</span>
										</div>
									</div>

									<div className="add-indicator">
										<Plus size={16} />
									</div>
								</div>
							))
						)}
					</div>
				</div>

				{/* LADO DERECHO: Carrito */}
				<div className="cart-section">
					<div className="cart-header">
						<h3>
							<ShoppingCart size={18} />
							Carrito
						</h3>
						{cart.length > 0 && (
							<button onClick={clearCart} className="btn-clear-fast">
								Limpiar
							</button>
						)}
					</div>

					<div className="cart-items-fast">
						{cart.length === 0 ? (
							<div className="empty-cart-fast">
								<ShoppingCart size={32} />
								<p>Carrito vacío</p>
								<p className="help-text">Click en productos para agregar</p>
							</div>
						) : (
							cart.map((item) => (
								<div key={item.name} className="cart-item-fast">
									{/* Imagen en el carrito también */}
									<div className="cart-item-image">
										{item.image ? (
											<img 
												src={item.image} 
												alt={item.name}
												className="cart-image"
												onError={(e) => {
													e.target.style.display = 'none';
													e.target.nextSibling.style.display = 'flex';
												}}
											/>
										) : null}
										<div className="cart-image-placeholder" style={{ display: item.image ? 'none' : 'flex' }}>
											<Receipt size={16} />
										</div>
									</div>

									<div className="item-info-fast">
										<h4>{item.name}</h4>
										<span className="item-price">Bs.{item.price}</span>
									</div>

									<div className="item-controls-fast">
										<button onClick={() => updateCartQuantity(item.name, item.quantity - 1)} className="qty-btn minus">
											<Minus size={12} />
										</button>
										<span className="quantity-display">{item.quantity}</span>
										<button onClick={() => updateCartQuantity(item.name, item.quantity + 1)} className="qty-btn plus">
											<Plus size={12} />
										</button>
										<button onClick={() => removeFromCart(item.name)} className="remove-btn-fast">
											<Trash2 size={12} />
										</button>
									</div>

									<div className="item-total-fast">Bs.{(item.price * item.quantity).toFixed(2)}</div>
								</div>
							))
						)}
					</div>

					{cart.length > 0 && (
						<div className="checkout-section">
							{/* Métodos de pago rápidos */}
							<div className="payment-methods-fast">
								{paymentMethods.map((method) => {
									const IconComponent = method.icon
									return (
										<button key={method.value} className={`payment-btn-fast ${paymentMethod === method.value ? 'active' : ''}`} onClick={() => setPaymentMethod(method.value)} title={`${method.label} (${method.key})`}>
											{/* <IconComponent size={14} /> */}
											<span>{method.label}</span>
										</button>
									)
								})}
							</div>

							{/* Total y botón de venta */}
							<div className="total-section-fast">
								<div className="total-display">
									<span className="total-label">Total:</span>
									<span className="total-amount-big">Bs.{cartTotal.toFixed(2)}</span>
								</div>

								<button onClick={processSale} className={`btn-process-sale ${isProcessing ? 'processing' : ''}`} disabled={isProcessing}>
									<Check size={20} />
									{isProcessing ? 'Procesando...' : 'VENDER'}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Indicador de estado */}
			{(posStatus === 'saving' || isProcessing) && (
				<div className="processing-indicator">
					<div className="spinner"></div>
					Procesando venta...
				</div>
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