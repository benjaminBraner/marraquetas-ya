import { getFilterLabel } from "./getFilterLabel"
import ExcelJS from 'exceljs'
import { getWithdrawalTypeLabel } from "./getWithdrawalTypeLabel"
import { formatDate } from "./formatDate"
import { getTypeLabel } from "./getTypeLabel"

export const exportToExcel = async (filteredRows, filter, finalStats) => {
    // Función helper para formatear el método de pago
    const formatMethodForExcel = (method) => {
        if (!method) return '-'
        
        const methodLabels = {
            'Qr': 'QR',
            'efectivo': 'Efectivo',
            'transferencia': 'Transferencia'
        }
        return methodLabels[method] || method
    }

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

        // Crear workbook con ExcelJS
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Marraquetas Ya'
        workbook.created = new Date()

        // === HOJA PRINCIPAL: HISTORIAL ===
        const worksheet = workbook.addWorksheet('Historial', {
            pageSetup: { 
                orientation: 'landscape',
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0
            }
        })

        // Configurar anchos de columnas
        worksheet.columns = [
            { width: 18 }, // Fecha y Hora
            { width: 16 }, // Tipo
            { width: 14 }, // Método
            { width: 22 }, // Producto
            { width: 10 }, // Cantidad
            { width: 12 }, // Stock Anterior
            { width: 12 }, // Stock Nuevo
            { width: 14 }, // Precio
            { width: 16 }, // Total
            { width: 16 }, // Caja Acum
            { width: 14 }, // Tipo Retiro
            { width: 12 }, // ID Venta
            { width: 28 }  // Observaciones
        ]

        let currentRow = 1

        // === HEADER DE EMPRESA ===
        // Título principal (merge A1:M1)
        worksheet.mergeCells('A1:M1')
        const titleCell = worksheet.getCell('A1')
        titleCell.value = 'MARRAQUETAS YA - HISTORIAL DE MOVIMIENTOS'
        titleCell.style = {
            font: { 
                bold: true, 
                size: 16, 
                color: { argb: 'FFFFFFFF' },
                name: 'Calibri'
            },
            fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1F4E79' }
            },
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle' 
            },
            border: {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            }
        }
        worksheet.getRow(1).height = 25
        currentRow++

        // Información del reporte
        const reportInfo = [
            `Reporte generado: ${now.toLocaleString('es-ES')}`,
            `Filtro aplicado: ${getFilterLabel(filter).replace('_', ' ')}`,
            `Total de registros: ${filteredRows.length}`
        ]

        const infoStyle = {
            font: { 
                size: 11, 
                color: { argb: 'FF404040' },
                name: 'Calibri'
            },
            fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF2F2F2' }
            },
            alignment: { 
                horizontal: 'left', 
                vertical: 'middle' 
            }
        }

        reportInfo.forEach(info => {
            const cell = worksheet.getCell(`A${currentRow}`)
            cell.value = info
            cell.style = infoStyle
            currentRow++
        })

        currentRow++ // Fila vacía

        // === ESTADÍSTICAS RESUMEN ===
        // Título de estadísticas (merge A6:C6)
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`)
        const statsTitle = worksheet.getCell(`A${currentRow}`)
        statsTitle.value = 'RESUMEN ESTADÍSTICO'
        statsTitle.style = {
            font: { 
                bold: true, 
                size: 12, 
                color: { argb: 'FFFFFFFF' },
                name: 'Calibri'
            },
            fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF70AD47' }
            },
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle' 
            },
            border: {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            }
        }
        worksheet.getRow(currentRow).height = 20
        currentRow++

        // Datos estadísticos
        const statsData = [
            ['Stock Total Actual:', finalStats.totalStockItems, 'productos'],
            ['Caja Total:', `Bs. ${finalStats.totalCash}`, ''],
            ['Total Productos Vendidos:', finalStats.totalSales, ''],
            ['Total Productos Retirados:', finalStats.totalWithdrawals, '']
        ]

        const statsStyle = {
            font: { 
                size: 10, 
                name: 'Calibri'
            },
            fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE2EFDA' }
            },
            alignment: { 
                horizontal: 'left', 
                vertical: 'middle' 
            }
        }

        const statsValueStyle = {
            ...statsStyle,
            font: {
                ...statsStyle.font,
                bold: true,
                color: { argb: 'FF1F4E79' }
            }
        }

        statsData.forEach(([label, value, unit]) => {
            const labelCell = worksheet.getCell(`A${currentRow}`)
            const valueCell = worksheet.getCell(`B${currentRow}`)
            const unitCell = worksheet.getCell(`C${currentRow}`)
            
            labelCell.value = label
            valueCell.value = value
            unitCell.value = unit
            
            labelCell.style = statsStyle
            valueCell.style = statsValueStyle
            unitCell.style = statsStyle
            
            currentRow++
        })

        currentRow++ // Fila vacía

        // === HEADERS DE TABLA ===
        const headers = [
            'Fecha y Hora',
            'Tipo de Movimiento',
            'Método de Pago',
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
        ]

        const headerStyle = {
            font: { 
                bold: true, 
                size: 11, 
                color: { argb: 'FFFFFFFF' },
                name: 'Calibri'
            },
            fill: { 
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            },
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle',
                wrapText: true
            },
            border: {
                top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
            }
        }

        headers.forEach((header, index) => {
            const cell = worksheet.getCell(currentRow, index + 1)
            cell.value = header
            cell.style = headerStyle
        })
        worksheet.getRow(currentRow).height = 30
        const headerRowIndex = currentRow
        currentRow++

        // === DATOS DE LA TABLA ===
        const baseDataStyle = {
            font: { 
                size: 10, 
                name: 'Calibri'
            },
            alignment: { 
                horizontal: 'center', 
                vertical: 'middle' 
            },
            border: {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            }
        }

        filteredRows.forEach((row, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0
            const rowStyle = {
                ...baseDataStyle,
                fill: { 
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: isEvenRow ? 'FFFFFFFF' : 'FFF8F9FA' }
                }
            }

            const rowData = [
                formatDate(row.date),
                getTypeLabel(row.type),
                formatMethodForExcel(row.method), // Nueva columna método
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
            ]

            rowData.forEach((value, colIndex) => {
                const cell = worksheet.getCell(currentRow, colIndex + 1)
                cell.value = value
                
                // Estilo base
                let cellStyle = { ...rowStyle }

                // Estilos especiales por columna
                if (colIndex === 4) { // Cantidad (ahora índice 4)
                    const quantity = row.quantity
                    cellStyle.font = {
                        ...cellStyle.font,
                        bold: true,
                        color: { argb: quantity > 0 ? 'FF00B050' : 'FFC5504B' }
                    }
                } else if (colIndex === 1) { // Tipo de movimiento
                    const typeValue = getTypeLabel(row.type)
                    if (typeValue === 'Venta') {
                        cellStyle.fill = { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE8F5E8' }
                        }
                        cellStyle.font = { ...cellStyle.font, color: { argb: 'FF00B050' } }
                    } else if (typeValue === 'Retiro') {
                        cellStyle.fill = { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFE8E8' }
                        }
                        cellStyle.font = { ...cellStyle.font, color: { argb: 'FFC5504B' } }
                    }
                } else if (colIndex === 2) { // Método de pago (nueva columna)
                    const methodValue = formatMethodForExcel(row.method)
                    if (methodValue === 'QR') {
                        cellStyle.fill = { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE3F2FD' }
                        }
                        cellStyle.font = { ...cellStyle.font, color: { argb: 'FF1565C0' } }
                    } else if (methodValue === 'Efectivo') {
                        cellStyle.fill = { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE8F5E8' }
                        }
                        cellStyle.font = { ...cellStyle.font, color: { argb: 'FF2E7D32' } }
                    } else if (methodValue === 'Transferencia') {
                        cellStyle.fill = { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF3E5F5' }
                        }
                        cellStyle.font = { ...cellStyle.font, color: { argb: 'FF7B1FA2' } }
                    }
                } else if ([7, 8, 9].includes(colIndex)) { // Columnas de dinero (ahora índices 7, 8, 9)
                    cellStyle.font = { 
                        ...cellStyle.font, 
                        color: { argb: 'FF00B050' },
                        bold: colIndex === 9 // Caja acumulada en bold
                    }
                    
                    // Formato de moneda para columnas de precio y totales
                    if ([7, 8, 9].includes(colIndex) && typeof value === 'number') {
                        cell.numFmt = '"Bs. "#,##0.00'
                    }
                }

                cell.style = cellStyle
            })
            
            worksheet.getRow(currentRow).height = 18
            currentRow++
        })

        // === HOJA DE STOCK ACTUAL ===
        if (Object.keys(finalStats.currentStock).length > 0) {
            const stockWorksheet = workbook.addWorksheet('Stock Actual')
            
            stockWorksheet.columns = [
                { width: 28 }, // Producto
                { width: 18 }, // Cantidad
                { width: 15 }  // Estado
            ]

            let stockRow = 1

            // Título de stock (merge A1:C1)
            stockWorksheet.mergeCells('A1:C1')
            const stockTitle = stockWorksheet.getCell('A1')
            stockTitle.value = 'STOCK ACTUAL POR PRODUCTO'
            stockTitle.style = {
                font: { 
                    bold: true, 
                    size: 16, 
                    color: { argb: 'FFFFFFFF' },
                    name: 'Calibri'
                },
                fill: { 
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF70AD47' }
                },
                alignment: { 
                    horizontal: 'center', 
                    vertical: 'middle' 
                },
                border: {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                }
            }
            stockWorksheet.getRow(1).height = 25
            stockRow += 2 // Saltar una fila

            // Headers de stock
            const stockHeaders = ['Producto', 'Cantidad en Stock', 'Estado']
            stockHeaders.forEach((header, index) => {
                const cell = stockWorksheet.getCell(stockRow, index + 1)
                cell.value = header
                cell.style = {
                    font: { 
                        bold: true, 
                        size: 11, 
                        color: { argb: 'FFFFFFFF' },
                        name: 'Calibri'
                    },
                    fill: { 
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF4472C4' }
                    },
                    alignment: { 
                        horizontal: 'center', 
                        vertical: 'middle' 
                    },
                    border: {
                        top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                        left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                        bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
                        right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
                    }
                }
            })
            stockWorksheet.getRow(stockRow).height = 25
            stockRow++

            // Datos de stock
            Object.entries(finalStats.currentStock)
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([product, quantity], index) => {
                    const status = quantity > 10 ? 'Stock Normal' : quantity > 0 ? 'Stock Bajo' : 'Sin Stock'
                    const isEvenRow = index % 2 === 0
                    
                    // Producto
                    const productCell = stockWorksheet.getCell(stockRow, 1)
                    productCell.value = product
                    productCell.style = {
                        font: { size: 10, name: 'Calibri' },
                        fill: { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: isEvenRow ? 'FFFFFFFF' : 'FFF8F9FA' }
                        },
                        alignment: { horizontal: 'left', vertical: 'middle' },
                        border: {
                            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                        }
                    }

                    // Cantidad
                    const quantityCell = stockWorksheet.getCell(stockRow, 2)
                    quantityCell.value = quantity
                    quantityCell.style = {
                        font: { 
                            size: 10, 
                            name: 'Calibri',
                            bold: true
                        },
                        fill: { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: isEvenRow ? 'FFFFFFFF' : 'FFF8F9FA' }
                        },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        border: {
                            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                        }
                    }

                    // Estado
                    const statusCell = stockWorksheet.getCell(stockRow, 3)
                    statusCell.value = status
                    
                    let statusColor = 'FF00B050' // Verde por defecto
                    if (status === 'Stock Bajo') statusColor = 'FFFF8C00' // Naranja
                    if (status === 'Sin Stock') statusColor = 'FFC5504B' // Rojo

                    statusCell.style = {
                        font: { 
                            size: 10, 
                            name: 'Calibri',
                            bold: true,
                            color: { argb: statusColor }
                        },
                        fill: { 
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: isEvenRow ? 'FFFFFFFF' : 'FFF8F9FA' }
                        },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        border: {
                            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                        }
                    }

                    stockRow++
                })
        }

        // Generar y descargar el archivo
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log(`Excel profesional exportado: ${fileName}`)

    } catch (error) {
        console.error('Error al exportar Excel:', error)
        alert('Error al generar el archivo Excel. Por favor intente nuevamente.')
    }
}