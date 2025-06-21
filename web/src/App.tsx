import { useRoutes, } from 'react-router-dom'
import { route } from './router'

const App = () => {
    const elements = useRoutes(route)
    return (
        <>
            {elements}
        </>
    )
}
export default App