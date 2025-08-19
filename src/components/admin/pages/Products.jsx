import { useState } from 'react'
import { Plus, Edit2, Trash2, X, Save, Upload } from 'lucide-react'
import './_Products.scss'
import { useProductStore } from '../../hooks/useProductStore'
import { getCategoryName } from '../../helpers/getCategoryName'

export const Products = () => {
	
	const { startAddProduct, startEditProduct, startDeleteProduct, products, status, errorMessage } = useProductStore()
	
	const [showModal, setShowModal] = useState(false)
	const [editingProduct, setEditingProduct] = useState(null)
	const [isEditing, setIsEditing] = useState(false)
	const [formData, setFormData] = useState({
		name: '',
		category: 'panes',
		image: '',
		priceType: 'simple',
		unitPrice: 0,
		prices: []
	})


	const resetForm = () => {
		setFormData({
			name: '',
			category: 'panes',
			image: '',
			priceType: 'simple',
			unitPrice: 0,
			prices: []
		})
	}

	const openAddModal = () => {
		resetForm()
		setEditingProduct(null)
		setIsEditing(true)
		setShowModal(true)
	}

	const openViewModal = (product) => {
		// Crear una copia profunda para no modificar el original
		const productCopy = {
			...product,
			prices: product.prices ? product.prices.map((p) => ({ ...p })) : []
		}
		setFormData(productCopy)
		setEditingProduct(product)
		setIsEditing(false)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setEditingProduct(null)
		setIsEditing(false)
		resetForm()
	}

	const handleCancel = () => {
		if (editingProduct && isEditing) {
			// Restaurar datos originales
			const productCopy = {
				...editingProduct,
				prices: editingProduct.prices ? editingProduct.prices.map((p) => ({ ...p })) : []
			}
			setFormData(productCopy)
			setIsEditing(false)
		} else {
			closeModal()
		}
	}

	const handleEdit = () => {
		setIsEditing(true)
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: name === 'unitPrice' ? (value === '' ? '' : parseFloat(value) || '') : value,
			// Si cambia a priceType 'multiple', asegurar que tenga al menos un precio
			...(name === 'priceType' && value === 'multiple' && prev.prices.length === 0 
				? { prices: [{ quantity: 1, price: 0 }] } 
				: {}),
			// Si cambia a priceType 'simple', limpiar prices
			...(name === 'priceType' && value === 'simple' 
				? { prices: [] } 
				: {})
		}))
	}

	const handleImageChange = (e) => {
		const file = e.target.files[0]
		if (file) {
			setFormData((prev) => ({
				...prev,
				image: file
			}))
		}
	}

	const handlePriceChange = (index, field, value) => {
		const newPrices = [...formData.prices]
		if (field === 'price' || field === 'quantity') {
			newPrices[index][field] = value === '' ? '' : parseFloat(value) || ''
		} else {
			newPrices[index][field] = value
		}
		setFormData((prev) => ({
			...prev,
			prices: newPrices
		}))
	}

	const addPrice = () => {
		setFormData((prev) => ({
			...prev,
			prices: [...prev.prices, { quantity: 1, price: 0 }]
		}))
	}

	const removePrice = (index) => {
		if (formData.prices.length > 1) {
			setFormData((prev) => ({
				...prev,
				prices: prev.prices.filter((_, i) => i !== index)
			}))
		}
	}

	const handleSave = async () => {
		if (!formData.name.trim()) return

		try {
			if (editingProduct) {
				// Editar producto existente
				await startEditProduct({ ...formData, id: editingProduct.id })
			} else {
				// Agregar nuevo producto
				await startAddProduct({ ...formData })
			}
			closeModal()
		} catch (error) {
			console.error('Error al guardar producto:', error)
			// Aquí podrías mostrar una notificación de error
		}
	}

	const handleDelete = async (product) => {
		if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
			try {
				await startDeleteProduct(product)
			} catch (error) {
				console.error('Error al eliminar producto:', error)
				// Aquí podrías mostrar una notificación de error
			}
		}
	}

	

	// Mostrar loading si está cargando
	if (status === 'loading') {
		return (
			<div className="products-container">
				<div className="loading">Cargando productos...</div>
			</div>
		)
	}

	return (
		<div className="products-container">
			<div className="products-header">
				<h1>Gestión de Productos</h1>
				<button 
					className="btn-primary" 
					onClick={openAddModal}
					disabled={status === 'saving'}
				>
					<Plus size={20} />
					Agregar Producto
				</button>
			</div>

			{/* Mostrar mensaje de error si existe */}
			{errorMessage && (
				<div className="error-message">
					Error: {errorMessage}
				</div>
			)}

			<div className="products-grid">
				{products.map((product) => (
					<div key={product.id} className="product-card">
						<div className="product-image">
							<img src={product.image} alt={product.name} />
							<div className="product-actions">
								<button 
									className="btn-icon btn-edit" 
									onClick={() => openViewModal(product)} 
									title="Ver/Editar"
									disabled={status === 'saving'}
								>
									<Edit2 size={16} />
								</button>
								<button 
									className="btn-icon btn-delete" 
									onClick={() => handleDelete(product)} 
									title="Eliminar"
									disabled={status === 'saving'}
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
						<div className="product-info">
							<h3>{product.name}</h3>
							<span className="product-category">{getCategoryName(product.category)}</span>
							<div className="product-pricing">
								<span className="price">{product.unitPrice}Bs.</span>
								{product.priceType === 'multiple' && (
									<div className="multiple-prices">
										{product.prices.map((price, index) => (
											<span key={index} className="price-item">
												{price.quantity}x {price.price}Bs.
											</span>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			{showModal && (
				<div className="modal-overlay">
					<div className="modal">
						<div className="modal-header">
							<h2>{editingProduct ? (isEditing ? 'Editar Producto' : 'Ver Producto') : 'Nuevo Producto'}</h2>
							<button className="btn-icon" onClick={closeModal}>
								<X size={20} />
							</button>
						</div>

						<div className="modal-content">
							<div>
								<div className="form-group">
									<label>Nombre</label>
									<input 
										type="text" 
										name="name" 
										value={formData.name} 
										onChange={handleInputChange} 
										disabled={!isEditing} 
										required 
									/>
								</div>

								<div className="form-group">
									<label>Categoría</label>
									<select 
										name="category" 
										value={formData.category} 
										onChange={handleInputChange} 
										disabled={!isEditing}
									>
										<option value="panes">Panes</option>
										<option value="pasteleria">Pastelería</option>
										<option value="bebidas">Bebidas</option>
										<option value="otros">Otros</option>
									</select>
								</div>

								<div className="form-group">
									<label>Imagen</label>
									{isEditing ? (
										<div className="file-input-wrapper">
											<input 
												type="file" 
												accept="image/*" 
												onChange={handleImageChange} 
												id="imagen-input" 
											/>
											<label htmlFor="imagen-input" className="file-input-label">
												<Upload size={16} />
												Seleccionar imagen
											</label>
										</div>
									) : (
										<input 
											type="text" 
											value={typeof formData.image === 'string' ? formData.image : 'Archivo seleccionado'} 
											disabled 
											placeholder="URL de la imagen" 
										/>
									)}
									{formData.image && (
										<div className="image-preview">
											<img 
												src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)} 
												alt="Vista previa" 
											/>
										</div>
									)}
								</div>

								<div className="form-group">
									<label>Tipo de Precio</label>
									<select 
										name="priceType" 
										value={formData.priceType} 
										onChange={handleInputChange} 
										disabled={!isEditing}
									>
										<option value="simple">Simple</option>
										<option value="multiple">Multiple</option>
									</select>
								</div>
								
								<div className="form-group">
										<label>Precio Unitario</label>
										<input 
											type="number" 
											name="unitPrice" 
											value={formData.unitPrice} 
											onChange={handleInputChange} 
											disabled={!isEditing} 
											min="0" 
											step="0.01" 
										/>
									</div>
								
								{formData.priceType === 'multiple' && (
									<div className="form-group">
										<label>Precios por Cantidad</label>
										<div className="precios-multiple">
											{formData.prices.map((price, index) => (
												<div key={index} className="precio-item">
													<input 
														type="number" 
														placeholder="Cantidad" 
														value={price.quantity} 
														onChange={(e) => handlePriceChange(index, 'quantity', e.target.value)} 
														disabled={!isEditing} 
														min="1" 
													/>
													<input 
														type="number" 
														placeholder="Precio" 
														value={price.price} 
														onChange={(e) => handlePriceChange(index, 'price', e.target.value)} 
														disabled={!isEditing} 
														min="0" 
														step="0.01" 
													/>
													{isEditing && formData.prices.length > 1 && (
														<button 
															type="button" 
															className="btn-icon btn-delete" 
															onClick={() => removePrice(index)}
														>
															<Trash2 size={14} />
														</button>
													)}
												</div>
											))}
											{isEditing && (
												<button 
													type="button" 
													className="btn-secondary btn-small" 
													onClick={addPrice}
												>
													<Plus size={14} />
													Agregar Precio
												</button>
											)}
										</div>
									</div>
								)}
							</div>
						</div>

						<div className="modal-footer">
							{editingProduct && !isEditing ? (
								<button className="btn-primary" onClick={handleEdit}>
									<Edit2 size={16} />
									Editar
								</button>
							) : (
								<button 
									className="btn-primary" 
									onClick={handleSave} 
									disabled={!formData.name.trim() || status === 'saving'}
								>
									<Save size={16} />
									{status === 'saving' ? 'Guardando...' : (editingProduct ? 'Guardar Cambios' : 'Crear Producto')}
								</button>
							)}
							<button 
								className="btn-secondary" 
								onClick={handleCancel}
								disabled={status === 'saving'}
							>
								Cancelar
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}