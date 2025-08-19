import { Provider } from 'react-redux'
import { store } from './components/store/store'
import { AppRouter } from './components/router/AppRouter'
import { BrowserRouter } from 'react-router'

function App() {
	return (
		<Provider store={store}>
			<BrowserRouter>
				<AppRouter />
			</BrowserRouter>
		</Provider>
	)
}

export default App
