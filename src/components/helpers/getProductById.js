

export const getProductById = async (id, products) => {

		const product = products.find((product) => product.id === id)
		console.log(product)
		return product
	
}