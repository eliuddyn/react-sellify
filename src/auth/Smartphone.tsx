/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import db from '@/appwrite/databases';
import useSellifyStore from '@/store/user';
import { Models, Query } from 'appwrite';
import { es } from 'date-fns/locale';
import { format } from "date-fns"
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Star, X } from "lucide-react"
import { Button } from '@/components/ui/button';
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from '@/customFunctions/formatPrice';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const reviewFormSchema = z.object({
    theReview: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    reviewRating: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
})

const Smartphone = () => {

    const navigate = useNavigate()
    const { id } = useParams();
    const [theProduct, setTheProduct] = useState<Models.Document>();
    const [allTheReviews, setAllTheReviews] = useState<Models.Document[]>([]);
    const [theReviewsData, setTheReviewsData] = useState<any>();
    const userSession = useSellifyStore((state) => state.userSession)
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const [customerNotLoggedIn, setCustomerNotLoggedIn] = useState<boolean>(false);
    const [isTheProductInCart, setIsTheProductInCart] = useState<boolean>(false);
    const [isTheProductPurchased, setIsTheProductPurchased] = useState<boolean>(false);
    const [isTheProductReviewed, setIsTheProductReviewed] = useState<boolean>(false);
    const [isUpdateActive, setIsUpdateActive] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<Models.Document | null>(null);
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);

    const formToAddReview = useForm<z.infer<typeof reviewFormSchema>>({
        resolver: zodResolver(reviewFormSchema),
        mode: "onSubmit",
        defaultValues: {
            theReview: '',
            reviewRating: ''
        },
    });

    useEffect(() => {
        checkIfProductIsAlreadyInCart(id)
        verifyIfCustomerHasPurchasedThisProduct()
        getAllTheReviews()
        getProduct()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const checkIfProductIsAlreadyInCart = async (productID: string | undefined) => {
        customerCartItemsInSession?.forEach((item: Models.Document) => {

            if (productID === item.product[0]?.$id) {
                setIsTheProductInCart(true)
            }
        });
    }

    const getProduct = async () => {
        const product = await db.products.get((id as string));
        setTheProduct(product)
    }

    const verifyIfCustomerHasPurchasedThisProduct = async () => {
        const cartItems = await db.cartItems.list([
            Query.equal('customer', customerInSession?.id as string),
            Query.equal("purchased", "YES"),
        ]);

        cartItems?.documents?.forEach((ci: Models.Document) => {

            ci?.product?.forEach((ciP: Models.Document) => {
                if (ciP?.$id === id as string) {
                    setIsTheProductPurchased(true)
                }
            })

        });
    }

    const getAllTheReviews = async () => {

        const reviews = await db.reviews.list([Query.equal("product", id as string)]);

        let myPersonalReview: any = [];
        let countForRating1: number = 0
        let countForRating2: number = 0
        let countForRating3: number = 0
        let countForRating4: number = 0
        let countForRating5: number = 0

        reviews.documents.forEach((review: Models.Document) => {

            if (review?.customer?.$id === customerInSession?.id as string) {
                myPersonalReview.push(review)
                setIsTheProductReviewed(true)
            }

            if (review.rating === 1) { countForRating1 += 1 }
            if (review.rating === 2) { countForRating2 += 1 }
            if (review.rating === 3) { countForRating3 += 1 }
            if (review.rating === 4) { countForRating4 += 1 }
            if (review.rating === 5) { countForRating5 += 1 }
        });

        const counts = [
            { rating: 5, count: countForRating5 },
            { rating: 4, count: countForRating4 },
            { rating: 3, count: countForRating3 },
            { rating: 2, count: countForRating2 },
            { rating: 1, count: countForRating1 },
        ]

        // Calculate total score by multiplying each rating by its count and summing the results
        let totalAmount = 0;
        let totalCount = 0;

        counts.forEach(item => {
            totalAmount += item.rating * item.count;
            totalCount += item.count;
        });

        // Calculate the average rating
        const averageRating = totalAmount / totalCount;

        const reviewsData = {
            average: averageRating.toFixed(2),
            totalCount,
            counts
        }

        setTheReviewsData(reviewsData)
        setSelectedReview(myPersonalReview[0])
        setAllTheReviews(reviews.documents)
    }

    const addProductToCart = async (product: Models.Document | undefined) => {

        if (!userSession) {

            // Alert to go and sign in
            setCustomerNotLoggedIn(true)

        } else {

            if (theProduct?.status === 'DISPONIBLE' && theProduct?.quantity > 0) {
                const myCartItem = {
                    customer: customerInSession?.id,
                    product: [product?.$id],
                    quantity: 1,
                    purchased: 'NO'
                }

                try {
                    const response = await db.cartItems.create(myCartItem);
                    setCustomerCartItemsInSession(response, 'add a product')

                    toast(`${theProduct?.name}`, {
                        description: 'Se ha agregado a su carrito.'
                    })

                    window.location.reload()

                } catch (error) {
                    console.log(error)
                }
            }
        }

    }

    async function createReview(values: z.infer<typeof reviewFormSchema>) {

        const myReview = {
            customer: customerInSession?.id,
            product: theProduct?.$id,
            theReview: values.theReview,
            rating: Number(values.reviewRating),
            reviewDate: new Date(),
        }

        try {
            await db.reviews.create(myReview);
            clearReviewForm()
            window.location.reload()

        } catch (error) {
            console.log(error)
        }
    }

    const reviewInfoToFill = (reviewToUpdate: Models.Document) => {

        formToAddReview?.setValue('reviewRating', reviewToUpdate?.rating.toString());
        formToAddReview?.setValue('theReview', reviewToUpdate?.theReview);

        setIsUpdateActive(true)
        setIsSheetOpened(true)
    }

    async function updateReview(values: z.infer<typeof reviewFormSchema>) {

        const myReview = {
            theReview: values.theReview,
            rating: Number(values.reviewRating),
        }

        try {
            await db.reviews.update(selectedReview?.$id, myReview);
            clearReviewForm()
            window.location.reload()

        } catch (error) {
            console.log(error)
        }
    }

    const clearReviewForm = () => {
        setIsSheetOpened(false)
        setIsUpdateActive(false)
        //setSelectedReview(null)
        formToAddReview?.reset();
    };

    return (
        <>
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
                                <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-gray-800">{theProduct?.name}</h1>
                            </div>

                            <section aria-labelledby="information-heading" className="mt-4">
                                <h2 id="information-heading" className="sr-only">
                                    Product information
                                </h2>

                                <div className="my-3">
                                    {theProduct?.sku &&
                                        <span
                                            className="text-sm text-gray-600 font-bold">
                                            SKU: <span className='text-indigo-700'>{theProduct?.sku}</span>
                                        </span>
                                    }

                                </div>

                                <div className="flex items-center">
                                    <p className="text-lg text-indigo-700 font-bold sm:text-xl">RD$ {formatPrice(theProduct?.price)}</p>

                                    <div className="ml-4 border-l border-gray-300 pl-4">
                                        <h2 className="sr-only">Reviews</h2>
                                        <div className="flex items-center">
                                            <div>
                                                <div className="flex items-center">
                                                    {[1, 2, 3, 4, 5].map((rating) => (
                                                        <Star
                                                            key={rating}
                                                            aria-hidden="true"
                                                            className={cn(
                                                                theReviewsData?.average >= rating ? 'text-yellow-400' : 'text-gray-300',
                                                                'h-5 w-5 flex-shrink-0',
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="sr-only">{theReviewsData?.average} out of 5 stars</p>
                                            </div>
                                            <p className="ml-2 text-sm text-gray-900">{allTheReviews?.length} {allTheReviews?.length > 1 ? 'reseñas' : 'reseña'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-6">
                                    <p className="text-base text-gray-700">{theProduct?.description}</p>
                                </div>

                                <div className="mt-6 flex items-center">
                                    {theProduct?.status === 'DISPONIBLE' && theProduct?.quantity > 0 ? (
                                        <>
                                            <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-500" />
                                            <p className="ml-2 text-sm text-green-600 font-bold">{theProduct?.status}</p>
                                        </>
                                    ) : (
                                        <>
                                            <X aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-pink-800" />
                                            <p className="ml-2 text-sm text-pink-800 font-bold">{theProduct?.status}</p>
                                        </>
                                    )}

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
                                            onClick={() => navigate('/carrito')}
                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-500 px-8 py-3 text-lg font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
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
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <Star
                                                    key={rating}
                                                    aria-hidden="true"
                                                    className={cn(
                                                        theReviewsData?.average >= rating ? 'text-yellow-400' : 'text-gray-300',
                                                        'h-5 w-5 flex-shrink-0',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className="sr-only">{theReviewsData?.average} out of 5 stars</p>
                                    </div>
                                    <p className="ml-2 text-sm text-gray-900">Basado en {allTheReviews?.length} {allTheReviews?.length > 1 ? 'reseñas' : 'reseña'}</p>
                                </div>

                                <div className="mt-6">
                                    <h3 className="sr-only">Review data</h3>

                                    <dl className="space-y-3">
                                        {theReviewsData?.counts.map((count: any) => (
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
                                                                    style={{ width: `calc(${count.count} / ${theReviewsData?.totalCount} * 100%)` }}
                                                                    className="absolute inset-y-0 rounded-full border border-yellow-400 bg-yellow-400"
                                                                />
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </dt>
                                                <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
                                                    {isNaN(Math.round((count.count / theReviewsData?.totalCount) * 100)) ? 0 : Math.round((count.count / theReviewsData?.totalCount) * 100)}%
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </div>

                                <div className="mt-10">

                                    {isTheProductPurchased && !isTheProductReviewed ?
                                        (
                                            <>
                                                <h3 className="text-lg font-bold text-indigo-700">Comparte tu opinión</h3>
                                                <p className="mt-1 text-sm text-gray-900">
                                                    Si has utilizado este producto, comparte tu opinión con otros clientes.
                                                </p>
                                            </>
                                        )
                                        :
                                        null
                                    }


                                    {/* REVIEW FORM */}
                                    <Sheet open={isSheetOpened} onOpenChange={setIsSheetOpened}>
                                        <SheetTrigger asChild>
                                            {isTheProductPurchased && !isTheProductReviewed ?
                                                (
                                                    <Button
                                                        variant="outline"
                                                        className='mt-4 bg-amber-400 text-black hover:bg-indigo-600 hover:text-gray-100 text-base'>
                                                        Escribe tu reseña
                                                    </Button>
                                                )
                                                :
                                                null
                                            }
                                        </SheetTrigger>
                                        <SheetContent
                                            onInteractOutside={event => event.preventDefault()}
                                            onOpenAutoFocus={(e) => e.preventDefault()}
                                            className='bg-slate-200 dark:bg-gray-800 overflow-y-auto'>
                                            <SheetHeader className='pt-4 pl-3 pb-3 bg-indigo-800 flex items-center justify-center'>
                                                <SheetTitle className='text-gray-200 text-2xl'>
                                                    <span className='text-amber-400 text-lg text-center'>{theProduct?.name}</span>
                                                </SheetTitle>
                                                <SheetDescription className='text-gray-200 text-base'>
                                                    {isUpdateActive ? 'Actualiza tu reseña' : 'Escribe tu reseña'}
                                                </SheetDescription>
                                            </SheetHeader>
                                            <Form {...formToAddReview}>
                                                <form className='p-4' onSubmit={formToAddReview?.handleSubmit(isUpdateActive ? updateReview : createReview)}>

                                                    <div className="grid gap-6 pt-10">

                                                        {/* REVIEW RATING */}
                                                        <FormField
                                                            control={formToAddReview?.control}
                                                            name="reviewRating"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-base text-gray-900 font-bold'>Puntuación</FormLabel>
                                                                    <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                                <SelectValue placeholder='Selecciona una puntuación' />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                            {[5, 4, 3, 2, 1].map((rating: number) => (
                                                                                <SelectItem key={rating} value={`${rating}`}>
                                                                                    <div className='flex items-center justify-center gap-x-1'>
                                                                                        {rating}
                                                                                        <Star
                                                                                            aria-hidden="true"
                                                                                            className='h-5 w-5 flex-shrink-0 text-yellow-400'
                                                                                        />
                                                                                    </div>

                                                                                </SelectItem>

                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className='dark:text-red-400' />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* THE REVIEW */}
                                                        <FormField
                                                            control={formToAddReview?.control}
                                                            name="theReview"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className='text-base text-gray-900 font-bold'>Tu reseña</FormLabel>
                                                                    <FormControl>
                                                                        <Textarea
                                                                            autoComplete='off'
                                                                            className="resize-none min-h-32"
                                                                            {...field}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className='text-red-800' />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <div className='pt-8 grid grid-flow-col justify-stretch gap-4'>
                                                        <SheetClose asChild>
                                                            <Button type="button" className='bg-rose-500 hover:bg-rose-600 text-gray-100 dark:text-gray-100' onClick={clearReviewForm}>Cancelar</Button>
                                                        </SheetClose>
                                                        <Button
                                                            className='bg-indigo-600 hover:bg-indigo-700'
                                                            type="submit">
                                                            {isUpdateActive ? 'Actualizar' : 'Agregar'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            </Form>
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>

                            <div className="mt-16 mb-14 lg:col-span-7 lg:col-start-6 lg:mt-0 lg:mb-4">
                                <h3 className="sr-only">Recent reviews</h3>

                                <div className="flow-root">
                                    <div className="-my-12 divide-y divide-gray-200">
                                        {allTheReviews.map((review: Models.Document) => (
                                            <div key={review.$id} className="py-3 px-4 bg-slate-50 border border-gray-200 rounded-xl">
                                                <div className="flex items-center">

                                                    <div className='flex items-center'>
                                                        <Avatar>
                                                            <AvatarImage src={undefined} alt="Foto" />
                                                            <AvatarFallback className={cn(
                                                                review?.customer?.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600',
                                                                'text-gray-100'
                                                            )}>
                                                                <span className='grid grid-cols-1 justify-items-center'>
                                                                    {/* NAMES */}
                                                                    <span className="text-sm">
                                                                        {review?.customer?.names && review?.customer?.names?.split(" ")?.map((name: string) =>
                                                                            <span key={name}>{name[0][0]}</span>
                                                                        )}
                                                                    </span>

                                                                    {/* LASTNAMES */}
                                                                    <span className="text-sm">
                                                                        {review?.customer?.lastnames && review?.customer?.lastnames?.split(" ")?.map((lastname: string) =>
                                                                            <span key={lastname}>{lastname[0][0]}</span>
                                                                        )}
                                                                    </span>
                                                                </span>
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>

                                                    <div className="ml-4 flex-1">

                                                        <h4 className="text-sm font-bold text-gray-900">{review?.customer?.names} {review?.customer?.lastnames}</h4>

                                                        <div className="mt-1 flex items-center">
                                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                                <Star
                                                                    key={rating}
                                                                    aria-hidden="true"
                                                                    className={cn(
                                                                        review.rating >= rating ? 'text-yellow-400' : 'text-gray-300',
                                                                        'h-5 w-5 flex-shrink-0',
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="sr-only">{review.rating} de 5 estrellas</p>
                                                        <p className="text-sm pt-2">{format(review.$updatedAt, 'PP - hh:mm aaaa', { locale: es })}</p>
                                                    </div>

                                                    {/* BUTTON TO TRIGGER THE SHEET MENU */}
                                                    <div className='hidden sm:block'>
                                                        {/* {isTheProductPurchased && !isTheProductReviewed ?
                                                            (<Button
                                                                size='sm'
                                                                variant="outline"
                                                                className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white text-sm'
                                                                onClick={() => reviewInfoToFill(selectedReview as Models.Document)}
                                                            >
                                                                Edita tu reseña
                                                            </Button>)
                                                            :
                                                            null
                                                        } */}

                                                        {isTheProductReviewed &&
                                                            <Button
                                                                size='sm'
                                                                variant="outline"
                                                                className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white text-sm'
                                                                onClick={() => reviewInfoToFill(selectedReview as Models.Document)}
                                                            >
                                                                Edita tu reseña
                                                            </Button>
                                                        }
                                                    </div>
                                                </div>

                                                <div
                                                    dangerouslySetInnerHTML={{ __html: review.theReview }}
                                                    className="mt-4 space-y-6 text-base italic text-gray-700"
                                                />

                                                {/* BUTTON TO TRIGGER THE SHEET MENU */}
                                                <div className='sm:hidden flex items-center justify-end'>
                                                    {isTheProductReviewed &&
                                                        <Button
                                                            size='sm'
                                                            variant="outline"
                                                            className='mt-4 bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white text-sm'
                                                            onClick={() => reviewInfoToFill(selectedReview as Models.Document)}
                                                        >
                                                            Edita tu reseña
                                                        </Button>
                                                    }
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LOGIN TO ADD PRODUCTS TO CART ALERT DIALOG */}
            <AlertDialog open={customerNotLoggedIn} onOpenChange={setCustomerNotLoggedIn}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-red-700 text-xl sm:text-2xl'>No ha iniciado sesión!</AlertDialogTitle>
                        <AlertDialogDescription className='text-base font-medium text-gray-900'>
                            Acceda a la plataforma para agregar productos al carrito.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>

                        <AlertDialogCancel className='bg-[#143a63] hover:bg-black text-gray-100 hover:text-gray-100'>
                            Entendido
                        </AlertDialogCancel>

                        <AlertDialogAction className='bg-indigo-600 hover:bg-indigo-700' onClick={() => navigate('/login')}>Acceder</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default Smartphone