import React from 'react'
import { useProductStore } from '../../hooks/useProductStore'
import { useStockStore } from '../../hooks/useStockStore'
import { getStockItemById } from '../../helpers/getStockItemById'

export const Sale = () => {
	const { products } = useProductStore()
	const {stock} = useStockStore()
	return (
		<div>
			<h1>Sale</h1>
			<ul>
				{products.map((product) => (
					<li key={product.id}>{product.name}</li>
				))}
			</ul>
			{/* {stock.map((s) => {
				const stockItem = getStockItemById
			})} */}
		</div>
	)
}
