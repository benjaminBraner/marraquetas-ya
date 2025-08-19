import { History, Package, RotateCcw } from 'lucide-react'
import React from 'react'

export const StockHeader = ({stockStatus, setShowHistoryModal}) => {
  return (
    <div className="stock-header">
				<h2 className="stock-title">
					<Package className="header-icon" />
					Gestión de Stock
					{stockStatus === 'saving' && <span className="loading-indicator">Guardando...</span>}
				</h2>
				<div className="header-actions">
					<button className="btn btn-secondary" onClick={() => setShowHistoryModal(true)}>
						<History size={18} />
						Historial
					</button>
				</div>
			</div>
  )
}
