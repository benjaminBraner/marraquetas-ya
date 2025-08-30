import { useState, useMemo, useEffect } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import { useStockHistoryStore } from '../../hooks/useStockHistoryStore'
import './_History.scss'
import { useAuthStore } from '../../hooks/useAuthStore'
import { exportToExcel } from '../../helpers/exportToExcel'
import { getTypeLabel } from '../../helpers/getTypeLabel'
import { formatDate } from '../../helpers/formatDate'
import { getWithdrawalTypeLabel } from '../../helpers/getWithdrawalTypeLabel'
import { getTodayDate } from '../../helpers/getTodayDate'

const todayDate = getTodayDate()

// Función para formatear fecha al formato español
const formatDateToSpanish = (dateString) => {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ]
    
    const date = new Date(dateString + 'T00:00:00') // Añadir tiempo para evitar problemas de zona horaria
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} de ${month} de ${year}`
}

export const History = () => {
	const { history, getStockHistoryFromDay } = useStockHistoryStore()
	const [filter, setFilter] = useState('all')
	const {role} = useAuthStore()
	const [specificDayData, setSpecificDayData] = useState(null) // Estado para la data
    const [isLoadingSpecificDay, setIsLoadingSpecificDay] = useState(false)
    
    const [selectedDate, setSelectedDate] = useState("")
    const historyInUse = specificDayData || history
    
    console.log(selectedDate,specificDayData)

	console.log("historyInUse", historyInUse)

	// Calcular estadísticas finales
const finalStats = useMemo(() => {
    let totalCash = 0
    let currentStock = {}
    let totalSales = 0
    let totalWithdrawals = 0

    // ORDENAR PRIMERO por fecha para asegurar orden cronológico
    const sortedHistory = [...historyInUse].sort((a, b) => new Date(a.date) - new Date(b.date))

    sortedHistory.forEach((entry) => {
        entry.changes.forEach((change) => {
            // Ahora sí podemos estar seguros de que el último valor es el más reciente
            currentStock[change.productName] = change.newQuantity
            if (entry.type === 'sale') {
                totalSales += Math.abs(change.quantity || 0)
                totalCash += change.total || 0
            }
            if (entry.type === 'withdrawal') {
                totalWithdrawals += Math.abs(change.quantity || 0)
            }
        })
    })

    const totalStockItems = Object.values(currentStock).reduce((sum, qty) => sum + qty, 0)

    return {
        totalStockItems,
        totalCash,
        totalSales,
        totalWithdrawals,
        currentStock
    }
}, [historyInUse])
	
	
	const handleDateChange = async(e) => {
		const selectedDate = e.target.value
		console.log(selectedDate)
		setSelectedDate(selectedDate)
		
		const { entries = [] } = await getStockHistoryFromDay(selectedDate) || {}
		
     	setSpecificDayData(entries) 
		
	}
	
	

	// Procesar historial: una fila por producto, con dinero acumulado
	const processedHistory = useMemo(() => {
		const rows = []

		// Primero, crear todas las filas en orden cronológico normal (más antiguo primero)
		const sortedHistory = [...historyInUse].sort((a, b) => new Date(a.date) - new Date(b.date))
		let runningCash = 0

		sortedHistory.forEach((entry) => {
			entry.changes.forEach((change, changeIndex) => {
				// Actualizar dinero acumulativo
				if (entry.type === 'sale') {
					runningCash += change.total || 0
				}

				// Crear fila para este producto
				rows.push({
					id: `${entry.date}-${changeIndex}`,
					date: entry.date,
					type: entry.type,
					method: entry.method, // Agregar el método de pago
					productName: change.productName,
					quantity: change.quantity,
					previousQuantity: change.previousQuantity,
					newQuantity: change.newQuantity,
					price: change.price,
					total: change.total,
					withdrawalType: change.withdrawalType,
					reason: change.reason,
					saleId: change.saleId,
					cumulativeCash: runningCash,
					stockAtTime: change.newQuantity,
					isMultiProduct: entry.changes.length > 1,
					productIndex: changeIndex,
					totalProducts: entry.changes.length
				})
			})
		})

		// Luego invertir para mostrar más reciente primero
		return rows.reverse()
	}, [historyInUse])
	

	// Filtrar filas procesadas
	const filteredRows = useMemo(() => {
		if (filter === 'all') return processedHistory
		return processedHistory.filter((row) => {
			if (filter === 'stock') return ['new', 'addition'].includes(row.type)
			return row.type === filter
		})
	}, [processedHistory, filter])

	
	// Función para obtener la clase CSS del método de pago
	const getMethodBadgeClass = (method) => {
		if (!method) return 'method-badge default'
		
		const classes = {
			'Qr': 'method-badge qr',
			'efectivo': 'method-badge cash',
			'transferencia': 'method-badge transfer'
		}
		return classes[method] || 'method-badge default'
	}

	// Función para formatear el texto del método
	const formatMethodText = (method) => {
		if (!method) return '-'
		
		const methodLabels = {
			'Qr': 'QR',
			'efectivo': 'Efectivo',
			'transferencia': 'Transferencia'
		}
		return methodLabels[method] || method
	}
	
	const getTypeBadgeClass = (type) => {
		const classes = {
			sale: 'badge-sale',
			withdrawal: 'badge-withdrawal',
			new: 'badge-new',
			addition: 'badge-addition'
		}
		return `type-badge ${classes[type] || ''}`
	}


	return (
		<div className="history-container">
			<div className="date-stock-history-cont">
				<input
				type="date"
				value={selectedDate}
				onChange={handleDateChange}
				/>
				<p>{formatDateToSpanish(selectedDate || todayDate)}</p>
		</div>
			{/* Header con estadísticas */}
			<div className="history-header">
				<div className="stats-grid">
					<div className="stat-card blue">
						<p className="stat-label blue">Stock Total</p>
						<p className="stat-value blue">{finalStats.totalStockItems}</p>
					</div>
					<div className="stat-card green">
						<p className="stat-label green">Caja</p>
						<p className="stat-value green">Bs. {finalStats.totalCash}</p>
					</div>
					<div className="stat-card purple">
						<p className="stat-label purple">Productos Vendidos</p>
						<p className="stat-value purple">{finalStats.totalSales}</p>
					</div>
					<div className="stat-card orange">
						<p className="stat-label orange">Productos Retirados</p>
						<p className="stat-value orange">{finalStats.totalWithdrawals}</p>
					</div>
				</div>
			</div>

			{/* Filtros y botón de exportar */}
			<div className="filter-container">
				<div className="filter-controls">
					<label className="filter-label">Filtrar por:</label>
					<select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
						<option value="all">Todos</option>
						<option value="sale">Ventas</option>
						<option value="stock">Stock (Nuevos + Añadidos)</option>
						<option value="withdrawal">Retiros</option>
					</select>
				</div>

				{
					role === 'admin' && (
								<button 
									onClick={() => exportToExcel(filteredRows, filter, finalStats)}
									className="export-excel-btn"
									title="Exportar tabla a Excel"
								>
									<FileSpreadsheet size={16} />
									<span>Exportar Excel</span>
									<Download size={14} />
								</button>
						
					)
				}
				</div>

			{/* Tabla mejorada de historial */}
			<div className="table-container">
				<div className="table-scroll">
					<table className="history-table">
						<thead className="table-header">
							<tr>
								<th className="header-cell">Fecha & Hora</th>
								<th className="header-cell">Tipo</th>
								<th className="header-cell">Método</th>
								<th className="header-cell">Producto</th>
								<th className="header-cell">Cantidad</th>
								<th className="header-cell">Stock</th>
								<th className="header-cell">Precio Unit.</th>
								<th className="header-cell">Total</th>
								<th className="header-cell">Caja Acum.</th>
								<th className="header-cell">Detalles</th>
							</tr>
						</thead>
						<tbody className="table-body">
							{filteredRows.map((row) => (
								<tr key={row.id} className="table-row">
									<td className="table-cell cell-nowrap cell-text-sm text-gray-500">{formatDate(row.date)}</td>

									<td className="table-cell cell-nowrap">
										<span className={getTypeBadgeClass(row.type)}>{getTypeLabel(row.type)}</span>
									</td>

									<td className="table-cell cell-nowrap">
										<span className={getMethodBadgeClass(row.method)}>
											{formatMethodText(row.method)}
										</span>
									</td>

									<td className="table-cell">
										<div className="font-medium text-gray-900">{row.productName}</div>
										{row.isMultiProduct && (
											<div className="cell-text-xs text-gray-500">
												{row.productIndex + 1} de {row.totalProducts} productos
											</div>
										)}
									</td>

									<td className="table-cell cell-nowrap">
										<span className={`font-medium ${row.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
											{row.quantity > 0 ? '+' : ''}
											{row.quantity}
										</span>
									</td>

									<td className="table-cell cell-nowrap">
										<div className="cell-text-sm">
											<span className="text-gray-500">{row.previousQuantity}</span>
											<span className="text-gray-400 mx-1">→</span>
											<span className="font-medium text-gray-900">{row.newQuantity}</span>
										</div>
									</td>

									<td className="table-cell cell-nowrap">{row.price ? <span className="cell-text-sm font-medium">Bs. {row.price}</span> : <span className="text-gray-400">-</span>}</td>

									<td className="table-cell cell-nowrap">{row.total ? <span className="font-medium total-positive">Bs. {row.total}</span> : <span className="text-gray-400">-</span>}</td>

									<td className="table-cell cell-nowrap">
										<span className="font-medium text-blue-600">Bs. {row.cumulativeCash}</span>
									</td>

									<td className="table-cell">
										<div className="cell-text-xs text-gray-500">
											{row.withdrawalType && <div className="text-red-600 font-medium">{getWithdrawalTypeLabel(row.withdrawalType)}</div>}
											{row.saleId && <div className="text-gray-400">ID: {row.saleId.split('_')[2]?.slice(0, 6)}</div>}
											{row.reason && row.reason !== 'Sin observaciones' && <div>{row.reason}</div>}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{filteredRows.length === 0 && (
					<div className="empty-state">
						<p>No hay registros para mostrar con el filtro seleccionado.</p>
					</div>
				)}
			</div>
		</div>
	)
}