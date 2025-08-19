import React, { useState, useMemo } from 'react'
import { Download, FileSpreadsheet } from 'lucide-react'
import * as XLSX from 'xlsx'
import { useStockHistoryStore } from '../../hooks/useStockHistoryStore'
import './_History.scss'

export const History = () => {
	const { history } = useStockHistoryStore()
	const [filter, setFilter] = useState('all')

	// Calcular estadísticas finales
	const finalStats = useMemo(() => {
		let totalCash = 0
		let currentStock = {}
		let totalSales = 0
		let totalWithdrawals = 0

		history.forEach((entry) => {
			entry.changes.forEach((change) => {
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
	}, [history])

	// Procesar historial: una fila por producto, con dinero acumulado
	const processedHistory = useMemo(() => {
		const rows = []

		// Primero, crear todas las filas en orden cronológico normal (más antiguo primero)
		const sortedHistory = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
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
	}, [history])

	// Filtrar filas procesadas
	const filteredRows = useMemo(() => {
		if (filter === 'all') return processedHistory
		return processedHistory.filter((row) => {
			if (filter === 'stock') return ['new', 'addition'].includes(row.type)
			return row.type === filter
		})
	}, [processedHistory, filter])

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		return date.toLocaleString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const getTypeLabel = (type) => {
		const labels = {
			sale: 'Venta',
			withdrawal: 'Retiro',
			new: 'Nuevo',
			addition: 'Stock+'
		}
		return labels[type] || type
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

	const getWithdrawalTypeLabel = (withdrawalType) => {
		const labels = {
			lost: 'Perdido',
			returned: 'Devuelto',
			damaged: 'Dañado',
			expired: 'Vencido'
		}
		return labels[withdrawalType] || withdrawalType
	}

	const getFilterLabel = (filterValue) => {
		const labels = {
			all: 'Todos_los_Registros',
			sale: 'Ventas',
			stock: 'Movimientos_de_Stock',
			withdrawal: 'Retiros'
		}
		return labels[filterValue] || filterValue
	}

	// Función para exportar a Excel con estilos profesionales
	const exportToExcel = () => {
		try {
			const now = new Date()
			const timestamp = now.toLocaleString('es-ES', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).replace(/[/:]/g, '-').replace(',', '_')

			const filterLabel = getFilterLabel(filter)
			const fileName = `Historial_${filterLabel}_${timestamp}.xlsx`

			// Crear workbook
			const wb = XLSX.utils.book_new()

			// Datos para la hoja principal
			const wsData = []

			// Header de empresa
			wsData.push(['MARRAQUETAS YA - HISTORIAL DE MOVIMIENTOS'])
			wsData.push([`Reporte generado: ${now.toLocaleString('es-ES')}`])
			wsData.push([`Filtro aplicado: ${getFilterLabel(filter).replace('_', ' ')}`])
			wsData.push([`Total de registros: ${filteredRows.length}`])
			wsData.push([]) // Fila vacía

			// Estadísticas resumen
			wsData.push(['RESUMEN ESTADÍSTICO'])
			wsData.push(['Stock Total Actual:', finalStats.totalStockItems, 'productos'])
			wsData.push(['Caja Total:', `Bs. ${finalStats.totalCash}`])
			wsData.push(['Total Productos Vendidos:', finalStats.totalSales])
			wsData.push(['Total Productos Retirados:', finalStats.totalWithdrawals])
			wsData.push([]) // Fila vacía

			// Headers de la tabla
			wsData.push([
				'Fecha y Hora',
				'Tipo de Movimiento',
				'Producto',
				'Cantidad',
				'Stock Anterior',
				'Stock Nuevo',
				'Precio Unitario',
				'Total Transacción',
				'Caja Acumulada',
				'Tipo de Retiro',
				'ID Venta',
				'Observaciones'
			])

			// Datos de la tabla
			filteredRows.forEach(row => {
				wsData.push([
					formatDate(row.date),
					getTypeLabel(row.type),
					row.productName,
					row.quantity,
					row.previousQuantity || '-',
					row.newQuantity || '-',
					row.price || '',
					row.total || '',
					row.cumulativeCash,
					row.withdrawalType ? getWithdrawalTypeLabel(row.withdrawalType) : '-',
					row.saleId ? row.saleId.split('_')[2]?.slice(0, 8) : '-',
					(row.reason && row.reason !== 'Sin observaciones') ? row.reason : '-'
				])
			})

			// Crear worksheet
			const ws = XLSX.utils.aoa_to_sheet(wsData)

			// Configurar anchos de columnas optimizados
			const colWidths = [
				{ wch: 18 }, // Fecha y Hora
				{ wch: 16 }, // Tipo
				{ wch: 22 }, // Producto
				{ wch: 10 }, // Cantidad
				{ wch: 12 }, // Stock Anterior
				{ wch: 12 }, // Stock Nuevo
				{ wch: 14 }, // Precio
				{ wch: 16 }, // Total
				{ wch: 16 }, // Caja Acum
				{ wch: 14 }, // Tipo Retiro
				{ wch: 12 }, // ID Venta
				{ wch: 28 }  // Observaciones
			]
			ws['!cols'] = colWidths

			// === ESTILOS PROFESIONALES ===

			// Estilo para el título principal (A1)
			const mainTitleStyle = {
				font: { 
					bold: true, 
					size: 16, 
					color: { rgb: "FFFFFF" },
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "1F4E79" } // Azul marino profesional
				},
				alignment: { 
					horizontal: "center", 
					vertical: "center" 
				},
				border: {
					top: { style: "thin", color: { rgb: "000000" } },
					bottom: { style: "thin", color: { rgb: "000000" } },
					left: { style: "thin", color: { rgb: "000000" } },
					right: { style: "thin", color: { rgb: "000000" } }
				}
			}

			// Estilo para información del reporte (A2:A4)
			const infoStyle = {
				font: { 
					size: 11, 
					color: { rgb: "404040" },
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "F2F2F2" } 
				},
				alignment: { 
					horizontal: "left", 
					vertical: "center" 
				}
			}

			// Estilo para título de sección estadísticas
			const sectionTitleStyle = {
				font: { 
					bold: true, 
					size: 12, 
					color: { rgb: "FFFFFF" },
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "70AD47" } // Verde
				},
				alignment: { 
					horizontal: "center", 
					vertical: "center" 
				},
				border: {
					top: { style: "thin", color: { rgb: "000000" } },
					bottom: { style: "thin", color: { rgb: "000000" } },
					left: { style: "thin", color: { rgb: "000000" } },
					right: { style: "thin", color: { rgb: "000000" } }
				}
			}

			// Estilo para datos de estadísticas
			const statsStyle = {
				font: { 
					size: 10, 
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "E2EFDA" } // Verde claro
				},
				alignment: { 
					horizontal: "left", 
					vertical: "center" 
				}
			}

			// Estilo para headers de tabla
			const tableHeaderStyle = {
				font: { 
					bold: true, 
					size: 11, 
					color: { rgb: "FFFFFF" },
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "4472C4" } // Azul Microsoft
				},
				alignment: { 
					horizontal: "center", 
					vertical: "center",
					wrapText: true
				},
				border: {
					top: { style: "thin", color: { rgb: "FFFFFF" } },
					bottom: { style: "thin", color: { rgb: "FFFFFF" } },
					left: { style: "thin", color: { rgb: "FFFFFF" } },
					right: { style: "thin", color: { rgb: "FFFFFF" } }
				}
			}

			// Estilo para datos de tabla (alternados)
			const tableDataStyle1 = {
				font: { 
					size: 10, 
					name: "Calibri"
				},
				fill: { 
					fgColor: { rgb: "FFFFFF" } 
				},
				alignment: { 
					horizontal: "center", 
					vertical: "center" 
				},
				border: {
					top: { style: "thin", color: { rgb: "D0D0D0" } },
					bottom: { style: "thin", color: { rgb: "D0D0D0" } },
					left: { style: "thin", color: { rgb: "D0D0D0" } },
					right: { style: "thin", color: { rgb: "D0D0D0" } }
				}
			}

			const tableDataStyle2 = {
				...tableDataStyle1,
				fill: { 
					fgColor: { rgb: "F8F9FA" } // Gris muy claro alternado
				}
			}

			// Estilo para números positivos (verde)
			const positiveNumberStyle = {
				...tableDataStyle1,
				font: { 
					size: 10, 
					name: "Calibri",
					color: { rgb: "00B050" }
				}
			}

			// Estilo para números negativos (rojo)
			const negativeNumberStyle = {
				...tableDataStyle1,
				font: { 
					size: 10, 
					name: "Calibri",
					color: { rgb: "C5504B" }
				}
			}

			// Aplicar estilos

			// Título principal (merge A1:L1)
			ws['!merges'] = [
				{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }, // Título principal
				{ s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }   // Título estadísticas
			]
			
			// Aplicar estilo al título principal
			if (ws['A1']) ws['A1'].s = mainTitleStyle

			// Aplicar estilo a información del reporte
			for (let row = 1; row <= 3; row++) {
				const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 })
				if (ws[cellRef]) ws[cellRef].s = infoStyle
			}

			// Aplicar estilo al título de estadísticas
			if (ws['A6']) ws['A6'].s = sectionTitleStyle

			// Aplicar estilo a datos de estadísticas (filas 6-10)
			for (let row = 6; row <= 10; row++) {
				for (let col = 0; col <= 2; col++) {
					const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
					if (ws[cellRef]) {
						ws[cellRef].s = statsStyle
						// Destacar valores numéricos
						if (col === 1 && typeof ws[cellRef].v === 'number') {
							ws[cellRef].s = {
								...statsStyle,
								font: {
									...statsStyle.font,
									bold: true,
									color: { rgb: "1F4E79" }
								}
							}
						}
					}
				}
			}

			// Aplicar estilo a headers de tabla (fila 11)
			const tableHeaderRow = 11
			for (let col = 0; col < 12; col++) {
				const cellRef = XLSX.utils.encode_cell({ r: tableHeaderRow, c: col })
				if (ws[cellRef]) {
					ws[cellRef].s = tableHeaderStyle
				}
			}

			// Aplicar estilos a datos de tabla
			const dataStartRow = 12
			for (let row = 0; row < filteredRows.length; row++) {
				const currentRow = dataStartRow + row
				const isEvenRow = row % 2 === 0
				
				for (let col = 0; col < 12; col++) {
					const cellRef = XLSX.utils.encode_cell({ r: currentRow, c: col })
					if (ws[cellRef]) {
						let cellStyle = isEvenRow ? tableDataStyle1 : tableDataStyle2

						// Estilos especiales por columna
						if (col === 3) { // Columna de cantidad
							const value = ws[cellRef].v
							if (typeof value === 'number') {
								cellStyle = value > 0 ? positiveNumberStyle : negativeNumberStyle
							}
						} else if (col === 1) { // Columna de tipo
							// Diferentes colores según el tipo
							const typeValue = ws[cellRef].v
							if (typeValue === 'Venta') {
								cellStyle = {
									...cellStyle,
									fill: { fgColor: { rgb: "E8F5E8" } },
									font: { ...cellStyle.font, color: { rgb: "00B050" } }
								}
							} else if (typeValue === 'Retiro') {
								cellStyle = {
									...cellStyle,
									fill: { fgColor: { rgb: "FFE8E8" } },
									font: { ...cellStyle.font, color: { rgb: "C5504B" } }
								}
							}
						} else if ([6, 7, 8].includes(col)) { // Columnas de dinero
							cellStyle = {
								...cellStyle,
								font: { ...cellStyle.font, color: { rgb: "00B050" } }
							}
						}

						ws[cellRef].s = cellStyle
					}
				}
			}

			// Formato de números para columnas de dinero
			for (let row = dataStartRow; row < dataStartRow + filteredRows.length; row++) {
				// Precio unitario
				const priceCell = XLSX.utils.encode_cell({ r: row, c: 6 })
				if (ws[priceCell] && typeof ws[priceCell].v === 'number') {
					ws[priceCell].z = '"Bs. "#,##0.00'
				}
				
				// Total transacción
				const totalCell = XLSX.utils.encode_cell({ r: row, c: 7 })
				if (ws[totalCell] && typeof ws[totalCell].v === 'number') {
					ws[totalCell].z = '"Bs. "#,##0.00'
				}
				
				// Caja acumulada
				const cashCell = XLSX.utils.encode_cell({ r: row, c: 8 })
				if (ws[cashCell] && typeof ws[cashCell].v === 'number') {
					ws[cashCell].z = '"Bs. "#,##0.00'
				}
			}

			// Agregar worksheet al workbook
			XLSX.utils.book_append_sheet(wb, ws, 'Historial')

			// === CREAR HOJA DE STOCK CON ESTILOS ===
			if (Object.keys(finalStats.currentStock).length > 0) {
				const stockData = [
					['STOCK ACTUAL POR PRODUCTO'],
					[`Actualizado: ${now.toLocaleString('es-ES')}`],
					[],
					['Producto', 'Cantidad en Stock', 'Estado']
				]

				Object.entries(finalStats.currentStock)
					.sort(([a], [b]) => a.localeCompare(b))
					.forEach(([product, quantity]) => {
						const status = quantity > 10 ? 'Stock Normal' : quantity > 0 ? 'Stock Bajo' : 'Sin Stock'
						stockData.push([product, quantity, status])
					})

				const stockWs = XLSX.utils.aoa_to_sheet(stockData)
				stockWs['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 15 }]

				// Estilos para hoja de stock
				stockWs['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
				
				// Título de stock
				if (stockWs['A1']) {
					stockWs['A1'].s = {
						...mainTitleStyle,
						fill: { fgColor: { rgb: "70AD47" } }
					}
				}

				// Headers de stock
				for (let col = 0; col < 3; col++) {
					const cellRef = XLSX.utils.encode_cell({ r: 3, c: col })
					if (stockWs[cellRef]) {
						stockWs[cellRef].s = tableHeaderStyle
					}
				}

				// Datos de stock con colores según cantidad
				for (let row = 4; row < stockData.length; row++) {
					for (let col = 0; col < 3; col++) {
						const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
						if (stockWs[cellRef]) {
							let cellStyle = row % 2 === 0 ? tableDataStyle1 : tableDataStyle2
							
							// Color según la cantidad de stock
							if (col === 2) { // Columna de estado
								const status = stockWs[cellRef].v
								if (status === 'Stock Normal') {
									cellStyle = { ...cellStyle, font: { ...cellStyle.font, color: { rgb: "00B050" } } }
								} else if (status === 'Stock Bajo') {
									cellStyle = { ...cellStyle, font: { ...cellStyle.font, color: { rgb: "FF8C00" } } }
								} else {
									cellStyle = { ...cellStyle, font: { ...cellStyle.font, color: { rgb: "C5504B" } } }
								}
							}
							
							stockWs[cellRef].s = cellStyle
						}
					}
				}

				XLSX.utils.book_append_sheet(wb, stockWs, 'Stock Actual')
			}

			// Descargar archivo
			XLSX.writeFile(wb, fileName)

			// Mostrar mensaje de éxito
			console.log(`Excel profesional exportado: ${fileName}`)

		} catch (error) {
			console.error('Error al exportar Excel:', error)
			alert('Error al generar el archivo Excel. Por favor intente nuevamente.')
		}
	}

	return (
		<div className="history-container">
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

				<button 
					onClick={exportToExcel}
					className="export-excel-btn"
					title="Exportar tabla a Excel"
				>
					<FileSpreadsheet size={16} />
					<span>Exportar Excel</span>
					<Download size={14} />
				</button>
			</div>

			{/* Tabla mejorada de historial */}
			<div className="table-container">
				<div className="table-scroll">
					<table className="history-table">
						<thead className="table-header">
							<tr>
								<th className="header-cell">Fecha & Hora</th>
								<th className="header-cell">Tipo</th>
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