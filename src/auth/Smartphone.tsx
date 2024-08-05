import db from '@/appwrite/databases';
import useSellifyStore from '@/store/user';
import { Models } from 'appwrite';
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Star, X } from "lucide-react"
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { formatPrice } from '@/customFunctions/formatPrice';
import { cn } from '@/lib/utils';

const reviews = {
    average: 4,
    totalCount: 1624,
    counts: [
        { rating: 5, count: 1019 },
        { rating: 4, count: 162 },
        { rating: 3, count: 97 },
        { rating: 2, count: 199 },
        { rating: 1, count: 147 },
    ],
    featured: [
        {
            id: 1,
            rating: 5,
            content: `
          <p>This is the bag of my dreams. I took it on my last vacation and was able to fit an absurd amount of snacks for the many long and hungry flights.</p>
        `,
            author: 'Emily Selman',
            avatarSrc:
                'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
        },
        // More reviews...
    ],
}

const Smartphone = () => {

    const navigate = useNavigate()
    const { id } = useParams();
    const [theProduct, setTheProduct] = useState<Models.Document>();
    const userSession = useSellifyStore((state) => state.userSession)
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const [isTheProductInCart, setIsTheProductInCart] = useState<boolean>(false);
    //const setCustomerInSession = useSellifyStore((state) => state.setCustomerInSession)

    useEffect(() => {
        checkIfProductIsAlreadyInCart(id)
        getProduct()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const checkIfProductIsAlreadyInCart = async (productID: string | undefined) => {

        customerCartItemsInSession.forEach((item: Models.Document) => {

            if (productID === item.product?.$id) {
                setIsTheProductInCart(true)
            }
        });
    }

    const getProduct = async () => {
        const product = await db.products.get((id as string));
        setTheProduct(product)
    }

    const addProductToCart = async (product: Models.Document | undefined) => {
        //console.log(product)

        if (!userSession) {

            // Alert to go and sign in
            //console.log('Sign in first')

        } else {

            if (theProduct?.status === 'DISPONIBLE' && theProduct?.quantity > 0) {
                const myCartItem = {
                    customer: customerInSession?.id,
                    product: product?.$id,
                    quantity: 1,
                    purchased: 'NO'
                }

                try {
                    const response = await db.cartItems.create(myCartItem);
                    setCustomerCartItemsInSession(response, 'add a product')

                    toast(`${theProduct?.name}`, {
                        description: 'Se ha agregado a su carrito.'
                    })

                } catch (error) {
                    console.log(error)
                }
            }
        }

    }

    return (
        <div className='grid grid-rows-[1fr] min-h-dvh'>
            <div className="bg-white">
                <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                    {/* Product details */}
                    <div className="md:max-w-lg md:self-end">
                        {/* <nav aria-label="Breadcrumb">
                        <ol role="list" className="flex items-center space-x-2">
                            {product.breadcrumbs.map((breadcrumb, breadcrumbIdx) => (
                                <li key={breadcrumb.id}>
                                    <div className="flex items-center text-sm">
                                        <a href={breadcrumb.href} className="font-medium text-gray-500 hover:text-gray-900">
                                            {breadcrumb.name}
                                        </a>
                                        {breadcrumbIdx !== product.breadcrumbs.length - 1 ? (
                                            <svg
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                aria-hidden="true"
                                                className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                                            >
                                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                                            </svg>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav> */}

                        <div className="mt-4">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{theProduct?.name}</h1>
                        </div>

                        <section aria-labelledby="information-heading" className="mt-4">
                            <h2 id="information-heading" className="sr-only">
                                Product information
                            </h2>

                            <div className="flex items-center">
                                <p className="text-lg text-indigo-700 font-bold sm:text-xl">RD$ {formatPrice(theProduct?.price)}</p>

                                <div className="ml-4 border-l border-gray-300 pl-4">
                                    <h2 className="sr-only">Reviews</h2>
                                    <div className="flex items-center">
                                        <div>
                                            <div className="flex items-center">
                                                {[0, 1, 2, 3, 4].map((rating) => (
                                                    <Star
                                                        key={rating}
                                                        aria-hidden="true"
                                                        className={cn(
                                                            //reviews.average > rating ? 'text-yellow-400' : 'text-gray-300',
                                                            'h-5 w-5 flex-shrink-0',
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            {/* <p className="sr-only">{reviews.average} out of 5 stars</p> */}
                                        </div>
                                        <p className="ml-2 text-sm text-gray-500">{theProduct?.reviews?.length} Reseñas</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-6">
                                <p className="text-base text-gray-500">{theProduct?.description}</p>
                            </div>

                            <div className="mt-6 flex items-center">
                                {theProduct?.status === 'DISPONIBLE' ? (
                                    <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-500" />
                                ) : (
                                    <X aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-red-600" />
                                )}

                                <p className="ml-2 text-sm text-gray-500">{theProduct?.status}</p>
                            </div>
                        </section>
                    </div>

                    {/* Product image */}
                    <div className="mt-10 border border-dashed md:col-start-2 md:row-span-2 md:mt-10 md:self-center">
                        <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
                            <img alt={theProduct?.name} src={theProduct?.image} className="h-full w-full object-cover object-center" />
                        </div>
                    </div>

                    {/* Product form */}
                    <div className="mt-10 md:col-start-1 md:row-start-2 md:max-w-md md:self-start">
                        <section aria-labelledby="options-heading">

                            <div className="mt-10">

                                {isTheProductInCart ? (
                                    <Button
                                        disabled={theProduct?.status === 'NO DISPONIBLE' || theProduct?.quantity === 0}
                                        onClick={() => navigate('/carrito')}
                                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                    >
                                        Ver en el carrito
                                    </Button>
                                ) : (
                                    <Button
                                        disabled={theProduct?.status === 'NO DISPONIBLE' || theProduct?.quantity === 0}
                                        onClick={() => addProductToCart(theProduct)}
                                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-lg font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                    >
                                        Añadir al carrito
                                    </Button>
                                )}

                            </div>

                        </section>
                    </div>
                </div>

                <div className="bg-white">
                    <div className="mx-auto max-w-2xl px-4 pt-2 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-4">
                        <div className="lg:col-span-4">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reseñas de clientes</h2>

                            <div className="mt-3 flex items-center">
                                <div>
                                    <div className="flex items-center">
                                        {[0, 1, 2, 3, 4].map((rating) => (
                                            <Star
                                                key={rating}
                                                aria-hidden="true"
                                                className={cn(
                                                    reviews.average > rating ? 'text-yellow-400' : 'text-gray-300',
                                                    'h-5 w-5 flex-shrink-0',
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <p className="sr-only">{reviews.average} out of 5 stars</p>
                                </div>
                                <p className="ml-2 text-sm text-gray-900">Based on {reviews.totalCount} reviews</p>
                            </div>

                            <div className="mt-6">
                                <h3 className="sr-only">Review data</h3>

                                <dl className="space-y-3">
                                    {reviews.counts.map((count) => (
                                        <div key={count.rating} className="flex items-center text-sm">
                                            <dt className="flex flex-1 items-center">
                                                <p className="w-3 font-medium text-gray-900">
                                                    {count.rating}
                                                    <span className="sr-only"> star reviews</span>
                                                </p>
                                                <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
                                                    <Star
                                                        aria-hidden="true"
                                                        className={cn(
                                                            count.count > 0 ? 'text-yellow-400' : 'text-gray-300',
                                                            'h-5 w-5 flex-shrink-0',
                                                        )}
                                                    />

                                                    <div className="relative ml-3 flex-1">
                                                        <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
                                                        {count.count > 0 ? (
                                                            <div
                                                                style={{ width: `calc(${count.count} / ${reviews.totalCount} * 100%)` }}
                                                                className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                                                            />
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </dt>
                                            <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
                                                {Math.round((count.count / reviews.totalCount) * 100)}%
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            <div className="mt-10">
                                <h3 className="text-lg font-medium text-gray-900">Share your thoughts</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    If you’ve used this product, share your thoughts with other customers
                                </p>

                                <a
                                    href="#"
                                    className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 sm:w-auto lg:w-full"
                                >
                                    Write a review
                                </a>
                            </div>
                        </div>

                        <div className="mt-16 lg:col-span-7 lg:col-start-6 lg:mt-0">
                            <h3 className="sr-only">Recent reviews</h3>

                            <div className="flow-root">
                                <div className="-my-12 divide-y divide-gray-200">
                                    {reviews.featured.map((review) => (
                                        <div key={review.id} className="py-12">
                                            <div className="flex items-center">
                                                <img alt={`${review.author}.`} src={review.avatarSrc} className="h-12 w-12 rounded-full" />
                                                <div className="ml-4">
                                                    <h4 className="text-sm font-bold text-gray-900">{review.author}</h4>
                                                    <div className="mt-1 flex items-center">
                                                        {[0, 1, 2, 3, 4].map((rating) => (
                                                            <Star
                                                                key={rating}
                                                                aria-hidden="true"
                                                                className={cn(
                                                                    review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                                                    'h-5 w-5 flex-shrink-0',
                                                                )}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="sr-only">{review.rating} out of 5 stars</p>
                                                </div>
                                            </div>

                                            <div
                                                dangerouslySetInnerHTML={{ __html: review.content }}
                                                className="mt-4 space-y-6 text-base italic text-gray-600"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Smartphone