import React, { useState, useEffect } from 'react'
import { useStockHistoryStore } from '../../hooks/useStockHistoryStore'
import { getTodayDate } from '../../helpers/getTodayDate'
import './_Dashboard.scss'

export const Dashboard = () => {
	const today = getTodayDate()
	const { getStockHistoryFromDay, history } = useStockHistoryStore()

	const [selectedPeriod, setSelectedPeriod] = useState('today') // 'today', 'specific', 'last7days'
	const [specificDate, setSpecificDate] = useState(today)
	const [analyzedData, setAnalyzedData] = useState(null)
	const [loading, setLoading] = useState(false)

	// Función para obtener fechas de los últimos 7 días
	const getLast7Days = () => {
		const dates = []
		for (let i = 0; i < 7; i++) {
			const date = new Date()
			date.setDate(date.getDate() - i)
			dates.push(date.toISOString().split('T')[0])
		}
		return dates
	}

	// Función para analizar datos de un día específico
	const analyzeDayData = (entries) => {
		if (!entries || entries.length === 0) {
			return {
				totalSales: 0,
				totalRevenue: 0,
				productsSold: {},
				salesByMethod: {},
				paymentPercentages: {},
				newProducts: 0,
				topSellingProduct: null,
				leastSellingProduct: null,
				mostWithdrawnProduct: null,
				salesCount: 0,
				averageSaleValue: 0,
				productStats: {},
				revenueByProduct: {}
			}
		}

		const sales = entries.filter((entry) => entry.type === 'sale')
		const newProducts = entries.filter((entry) => entry.type === 'new')

		let totalRevenue = 0
		let totalQuantitySold = 0
		const productsSold = {}
		const salesByMethod = {}
		const revenueByProduct = {}
		const productWithdrawals = {} // Para contar retiros por producto
		let totalPaymentTransactions = 0

		sales.forEach((sale) => {
			// Contar método de pago
			salesByMethod[sale.method] = (salesByMethod[sale.method] || 0) + 1
			totalPaymentTransactions++

			sale.changes.forEach((change) => {
				totalRevenue += change.total
				const quantitySold = Math.abs(change.quantity)
				totalQuantitySold += quantitySold

				// Contar productos vendidos
				productsSold[change.productName] = (productsSold[change.productName] || 0) + quantitySold

				// Ingresos por producto
				revenueByProduct[change.productName] = (revenueByProduct[change.productName] || 0) + change.total

				// Contar retiros (cada vez que se vende se "retira" del inventario)
				productWithdrawals[change.productName] = (productWithdrawals[change.productName] || 0) + quantitySold
			})
		})

		// Calcular porcentajes de métodos de pago
		const paymentPercentages = {}
		Object.entries(salesByMethod).forEach(([method, count]) => {
			paymentPercentages[method] = totalPaymentTransactions > 0 ? ((count / totalPaymentTransactions) * 100).toFixed(1) : 0
		})

		// Encontrar productos más y menos vendidos
		const sortedProductsSold = Object.entries(productsSold).sort(([, a], [, b]) => b - a)
		const topSellingProduct = sortedProductsSold.length > 0 ? sortedProductsSold[0] : null
		const leastSellingProduct = sortedProductsSold.length > 1 ? sortedProductsSold[sortedProductsSold.length - 1] : null

		// Producto más retirado (mismo que más vendido en este caso)
		const mostWithdrawnProduct = Object.entries(productWithdrawals).length > 0 ? Object.entries(productWithdrawals).reduce((a, b) => (productWithdrawals[a[0]] > productWithdrawals[b[0]] ? a : b)) : null

		// Estadísticas detalladas por producto
		const productStats = {}
		Object.keys(productsSold).forEach((productName) => {
			productStats[productName] = {
				quantitySold: productsSold[productName],
				revenue: revenueByProduct[productName],
				averagePrice: revenueByProduct[productName] / productsSold[productName],
				withdrawals: productWithdrawals[productName]
			}
		})

		return {
			totalSales: totalQuantitySold,
			totalRevenue,
			productsSold,
			salesByMethod,
			paymentPercentages,
			newProducts: newProducts.length,
			topSellingProduct,
			leastSellingProduct,
			mostWithdrawnProduct,
			salesCount: sales.length,
			averageSaleValue: sales.length > 0 ? totalRevenue / sales.length : 0,
			productStats,
			revenueByProduct,
			productWithdrawals
		}
	}

	// Función para analizar datos de múltiples días
	const analyzeMultipleDays = async (dates) => {
		const allData = {
			totalSales: 0,
			totalRevenue: 0,
			productsSold: {},
			salesByMethod: {},
			paymentPercentages: {},
			newProducts: 0,
			dailyStats: {},
			topSellingProduct: null,
			leastSellingProduct: null,
			mostWithdrawnProduct: null,
			salesCount: 0,
			averageSaleValue: 0,
			productStats: {},
			revenueByProduct: {},
			productWithdrawals: {}
		}

		let totalPaymentTransactions = 0

		for (const date of dates) {
			try {
				const dayData = date === today ? { entries: history } : await getStockHistoryFromDay(date)
				if (dayData && dayData.entries) {
					const dayAnalysis = analyzeDayData(dayData.entries)

					// Acumular datos generales
					allData.totalSales += dayAnalysis.totalSales
					allData.totalRevenue += dayAnalysis.totalRevenue
					allData.newProducts += dayAnalysis.newProducts
					allData.salesCount += dayAnalysis.salesCount

					// Acumular productos vendidos y retiros
					Object.entries(dayAnalysis.productsSold).forEach(([product, quantity]) => {
						allData.productsSold[product] = (allData.productsSold[product] || 0) + quantity
						allData.productWithdrawals[product] = (allData.productWithdrawals[product] || 0) + quantity
					})

					// Acumular ingresos por producto
					Object.entries(dayAnalysis.revenueByProduct).forEach(([product, revenue]) => {
						allData.revenueByProduct[product] = (allData.revenueByProduct[product] || 0) + revenue
					})

					// Acumular métodos de pago
					Object.entries(dayAnalysis.salesByMethod).forEach(([method, count]) => {
						allData.salesByMethod[method] = (allData.salesByMethod[method] || 0) + count
						totalPaymentTransactions += count
					})

					// Guardar estadísticas diarias
					allData.dailyStats[date] = dayAnalysis
				}
			} catch (error) {
				console.error(`Error obteniendo datos del ${date}:`, error)
			}
		}

		// Calcular porcentajes de métodos de pago
		Object.entries(allData.salesByMethod).forEach(([method, count]) => {
			allData.paymentPercentages[method] = totalPaymentTransactions > 0 ? ((count / totalPaymentTransactions) * 100).toFixed(1) : 0
		})

		// Calcular productos más y menos vendidos
		const sortedProductsSold = Object.entries(allData.productsSold).sort(([, a], [, b]) => b - a)
		allData.topSellingProduct = sortedProductsSold.length > 0 ? sortedProductsSold[0] : null
		allData.leastSellingProduct = sortedProductsSold.length > 1 ? sortedProductsSold[sortedProductsSold.length - 1] : null

		// Producto más retirado
		allData.mostWithdrawnProduct = Object.entries(allData.productWithdrawals).length > 0 ? Object.entries(allData.productWithdrawals).reduce((a, b) => (allData.productWithdrawals[a[0]] > allData.productWithdrawals[b[0]] ? a : b)) : null

		allData.averageSaleValue = allData.salesCount > 0 ? allData.totalRevenue / allData.salesCount : 0

		// Estadísticas detalladas por producto
		Object.keys(allData.productsSold).forEach((productName) => {
			allData.productStats[productName] = {
				quantitySold: allData.productsSold[productName],
				revenue: allData.revenueByProduct[productName],
				averagePrice: allData.revenueByProduct[productName] / allData.productsSold[productName],
				withdrawals: allData.productWithdrawals[productName]
			}
		})

		return allData
	}

	// Función principal para cargar y analizar datos
	const loadAnalysisData = async () => {
		setLoading(true)
		try {
			let data

			if (selectedPeriod === 'today') {
				data = analyzeDayData(history)
			} else if (selectedPeriod === 'specific') {
				const dayData = specificDate === today ? { entries: history } : await getStockHistoryFromDay(specificDate)
				data = analyzeDayData(dayData?.entries || [])
			} else if (selectedPeriod === 'last7days') {
				const dates = getLast7Days()
				data = await analyzeMultipleDays(dates)
			}

			setAnalyzedData(data)
		} catch (error) {
			console.error('Error analizando datos:', error)
		} finally {
			setLoading(false)
		}
	}

	// Cargar datos cuando cambie el período seleccionado
	useEffect(() => {
		loadAnalysisData()
	}, [selectedPeriod, specificDate, history])

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('es-CL', {
			style: 'currency',
			currency: 'CLP'
		}).format(amount)
	}

	return (
		<div className="dashboard">
			<header className="dashboard-header">
				<h1>Dashboard de Inventario</h1>

				<div className="period-selector">
					<label>
						<input type="radio" value="today" checked={selectedPeriod === 'today'} onChange={(e) => setSelectedPeriod(e.target.value)} />
						Hoy ({today})
					</label>

					<label>
						<input type="radio" value="specific" checked={selectedPeriod === 'specific'} onChange={(e) => setSelectedPeriod(e.target.value)} />
						Fecha específica
					</label>

					{selectedPeriod === 'specific' && <input type="date" value={specificDate} onChange={(e) => setSpecificDate(e.target.value)} max={today} />}

					<label>
						<input type="radio" value="last7days" checked={selectedPeriod === 'last7days'} onChange={(e) => setSelectedPeriod(e.target.value)} />
						Últimos 7 días
					</label>
				</div>
			</header>

			{loading ? (
				<div className="loading">Cargando análisis...</div>
			) : analyzedData ? (
				<div className="dashboard-content">
					{/* Tarjetas de resumen */}
					<div className="summary-cards">
						<div className="card revenue">
							<h3>Ingresos Totales</h3>
							<p className="metric">{analyzedData.totalRevenue}Bs</p>
						</div>

						<div className="card sales">
							<h3>Productos Vendidos</h3>
							<p className="metric">{analyzedData.totalSales}</p>
						</div>

						<div className="card transactions">
							<h3>Número de Ventas</h3>
							<p className="metric">{analyzedData.salesCount}</p>
						</div>

						<div className="card average">
							<h3>Venta Promedio</h3>
							<p className="metric">{analyzedData.averageSaleValue.toFixed(2)}Bs</p>
						</div>
					</div>

					{/* Métricas de productos destacados */}
					<div className="highlight-section">
						{analyzedData.topSellingProduct && (
							<div className="card highlight top-product">
								<h3>🏆 Más Vendido</h3>
								<p className="product-name">{analyzedData.topSellingProduct[0]}</p>
								<p className="quantity">{analyzedData.topSellingProduct[1]} unidades</p>
								<p className="revenue">{analyzedData.revenueByProduct[analyzedData.topSellingProduct[0]] || 0}Bs</p>
							</div>
						)}

						{analyzedData.leastSellingProduct && (
							<div className="card highlight least-product">
								<h3>📉 Menos Vendido</h3>
								<p className="product-name">{analyzedData.leastSellingProduct[0]}</p>
								<p className="quantity">{analyzedData.leastSellingProduct[1]} unidades</p>
								<p className="revenue">{analyzedData.revenueByProduct[analyzedData.leastSellingProduct[0]] || 0}Bs</p>
							</div>
						)}

						{analyzedData.mostWithdrawnProduct && (
							<div className="card highlight withdrawn-product">
								<h3>📦 Más Retirado</h3>
								<p className="product-name">{analyzedData.mostWithdrawnProduct[0]}</p>
								<p className="quantity">{analyzedData.mostWithdrawnProduct[1]} retiros</p>
							</div>
						)}

						{analyzedData.newProducts > 0 && (
							<div className="card highlight new-products">
								<h3>✨ Nuevos Productos</h3>
								<p className="metric">{analyzedData.newProducts}</p>
							</div>
						)}
					</div>

					{/* Análisis de métodos de pago con porcentajes */}
					{Object.keys(analyzedData.salesByMethod).length > 0 && (
						<div className="section">
							<h2>💳 Análisis de Métodos de Pago</h2>
							<div className="payment-analysis">
								{Object.entries(analyzedData.salesByMethod).map(([method, count]) => {
									const percentage = analyzedData.paymentPercentages[method]
									const methodName = method === 'efectivo' ? 'Efectivo' : method.toUpperCase()

									return (
										<div key={method} className="payment-stat-card">
											<div className="payment-header">
												<h4>{methodName}</h4>
												<span className="percentage">{percentage}%</span>
											</div>
											<div className="payment-details">
												<span>{count} transacciones</span>
												<div className="percentage-bar">
													<div className="percentage-fill" style={{ width: `${percentage}%` }}></div>
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* Ranking de productos detallado */}
					{Object.keys(analyzedData.productsSold).length > 0 && (
						<div className="section">
							<h2>📊 Ranking de Productos</h2>
							<div className="products-ranking">
								{Object.entries(analyzedData.productStats)
									.sort(([, a], [, b]) => b.quantitySold - a.quantitySold)
									.map(([productName, stats], index) => (
										<div key={productName} className={`product-rank-card ${index === 0 ? 'top-seller' : ''}`}>
											<div className="rank-number">#{index + 1}</div>
											<div className="product-info">
												<h4>{productName}</h4>
												<div className="product-metrics">
													<span className="metric-item">
														<strong>{stats.quantitySold}</strong> vendidos
													</span>
													<span className="metric-item">
														<strong>{stats.revenue}Bs</strong> ingresos
													</span>
													<span className="metric-item">
														<strong>{stats.averagePrice}Bs</strong> precio prom.
													</span>
													<span className="metric-item">
														<strong>{stats.withdrawals}</strong> retiros
													</span>
												</div>
											</div>
										</div>
									))}
							</div>
						</div>
					)}

					{/* Métricas de rendimiento */}
					<div className="section">
						<h2>⚡ Métricas de Rendimiento</h2>
						<div className="performance-grid">
							<div className="performance-card">
								<h4>Eficiencia de Ventas</h4>
								<p className="big-metric">{analyzedData.salesCount > 0 ? (analyzedData.totalSales / analyzedData.salesCount).toFixed(1) : 0}</p>
								<span>productos por venta</span>
							</div>

							<div className="performance-card">
								<h4>Diversidad de Productos</h4>
								<p className="big-metric">{Object.keys(analyzedData.productsSold).length}</p>
								<span>productos diferentes vendidos</span>
							</div>

							<div className="performance-card">
								<h4>Método de Pago Preferido</h4>
								<p className="big-metric">{Object.keys(analyzedData.salesByMethod).length > 0 ? Object.entries(analyzedData.salesByMethod).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : 'N/A'}</p>
								<span>{Object.keys(analyzedData.paymentPercentages).length > 0 ? `${Math.max(...Object.values(analyzedData.paymentPercentages))}% de las ventas` : ''}</span>
							</div>
						</div>
					</div>

					{/* Estadísticas diarias (solo para últimos 7 días) */}
					{selectedPeriod === 'last7days' && analyzedData.dailyStats && (
						<div className="section">
							<h2>Estadísticas Diarias</h2>
							<div className="daily-stats">
								{Object.entries(analyzedData.dailyStats)
									.sort(([a], [b]) => new Date(b) - new Date(a))
									.map(([date, stats]) => (
										<div key={date} className="daily-card">
											<h4>{date}</h4>
											<div className="daily-metrics">
												<span>Ventas: {stats.salesCount}</span>
												<span>Ingresos: {stats.totalRevenue}Bs</span>
												<span>Productos: {stats.totalSales}</span>
											</div>
										</div>
									))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="no-data">No hay datos disponibles para el período seleccionado</div>
			)}
		</div>
	)
}
