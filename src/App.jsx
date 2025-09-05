import { Provider } from 'react-redux'
import { store } from './components/store/store'
import { AppRouter } from './components/router/AppRouter'
import { BrowserRouter } from 'react-router'
import { Toaster } from 'react-hot-toast'

function App() {
	
	return (
		<>
			<Toaster
				position="top-right"
				reverseOrder={false}
			/>
			<Provider store={store}>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</Provider>
		</>
	)
}

export default App
