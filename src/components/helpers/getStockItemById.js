export const getStockItemById = (id, stock) => {
	return stock.find((item) => item.id === id)
}