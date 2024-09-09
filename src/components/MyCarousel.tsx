import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Models } from "appwrite"
import useSellifyStore from "@/store/user"
import { Link } from "react-router-dom"
import { formatPrice } from "@/customFunctions/formatPrice"
import { Button } from "./ui/button"

type Props = {
    products: Models.Document[] | null
}

const MyCarousel = ({ products }: Props) => {

    const userSession = useSellifyStore((state) => state.userSession)

    return (
        <div className="bg-gray-200 flex items-center justify-center py-4">
            <Carousel
                className="w-full sm:w-2/5"
                plugins={[
                    Autoplay({
                        delay: 2500,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                        stopOnFocusIn: false,
                    })
                ]}
            >
                <CarouselContent className="p-2 flex">
                    {products && products.map((product: Models.Document) => (
                        <CarouselItem key={product?.$id} className="flex md:basis-full">
                            <Link to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                className="pb-6 p-4 flex flex-col items-center justify-center bg-gradient-to-br from-pink-400 to-amber-400 rounded-xl text-gray-800 text-center"
                            >
                                <div className="w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        alt={product.name}
                                        src={product.image}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <h3 className="mt-4 text-sm text-blue-600 font-medium">{product?.category?.name}</h3>
                                <h3 className="mt-1 text-base font-bold">{product.name}</h3>
                                <h3 className="mb-3 text-sm text-gray-700">{product?.reviews?.length} {product?.reviews?.length > 1 ? 'reseñas' : 'reseña'}</h3>
                                {/* <span className="mt-3 mb-2 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</span> */}
                                <Button
                                    className="brightness-150 dark:brightness-100 group hover:shadow-lg hover:shadow-rose-600/90 transition ease-in-out hover:scale-105 p-1 rounded-xl bg-gradient-to-br from-blue-800 via-rose-600 to-indigo-800 hover:from-blue-700 hover:via-red-800 hover:to-indigo-600"
                                >
                                    <div
                                        className="px-6 py-2 backdrop-blur-xl bg-black/80 rounded-xl font-bold w-full h-full"
                                    >
                                        <div
                                            className="group-hover:scale-100 flex group-hover:text-yellow-500 text-gray-100 gap-1"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.8"
                                                className="w-6 h-6 stroke-amber-600 group-hover:stroke-indigo-500 group-hover:stroke-{1.99}"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                                                ></path>
                                            </svg>
                                            <span className="pl-2">
                                                RD$ {formatPrice(product?.price)}
                                            </span>
                                        </div>
                                    </div>
                                </Button>
                                <h3 className="mt-1 text-base text-rose-600 font-bold">OFERTA</h3>
                            </Link>

                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex items-center justify-center" />
                <CarouselNext className="hidden md:flex items-center justify-center" />
            </Carousel>
        </div>
    )
}

export default MyCarousel