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

type Props = {
    products: Models.Document[] | null
}

const MyCarousel = ({ products }: Props) => {

    const userSession = useSellifyStore((state) => state.userSession)

    return (
        <div className="bg-gray-200 flex items-center justify-center">
            <Carousel
                className="w-full sm:w-2/5"
                plugins={[
                    Autoplay({
                        delay: 2000,
                        stopOnInteraction: false,
                        stopOnMouseEnter: true,
                        stopOnFocusIn: false,
                    })
                ]}
            >
                <CarouselContent>
                    {products && products.map((product: Models.Document) => (
                        <CarouselItem key={product?.$id} className="flex py-4 md:basis-full">
                            <Link to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                className="flex flex-col items-center justify-center bg-gray-100 rounded-xl text-gray-800 text-center"
                            >
                                <div className="w-full overflow-hidden rounded-lg bg-gray-200">
                                    <img
                                        alt={product.name}
                                        src={product.image}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>
                                <h3 className="mt-4 text-sm text-blue-600 font-medium">{product?.category?.name}</h3>
                                <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                                <h3 className="text-sm text-gray-700">{product?.reviews?.length} {product?.reviews?.length > 1 ? 'reseñas' : 'reseña'}</h3>
                                <p className="mt-3 mb-2 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</p>
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