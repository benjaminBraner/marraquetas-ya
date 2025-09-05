import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { useDispatch } from 'react-redux'
import { FirestoreDB } from '../../firebase/firebase-config'
import { setProducts } from '../store/slices/productSlice'
import { setStock } from '../store/slices/stockSlice'
import { setStatus } from '../store/slices/stockHistorySlice'
import { setSales, setStatus as setPosStatus } from '../store/slices/posSlice'
import { getTodayDate } from '../helpers/getTodayDate'
import { useDateChange } from './useDateChange'

const today = getTodayDate()

export const useFirebaseSync = () => {
    const dispatch = useDispatch()
    const [subscriptions, setSubscriptions] = useState(null)
    
    // 🎯 Función para crear todas las suscripciones de Firebase
    const createFirebaseSubscriptions = (today) => {
        console.log('🔄 Iniciando sincronización con Firebase para:', today)

        // ✅ Suscripción a productos (esta no depende de la fecha)
        const unsubscribeProducts = onSnapshot(
            collection(FirestoreDB, 'products'),
            (snapshot) => {
                const productos = []
                snapshot.forEach((doc) => {
                    productos.push({ id: doc.id, ...doc.data() })
                })
                console.log('📦 Productos actualizados desde Firebase:', productos.length)
                dispatch(setProducts(productos))
            },
            (error) => {
                console.error('❌ Error en sincronización de productos:', error)
            }
        )

        // ✅ Suscripción a stock del día actual
        const unsubscribeStock = onSnapshot(
            doc(FirestoreDB, `stock/${today}`),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const stockData = docSnapshot.data()
                    console.log(`🛒 Stock del ${today}:`, stockData)
                    dispatch(setStock(stockData))
                } else {
                    console.log(`🔭 No hay stock para ${today}`)
                    dispatch(setStock({}))
                }
            },
            (error) => {
                console.error('❌ Error en stock:', error)
            }
        )

        // ✅ Suscripción al historial del día actual
        const unsubscribeHistory = onSnapshot(
            doc(FirestoreDB, `history/${today}`),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const historyData = docSnapshot.data()
                    const entries = historyData.entries || []
                    
                    console.log(`📋 Historial del ${today}:`, entries.length, 'entradas')
                    
                    const sortedEntries = [...entries].sort((a, b) => 
                        new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
                    )
                    
                    dispatch({
                        type: 'stockHistory/setHistoryFromFirebase',
                        payload: sortedEntries
                    })
                    dispatch(setStatus('idle'))
                } else {
                    console.log(`🔭 No hay historial para ${today}`)
                    dispatch({
                        type: 'stockHistory/setHistoryFromFirebase',
                        payload: []
                    })
                    dispatch(setStatus('idle'))
                }
            },
            (error) => {
                console.error('❌ Error en historial:', error)
                dispatch(setStatus('error'))
            }
        )

        // ✅ Suscripción al POS del día actual
        const unsubscribePOS = onSnapshot(
            doc(FirestoreDB, `pos/${today}`),
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const posData = docSnapshot.data()
                    const sales = posData.sales || []
                    
                    console.log(`💰 POS del ${today}:`, sales.length, 'ventas')
                    
                    const sortedSales = [...sales].sort((a, b) => 
                        new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
                    )
                    
                    dispatch(setSales(sortedSales))
                    dispatch(setPosStatus('idle'))
                } else {
                    console.log(`🔭 No hay ventas POS para ${today}`)
                    dispatch(setSales([]))
                    dispatch(setPosStatus('idle'))
                }
            },
            (error) => {
                console.error('❌ Error en POS:', error)
                dispatch(setPosStatus('error'))
            }
        )

        // Retornar función para cerrar todas las suscripciones
        return () => {
            console.log('🛑 Cerrando suscripciones de Firebase para:', today)
            unsubscribeProducts()
            unsubscribeStock()
            unsubscribeHistory()
            unsubscribePOS()
        }
    }

    // 🎯 Usar el hook de cambio de fecha
    const currentDate = useDateChange((newDate) => {
        console.log('🆕 Detectado cambio de fecha, actualizando suscripciones:', newDate)
        
        // Cerrar suscripciones anteriores si existen
        if (subscriptions) {
            subscriptions()
        }
        
        // Crear nuevas suscripciones para la nueva fecha
        const newUnsubscribe = createFirebaseSubscriptions(newDate)
        setSubscriptions(() => newUnsubscribe)
    })

    // 🎯 Efecto para inicializar las suscripciones la primera vez
    useEffect(() => {
        if (!subscriptions) {
            const unsubscribe = createFirebaseSubscriptions(currentDate)
            setSubscriptions(() => unsubscribe)
        }
    }, [currentDate, subscriptions])

    // 🎯 Limpiar al desmontar el componente
    useEffect(() => {
        return () => {
            if (subscriptions) {
                console.log('🧹 Limpiando suscripciones al desmontar componente')
                subscriptions()
            }
        }
    }, [subscriptions])
}