/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { useEffect, useState } from 'react'
import db from '@/appwrite/databases'
import { Models } from 'appwrite'
import { Link, useParams } from 'react-router-dom'
import { formatPrice } from '@/customFunctions/formatPrice'
import useSellifyStore from '@/store/user'
import { Input } from '@/components/ui/input'
// import { Star } from 'lucide-react'
// import { cn } from '@/lib/utils'


const Smartphones = () => {

    const { query } = useParams();
    //const [allTheReviews, setAllTheReviews] = useState<Models.Document[]>();
    //const [allTheReviewsForTheProducts, setAllTheReviewsForTheProducts] = useState<any[] | null>(null);
    const [allTheProducts, setAllTheProducts] = useState<Models.Document[] | null>(null);
    const [searchedData, setSearchedData] = useState<string>('')
    const userSession = useSellifyStore((state) => state.userSession)

    useEffect(() => {
        // getAllTheReviews()
        getAllProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const searchSmartphonesResults = (value: string) => {
        setSearchedData(value);
    };

    // const getAllTheReviews = async () => {
    //     const reviews = await db.reviews.list();
    //     setAllTheReviews(reviews?.documents)
    // }

    const getAllProducts = async () => {
        const products = await db.products.list();

        let theProductsToShow: Models.Document[] = [];

        if (query === 'todos') {
            theProductsToShow = products.documents;
        } else if (query === 'android') {
            products.documents?.map((product: Models.Document) => {
                if (product.operating_system === 'ANDROID') {
                    theProductsToShow.push(product)
                }
            })
        } else if (query === 'ios') {
            products.documents?.map((product: Models.Document) => {
                if (product.operating_system === 'IOS') {
                    theProductsToShow.push(product)
                }
            })
        } else {
            const categories = await db.categories.list();

            const found = categories.documents[0].sub_categories?.filter((subc: string) => subc.toLowerCase() === query);

            if (found?.length > 0) {
                products.documents?.map((product: Models.Document) => {
                    if (product.sub_category === found[0]) {
                        theProductsToShow.push(product)
                    }
                })
            }
        }

        //let reviewsForProducts: any[] = []

        // theProductsToShow?.forEach(async (product: Models.Document) => {

        //     let countForRating1: number = 0
        //     let countForRating2: number = 0
        //     let countForRating3: number = 0
        //     let countForRating4: number = 0
        //     let countForRating5: number = 0

        //     const theReviews = await allTheReviews?.filter((review: Models.Document) => review?.product?.$id === product?.$id)

        //     if (theReviews && theReviews?.length > 0) {

        //         theReviews?.forEach((rv: Models.Document) => {

        //             if (rv?.rating === 1) { countForRating1 += 1 }
        //             if (rv?.rating === 2) { countForRating2 += 1 }
        //             if (rv?.rating === 3) { countForRating3 += 1 }
        //             if (rv?.rating === 4) { countForRating4 += 1 }
        //             if (rv?.rating === 5) { countForRating5 += 1 }
        //         })

        //         const counts = [
        //             { rating: 5, count: countForRating5 },
        //             { rating: 4, count: countForRating4 },
        //             { rating: 3, count: countForRating3 },
        //             { rating: 2, count: countForRating2 },
        //             { rating: 1, count: countForRating1 },
        //         ]

        //         // Calculate total score by multiplying each rating by its count and summing the results
        //         let totalAmount = 0;
        //         let totalCount = 0;

        //         counts.forEach(item => {
        //             totalAmount += item.rating * item.count;
        //             totalCount += item.count;
        //         });

        //         // Calculate the average rating
        //         const averageRating = totalAmount / totalCount;

        //         const reviewsData = {
        //             productID: product?.$id,
        //             average: Number(averageRating.toFixed(2)),
        //             totalCount
        //         }

        //         console.log(reviewsData)

        //         reviewsForProducts.push(reviewsData)
        //     }

        // });

        //setAllTheReviewsForTheProducts(reviewsForProducts)
        setAllTheProducts(theProductsToShow)
    }

    if (!allTheProducts) {
        return (
            <div className='flex space-x-2 justify-center items-center h-screen'>
                <span className='sr-only'>Loading...</span>
                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce'></div>
            </div>
        );
    }

    return (
        <>

            <div aria-labelledby="category-heading" className="relative min-h-screen pt-16 xl:mx-auto xl:max-w-7xl xl:px-8">
                <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
                    <h2 id="category-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                        Nuestros Smartphones
                    </h2>

                    <div className="mt-10 sm:mt-0 flex items-center justify-center rounded-xl">
                        <form className="w-full max-w-xs my-3">
                            <div>
                                <label htmlFor="search" className="sr-only">Search</label>
                                <Input
                                    type="text"
                                    name="search"
                                    id="search"
                                    autoComplete='off'
                                    value={searchedData}
                                    className="block w-full h-10 rounded-lg p-4 text-gray-900 text-lg leading-6 shadow-sm ring-2 ring-inset ring-rose-700 dark:ring-transparent placeholder:text-gray-400 focus:ring-rose-600"
                                    placeholder="Buscar..."
                                    onChange={(e) => searchSmartphonesResults(e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
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
                                <div className="grid justify-items-center gap-y-8 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {allTheProducts?.filter((product: Models.Document) => {
                                        if (searchedData === '' || searchedData.length < 2) {
                                            return product;
                                        }

                                        if (
                                            product?.name?.toLowerCase().indexOf(searchedData.toLocaleLowerCase()) > -1
                                        ) {
                                            return product;
                                        }
                                    })?.map((product: Models.Document) => (
                                        <Link key={product.$id} to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                            className="flex flex-col items-center justify-center bg-gray-100 hover:bg-pink-100 
                                    rounded-xl text-gray-800 border border-dashed p-3"
                                        >
                                            <div className="h-96 w-[320px] lg:h-80 lg:w-80 xl:w-64 overflow-hidden rounded-lg bg-gray-200">
                                                <img
                                                    alt={product.name}
                                                    src={product.image}
                                                    className="h-full w-full object-cover object-center hover:opacity-70"
                                                />
                                            </div>
                                            <h3 className="mt-4 text-base font-bold">{product.name}</h3>

                                            {/* <div className="flex items-center">
                                                <div>
                                                    <div className="flex items-center">
                                                        {[1, 2, 3, 4, 5].map((rating: number) => (
                                                            <div key={rating}>
                                                                {allTheReviewsForTheProducts && allTheReviewsForTheProducts?.map((rfp: any) => (
                                                                    <div key={rfp?.productID}>
                                                                        {rfp?.productID === product.$id ? (
                                                                            <Star
                                                                                aria-hidden="true"
                                                                                className={cn(
                                                                                    rfp?.average >= rating ? 'text-yellow-400' : 'text-gray-500',
                                                                                    'h-5 w-5 flex-shrink-0',
                                                                                )}
                                                                            />
                                                                        ) :
                                                                            <Star
                                                                                aria-hidden="true"
                                                                                className='h-5 w-5 flex-shrink-0 text-gray-500'
                                                                            />
                                                                        }
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="ml-2 text-sm text-gray-900">{product?.reviews?.length} {product?.reviews?.length > 1 ? 'reseñas' : 'reseña'}</p>
                                            </div> */}

                                            <h3 className="text-sm text-gray-700">{product?.reviews?.length} {product?.reviews?.length > 1 ? 'reseñas' : 'reseña'}</h3>

                                            <p className="mt-3 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</p>
                                        </Link>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>

                {/* <div className="mt-6 px-4 sm:hidden">
                    <Link to="#" className="block text-sm font-semibold text-rose-600 hover:text-rose-500">
                        Ver todos los productos
                        <span aria-hidden="true"> &rarr;</span>
                    </Link>
                </div> */}
            </div>
        </>
    )
}

export default Smartphones