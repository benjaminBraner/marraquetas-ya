import { createSlice } from '@reduxjs/toolkit'


// {
// 	id: "abc123",
// 	nombre: "Pan Francés",
// 	categoria: "panes", // 'panes' | 'pasteleria' | 'bebidas' | 'otros'
// 	imagen: "https://...", // URL de la imagen
// 	precioTipo: "simple", // "simple" o "multiple"
// 	precioUnitario: 2, // Solo si es simple
// 	precios: [ // Solo si es multiple
// 		{ cantidad: 1, precio: 2 },
// 		{ cantidad: 3, precio: 5 },
// 		{ cantidad: 6, precio: 10 }
// 	]
// }

export const productSlice = createSlice({
	name: 'product',
	initialState: {
		products: [],
		status: 'idle', // idle | loading | saving | error
		errorMessage: null
	},
	reducers: {
	// Cargar lista de productos completa
		setProducts: (state, action) => {
			state.products = action.payload
			state.status = 'idle'
			state.errorMessage = null
		},

		// Agregar producto
		addProduct: (state, action) => {
			state.products.push(action.payload)
			state.status = 'idle'
		},

		// Editar producto
		updateProduct: (state, action) => {
			state.products = state.products.map(product => 
				product.id === action.payload.id 
					? { ...product, ...action.payload }  // Merge de propiedades
					: product
			)
			state.status = 'idle'
		},

		// Eliminar producto
		deleteProduct: (state, action) => {
			state.products = state.products.filter((p) => p.id !== action.payload)
			state.status = 'idle'
		},

		// Cambiar estado (loading/saving)
		setStatus: (state, action) => {
			state.status = action.payload
		},

		// Guardar error
		setError: (state, action) => {
			state.errorMessage = action.payload
			state.status = 'error'
		}
	}
})

export const { 
	setProducts, 
	addProduct, 
	updateProduct, 
	deleteProduct, 
	setStatus, 
	setError 
} = productSlice.actions

