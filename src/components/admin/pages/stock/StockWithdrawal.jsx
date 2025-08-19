import { useState } from 'react'
import { Package2, AlertTriangle, RotateCcw, X, Check, Minus } from 'lucide-react'
import './_StockWithdrawal.scss'

export function StockWithdrawal({ 
    stockProducts, 
    onWithdrawStock, 
    stockStatus,
    isVisible, 
    onClose 
}) {
    const [selectedProduct, setSelectedProduct] = useState('')
    const [withdrawQuantity, setWithdrawQuantity] = useState('')
    const [withdrawalType, setWithdrawalType] = useState('damaged') // 'damaged', 'returned', 'expired', 'lost'
    const [reason, setReason] = useState('')

    // Opciones de tipos de retiro
    const withdrawalTypes = [
        { value: 'damaged', label: 'Producto Dañado', icon: AlertTriangle, color: 'danger' },
        { value: 'returned', label: 'Devolución', icon: RotateCcw, color: 'warning' },
        { value: 'expired', label: 'Producto Vencido', icon: Package2, color: 'secondary' },
        { value: 'lost', label: 'Producto Perdido', icon: Minus, color: 'dark' }
    ]

    const getCurrentStock = (productName) => {
        const product = stockProducts.find(p => p.name === productName)
        return product ? product.stock : 0
    }

    const getSelectedProductData = () => {
        return stockProducts.find(p => p.name === selectedProduct)
    }

    const handleWithdraw = async () => {
        if (!selectedProduct || !withdrawQuantity || withdrawQuantity <= 0) return

        const productData = getSelectedProductData()
        if (!productData) return

        const currentStock = getCurrentStock(selectedProduct)
        const quantityToWithdraw = parseInt(withdrawQuantity)

        if (quantityToWithdraw > currentStock) {
            alert(`No puedes retirar ${quantityToWithdraw} unidades. Stock disponible: ${currentStock}`)
            return
        }

        const withdrawalData = {
            productName: selectedProduct,
            quantity: quantityToWithdraw,
            type: withdrawalType,
            reason: reason.trim(),
            currentStock,
            newStock: currentStock - quantityToWithdraw
        }

        try {
            await onWithdrawStock(withdrawalData)
            
            // Limpiar formulario
            setSelectedProduct('')
            setWithdrawQuantity('')
            setReason('')
            setWithdrawalType('damaged')
            
        } catch (error) {
            console.error('Error al retirar stock:', error)
        }
    }

    const resetForm = () => {
        setSelectedProduct('')
        setWithdrawQuantity('')
        setReason('')
        setWithdrawalType('damaged')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const selectedTypeData = withdrawalTypes.find(type => type.value === withdrawalType)
    const selectedProductData = getSelectedProductData()
    const maxQuantity = selectedProductData ? selectedProductData.stock : 0

    if (!isVisible) return null

    return (
        <div className="modal-overlay">
            <div className="modal withdrawal-modal">
                <div className="modal-header">
                    <h3 className="modal-title">
                        <Package2 size={20} />
                        Retirar Productos del Stock
                    </h3>
                    <button className="btn-close" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="withdrawal-form">
                        
                        {/* Selector de tipo de retiro */}
                        <div className="form-group">
                            <label className="form-label">Tipo de Retiro</label>
                            <div className="withdrawal-types">
                                {withdrawalTypes.map((type) => {
                                    const IconComponent = type.icon
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            className={`withdrawal-type-btn ${withdrawalType === type.value ? 'active' : ''} ${type.color}`}
                                            onClick={() => setWithdrawalType(type.value)}
                                            disabled={stockStatus === 'saving'}
                                        >
                                            <IconComponent size={18} />
                                            {type.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Selector de producto */}
                        <div className="form-group">
                            <label className="form-label">Producto</label>
                            <select 
                                value={selectedProduct} 
                                onChange={(e) => setSelectedProduct(e.target.value)} 
                                className="form-select"
                                disabled={stockStatus === 'saving'}
                            >
                                <option value="">Seleccionar producto</option>
                                {stockProducts
                                    .filter(product => product.stock > 0) // Solo productos con stock
                                    .map((product) => (
                                        <option key={product.name} value={product.name}>
                                            {product.name} - Stock: {product.stock} ({product.category})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        {/* Input de cantidad */}
                        <div className="form-group">
                            <label className="form-label">
                                Cantidad a Retirar
                                {selectedProductData && (
                                    <span className="stock-info">
                                        (Máximo: {maxQuantity})
                                    </span>
                                )}
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                max={maxQuantity}
                                placeholder="Cantidad" 
                                value={withdrawQuantity} 
                                onChange={(e) => setWithdrawQuantity(e.target.value)} 
                                className="form-input"
                                disabled={stockStatus === 'saving' || !selectedProduct}
                            />
                        </div>

                        {/* Razón/Observaciones */}
                        <div className="form-group">
                            <label className="form-label">
                                Razón u Observaciones
                                <span className="optional">(Opcional)</span>
                            </label>
                            <textarea 
                                placeholder={`Describe el motivo del ${selectedTypeData?.label.toLowerCase()}...`}
                                value={reason} 
                                onChange={(e) => setReason(e.target.value)} 
                                className="form-textarea"
                                disabled={stockStatus === 'saving'}
                                rows="3"
                            />
                        </div>

                        {/* Resumen de la operación */}
                        {selectedProductData && withdrawQuantity && (
                            <div className="withdrawal-summary">
                                <div className="summary-header">
                                    <selectedTypeData.icon size={16} />
                                    Resumen de {selectedTypeData.label}
                                </div>
                                <div className="summary-content">
                                    <div className="summary-row">
                                        <span>Producto:</span>
                                        <strong>{selectedProductData.name}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Stock Actual:</span>
                                        <strong>{selectedProductData.stock}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>Cantidad a Retirar:</span>
                                        <strong className="text-danger">-{withdrawQuantity}</strong>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Stock Resultante:</span>
                                        <strong>{selectedProductData.stock - parseInt(withdrawQuantity || 0)}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="form-actions">
                            <button 
                                type="button"
                                onClick={handleClose} 
                                className="btn btn-secondary"
                                disabled={stockStatus === 'saving'}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button"
                                onClick={handleWithdraw} 
                                disabled={!selectedProduct || !withdrawQuantity || withdrawQuantity <= 0 || stockStatus === 'saving'} 
                                className={`btn btn-${selectedTypeData?.color || 'danger'}`}
                            >
                                <Check size={18} />
                                {stockStatus === 'saving' 
                                    ? 'Procesando...' 
                                    : `Confirmar ${selectedTypeData?.label}`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}