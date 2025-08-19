import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addProduct, deleteProduct, setProducts, setStatus, updateProduct } from '../store/slices/productSlice'
import { fileUpload } from '../helpers/fileUpload'
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore"
import { FirestoreDB } from '../../firebase/firebase-config'
import { getProductById } from '../helpers/getProductById'
import { deleteImageFromUrl } from '../helpers/deleteImageFromUrl'

export const useProductStore = () => {
	const savingStatus = 'saving'
	const loadingStatus = 'loading'
	const idleStatus = 'idle'
	const errorStatus = 'idle'
	
	const dispatch = useDispatch()
	const { products, status, errorMessage } = useSelector(state => state.product)
	
	const startAddProduct = async (product) => {
		dispatch(setStatus(savingStatus))
		
		try {
			const productsRef = collection(FirestoreDB, `products`)
			
			if (product.image) {
				const imgUrl = await fileUpload(product.image)
				product.image = imgUrl
			}
			
			const docRef = await addDoc(productsRef, product)
			// dispatch(addProduct({ id: docRef.id, ...product }))
			
		} catch (error) {
			console.log(error)
			dispatch(setStatus(errorStatus))
		}
	}
	
	const startEditProduct = async (product) => {
		dispatch(setStatus(savingStatus))
		
		try {
			const docRef = doc(FirestoreDB, `products/${product.id}`)
			// si vino una nueva img
			if (product.image.name) {
				// const { image } = await getProductById(product.id, products) 
				// if (image) await deleteImageFromUrl(image)
				const imgUrl = await fileUpload(product.image)
				product.image = imgUrl
			} 
			
			await updateDoc(docRef, product)
			// dispatch(updateProduct(product))
			
		} catch (error) {
			console.log(error)
			dispatch(setStatus(errorStatus))
		}
	}
	
	const startDeleteProduct = async (product) => {
		dispatch(setStatus(savingStatus))
		
		try {
			const docRef = doc(FirestoreDB, `products/${product.id}`)
			await deleteDoc(docRef)
			// dispatch(deleteProduct(product.id))
		} catch (error) {
			console.log(error)
			dispatch(setStatus(errorStatus))
		}
	}

	
	return {
		// Propiedades
		products,
		status,
		errorMessage,
		
		// Metodos
		startAddProduct,
		startEditProduct,
		startDeleteProduct
	}
}
