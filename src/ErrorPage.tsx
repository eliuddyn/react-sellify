import { Link } from "react-router-dom"

const ErrorPage = () => {

    return (
        <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-4xl font-semibold text-red-700">404</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Página no encontrada</h1>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link to="/"
                        className="rounded-md bg-rose-500 hover:bg-rose-700 px-3.5 py-2.5 text-xl font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Ir a Inicio
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default ErrorPage
