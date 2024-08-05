import { useEffect, useState } from 'react'
import db from '@/appwrite/databases'
import { Models } from 'appwrite'
import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '@/customFunctions/formatPrice'
import useSellifyStore from '@/store/user'


const Smartphones = () => {

    const { query } = useParams();
    const [allTheProducts, setAllTheProducts] = useState<Models.Document[]>([]);
    const userSession = useSellifyStore((state) => state.userSession)

    useEffect(() => {
        getAllProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllProducts = async () => {
        const products = await db.products.list();

        let theProdcutsToShow: Models.Document[] = [];

        if (query === 'todos') {
            theProdcutsToShow = products.documents;
        } else if (query === 'android') {
            products.documents?.map((product: Models.Document) => {
                if (product.operating_system === 'ANDROID') {
                    theProdcutsToShow.push(product)
                }
            })
        } else if (query === 'ios') {
            products.documents?.map((product: Models.Document) => {
                if (product.operating_system === 'IOS') {
                    theProdcutsToShow.push(product)
                }
            })
        } else {
            const categories = await db.categories.list();

            const found = categories.documents[0].sub_categories?.filter((subc: string) => subc.toLowerCase() === query);

            if (found?.length > 0) {
                products.documents?.map((product: Models.Document) => {
                    if (product.sub_category === found[0]) {
                        theProdcutsToShow.push(product)
                    }
                })
            }
        }

        setAllTheProducts(theProdcutsToShow)


    }
    return (
        <>

            <div aria-labelledby="category-heading" className="relative min-h-screen pt-16 xl:mx-auto xl:max-w-7xl xl:px-8">
                <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
                    <h2 id="category-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                        Nuestros Smartphones
                    </h2>

                    {/* <Link to={userSession ? "/tienda/celulares" : "/celulares"} className="hidden text-base font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
                                Ver todos los productos
                                <span aria-hidden="true"> &rarr;</span>
                            </Link> */}
                </div>

                <div className="">
                    <div className="mx-auto w-full px-4 py-8">
                        <h2 className="sr-only">Productos</h2>

                        {allTheProducts?.length === 0 ?
                            (
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        No tienes productos relacionados con <span className='text-red-700'>{query}</span>.
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Agrega un producto y empieza a vender.
                                    </p>
                                </div>
                            )
                            :
                            (
                                <div className="grid justify-items-center grid-cols-1 gap-y-8 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {allTheProducts?.map((product: Models.Document) => (
                                        <Link key={product.$id} to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                            className="flex flex-col items-center justify-center bg-gray-100 hover:bg-indigo-200 
                                    rounded-xl text-gray-800 border border-dashed p-3"
                                        >
                                            <div className="h-96 w-[320px] lg:h-80 lg:w-80 xl:w-64 overflow-hidden rounded-lg bg-gray-200">
                                                <img
                                                    alt={product.name}
                                                    src={product.image}
                                                    className="h-full w-full object-cover object-center hover:opacity-70"
                                                />
                                            </div>
                                            <h3 className="mt-4 text-lg font-bold">{product.name}</h3>
                                            <h3 className="text-sm text-gray-700">4 comentarios</h3>
                                            <p className="mt-3 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}

                    </div>
                </div>

                {/* <div className="mt-6 px-4 sm:hidden">
                    <Link to="#" className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                        Ver todos los productos
                        <span aria-hidden="true"> &rarr;</span>
                    </Link>
                </div> */}
            </div>
        </>
    )
}

export default Smartphones