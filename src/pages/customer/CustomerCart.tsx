/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import db from "@/appwrite/databases";
import { Models, Query } from "appwrite";
import { useForm, useFieldArray } from 'react-hook-form';
import { randomCode } from 'generate-random-code';
import { X, Check } from "lucide-react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
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
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/customFunctions/formatPrice";
import useSellifyStore from "@/store/user";
import { cn } from "@/lib/utils";

// const paymentCardFormSchema = z.object({
//     fullname: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
//     cardNumber: z.string({ required_error: "Requerido" }).length(19, { message: "19 caracteres mínimo" }),
//     expirationMonth: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
//     expirationYear: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
//     cvc: z.string({ required_error: "Requerido" }).length(3, { message: "3 caracteres mínimo" }),
// })

type FormValues = {
    cartItem: {
        cartItem: Models.Document;
        cartItemQuantity: number;
    }[];
};

const CustomerCartPage = () => {

    const navigate = useNavigate()
    const [allTheCartItems, setAllTheCartItems] = useState<Models.Document[] | null>(null);
    const [allTheUnavailableCartItems, setAllTheUnavailableCartItems] = useState<Models.Document[]>([]);
    const [subTotal, setSubTotal] = useState<number>(0)
    const [shippingTotal, setShippingTotal] = useState<number>(0)
    const [orderTotal, setOrderTotal] = useState<number>(0)
    const [selectedCartItemToDelete, setSelectedCartItemToDelete] = useState<Models.Document | null>(null);
    const [deletingProductFromCart, setDeletingProductFromCart] = useState<boolean>(false)
    const [isUpdateQuantitiesButtonVisible, setIsUpdateQuantitiesButtonVisible] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingQuantity, setLoadingQuantity] = useState<boolean>(false);
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const [defaultAddress, setDefaultAddress] = useState<Models.Document | null>(null);
    const [isDefaultAdressFound, setIsDefaultAdressFound] = useState<boolean>(false)

    // const formToPayTheProduct = useForm<z.infer<typeof paymentCardFormSchema>>({
    //     resolver: zodResolver(paymentCardFormSchema),
    //     mode: "onSubmit",
    //     defaultValues: {
    //         fullname: '',
    //         cardNumber: '',
    //         expirationMonth: '',
    //         expirationYear: '',
    //         cvc: '',
    //     },
    // });

    const form = useForm<FormValues>({
        defaultValues: {
            cartItem: [
                {
                    cartItem: undefined,
                    cartItemQuantity: 1,
                }
            ],
        },
        mode: "onBlur"
    });

    const { control } = form;

    useFieldArray({
        name: "cartItem",
        control
    });

    useEffect(() => {
        getDefaultAddress()
        getAllCartItems()
    }, [])

    const getAllCartItems = async () => {
        const cartItems = await db.cartItems.list([
            Query.equal('customer', customerInSession?.id as string),
            Query.equal("purchased", "NO")
        ]);

        let theCartItems: Models.Document | any = [];
        let unvailableCartItems: Models.Document | any = [];
        let mySubTotal: number = 0
        let myShippingTotal: number = 0

        cartItems?.documents?.forEach((ci: Models.Document, idx: number) => {

            if (ci?.product[0]?.status === 'DISPONIBLE' && ci?.product[0]?.quantity >= ci?.quantity) {

                myShippingTotal = 350

                mySubTotal += ci?.product[0]?.price * ci?.quantity;

                form.register(`cartItem.${idx}.cartItem` as const)
                form.setValue(`cartItem.${idx}.cartItem`, ci)

                form.register(`cartItem.${idx}.cartItemQuantity` as const)
                form.setValue(`cartItem.${idx}.cartItemQuantity` as const, ci?.quantity)

                theCartItems.push(ci)

            } else {

                unvailableCartItems.push(ci)
            }
        });

        setAllTheUnavailableCartItems(unvailableCartItems)

        setSubTotal(mySubTotal)
        setShippingTotal(myShippingTotal)
        setOrderTotal(myShippingTotal + mySubTotal)
        setCustomerCartItemsInSession(theCartItems, 'login')
        setAllTheCartItems(theCartItems)
    }

    const getDefaultAddress = async () => {
        const addresses = await db.addresses.list([
            Query.equal('customerID', customerInSession?.id as string),
            Query.equal('isDefault', true)
        ]);

        if (addresses.documents[0]?.isDefault === true) {
            setDefaultAddress(addresses.documents[0])
        } else {
            setIsDefaultAdressFound(true)
        }
    }

    async function changeCartItemQuantity() {

        setLoadingQuantity(true)

        await form.getValues().cartItem?.forEach(async (ci: any) => {

            if (ci?.cartItem?.quantity !== ci?.cartItemQuantity) {
                if (ci?.cartItemQuantity <= ci?.cartItem?.product[0]?.quantity && ci?.cartItem?.product[0]?.status === 'DISPONIBLE') {

                    try {
                        await db.cartItems.update(ci?.cartItem?.$id, { quantity: ci?.cartItemQuantity })

                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        });

        setTimeout(() => {
            window.location.reload()
        }, 2500);
    }

    async function deleteProductFromCart(productID: string | undefined) {

        let remainingCartItems: Models.Document | any = [];

        customerCartItemsInSession?.forEach((ci: Models.Document) => {
            if (productID !== ci?.$id) {
                remainingCartItems.push(ci)
            }
        });

        try {
            await db.cartItems.delete(productID)
            setCustomerCartItemsInSession(remainingCartItems, 'login')
            window.location.reload()
        } catch (error) {
            console.log(error)
        }
    }

    async function payTheProducts() {

        setLoading(true)

        let cartItemsIDs: any[] = [];
        let cartItemsIDs2: any;
        let quantityByProduct: any[] = [];
        let changesInDbAfterPurchase: any[] = [];
        let stripeData: any[] = [];
        let CartItemsIDsForStripe: string = ''
        const theURL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_PRODUCTION_URL as string : import.meta.env.VITE_DEVELOPMENT_URL as string

        form.getValues().cartItem?.forEach(async (ci: any) => {

            if (ci?.quantity !== ci?.cartItemQuantity) {
                if (ci?.cartItemQuantity <= ci?.cartItem?.product[0]?.quantity && ci?.cartItem?.product[0]?.status === 'DISPONIBLE') {

                    const quantityOrdered = {
                        productID: ci?.cartItem?.product[0]?.$id,
                        quantity: ci?.cartItem?.quantity
                    }

                    const dataAfterPurchase = {
                        cartItemID: ci?.cartItem?.$id,
                        productID: ci?.cartItem?.product[0]?.$id,
                        newProductQuantity: ci?.cartItem?.product[0]?.quantity - ci?.cartItem?.quantity,
                        newProductSales: ci?.cartItem?.product[0]?.sales + ci?.cartItem?.quantity
                    }

                    const dataForStripe = {
                        productName: ci?.cartItem?.product[0]?.name,
                        productPrice: ci?.cartItem?.product[0]?.price,
                        productPriceStripeID: ci?.cartItem?.product[0]?.stripe_price_id,
                        productImage: ci?.cartItem?.product[0]?.image,
                        productQuantity: ci?.cartItemQuantity
                    }

                    stripeData.push(dataForStripe)
                    cartItemsIDs.push(ci?.cartItem?.$id)
                    quantityByProduct.push(quantityOrdered)
                    changesInDbAfterPurchase.push(dataAfterPurchase)
                }
            }
        });

        // Put CartItems IDs in a single string
        cartItemsIDs2 = cartItemsIDs

        cartItemsIDs2?.forEach((ciID: string, index: number, array: []) => {
            if (index === array.length - 1) {
                CartItemsIDsForStripe += ciID
            } else {
                CartItemsIDsForStripe += ciID + ','
            }
        });

        const myDataToBuy = {
            customerID: customerInSession?.id,
            customerName: customerInSession?.names + ' ' + customerInSession?.lastnames,
            //stripeCustomerID: customerInSession?.stripe_customer_ID,
            cartItems: CartItemsIDsForStripe,
            shippingTotal: shippingTotal,
            subTotal: subTotal,
            totalAmount: orderTotal,
            orderNumber: 'SLO' + randomCode(10, { numericOnly: true }),
            orderDate: new Date(),
            changesInDbAfterPurchase: JSON.stringify(changesInDbAfterPurchase),
            products: stripeData,
            success_url: `${theURL}/pedidos?stripe=true`,
            failure_url: `${theURL}/carrito`,
            customerEmail: customerInSession?.email,
        }

        try {

            await fetch('https://66b94e60ecb482096469.appwrite.global/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(myDataToBuy)
            })
                .then(async (res) => {
                    const data = await res.json()
                    window.location.href = data.url;
                })

        } catch (error) {
            console.log(error)
        }
    }

    if (!allTheCartItems) {
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
            <div className="bg-white grid grid-rows-[1fr] min-h-dvh">
                <div className="max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:max-w-full">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Mi Carrito</h1>

                    {
                        allTheCartItems && allTheCartItems?.length === 0 ?
                            (
                                <div className="min-h-dvh flex items-center justify-center rounded-lg">
                                    <div className="flex flex-col items-center gap-1 text-center">
                                        <h3 className="text-2xl font-bold tracking-tight">
                                            No tienes productos en el carrito
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Agrega un producto y compra.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6">

                                    <div className="lg:col-span-7">

                                        <Form {...form}>
                                            <form
                                                className="">
                                                <section aria-labelledby="cart-heading" className="">
                                                    <h2 id="cart-heading" className="sr-only">
                                                        Artículos en mi carrito
                                                    </h2>

                                                    <div className="flex items-center justify-end">
                                                        {allTheCartItems?.length > 0 &&
                                                            <Button
                                                                disabled={!isUpdateQuantitiesButtonVisible}
                                                                onClick={(e) => [
                                                                    e.preventDefault(),
                                                                    changeCartItemQuantity()
                                                                ]}
                                                                className="bg-rose-600 mb-4"
                                                            >
                                                                {loadingQuantity ?
                                                                    <>
                                                                        <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                                            </path>
                                                                        </svg>
                                                                        Actualizando...
                                                                    </>
                                                                    : 'ACTUALIZAR CANTIDADES'
                                                                }
                                                            </Button>
                                                        }

                                                    </div>


                                                    <ul role="list" className="divide-y divide-gray-300">
                                                        {allTheCartItems?.map((ci: Models.Document, idx: number) => (
                                                            <li
                                                                key={ci?.$id}
                                                                className={cn(
                                                                    ci?.product[0].status === 'DISPONIBLE' ? 'bg-slate-100' : 'bg-rose-100',
                                                                    "flex rounded-xl px-2 py-6 sm:py-10"
                                                                )}>
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        alt={ci?.product[0].name}
                                                                        src={ci?.product[0].image}
                                                                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                                                                    />
                                                                </div>

                                                                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-1 sm:pr-0">
                                                                        <div className="w-full flex flex-col flex-1 gap-3">
                                                                            <div>
                                                                                <h3 className="text-base">
                                                                                    <Link
                                                                                        to={`/tienda/los_productos/${ci?.product[0].$id}`}
                                                                                        className="font-bold text-balck-900 hover:text-blue-800"
                                                                                    >
                                                                                        {ci?.product[0].name}
                                                                                    </Link>
                                                                                </h3>
                                                                            </div>

                                                                            <p
                                                                                className={cn(
                                                                                    ci?.product[0]?.status === 'NO DISPONIBLE' ? 'line-through text-gray-500' : 'font-bold text-pink-800',
                                                                                    "mt-1 text-lg"
                                                                                )}
                                                                            >
                                                                                RD$ {formatPrice(ci?.product[0].price)}
                                                                            </p>

                                                                            <div className="max-w-[76px] flex flex-col gap-y-1">
                                                                                {/* QUANTITY */}
                                                                                <FormField
                                                                                    control={form?.control}
                                                                                    name={`cartItem.${idx}.cartItemQuantity`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel className='text-gray-900 font-medium'>Cantidad</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    disabled={ci?.product[0]?.status === 'NO DISPONIBLE'}
                                                                                                    className='font-bold'
                                                                                                    type="number"
                                                                                                    onChange={(e) => [
                                                                                                        form.setValue(`cartItem.${idx}.cartItemQuantity`, Number(e.target.value)),
                                                                                                        setIsUpdateQuantitiesButtonVisible(true)
                                                                                                    ]} />
                                                                                            </FormControl>
                                                                                            <FormMessage className='text-red-800' />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />

                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-4 sm:mt-0 sm:pr-9">

                                                                            <div className="absolute right-0 top-0">
                                                                                <Button
                                                                                    variant='outline'
                                                                                    type="button"
                                                                                    onClick={(e) => [
                                                                                        e.preventDefault(),
                                                                                        setSelectedCartItemToDelete(ci),
                                                                                        setDeletingProductFromCart(true)
                                                                                    ]}
                                                                                    className="inline-flex p-2 rounded-xl text-indigo hover:text-red-600 font-bold"
                                                                                >
                                                                                    <span className="sr-only">Remove</span>
                                                                                    <X aria-hidden="true" className="h-4 w-4 " />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 flex space-x-2 text-sm text-gray-700">
                                                                        {ci?.product[0].status === 'DISPONIBLE' ? (
                                                                            <>
                                                                                <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                                                <p className="ml-2 text-sm text-green-600 font-bold">{ci?.product[0].status}</p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <X aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-pink-800" />
                                                                                <p className="ml-2 text-sm text-pink-800 font-bold">{ci?.product[0].status}</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}

                                                        {/* THE CART ITEMS UNAVAILABLES */}
                                                        {allTheUnavailableCartItems?.map((ci: Models.Document, idx: number) => (
                                                            <li
                                                                key={ci?.$id}
                                                                className={cn(
                                                                    ci?.product[0].status === 'DISPONIBLE' ? 'bg-slate-100' : 'bg-rose-100',
                                                                    "flex rounded-xl px-2 py-6 sm:py-10"
                                                                )}>
                                                                <div className="flex-shrink-0">
                                                                    <img
                                                                        alt={ci?.product[0].name}
                                                                        src={ci?.product[0].image}
                                                                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                                                                    />
                                                                </div>

                                                                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-1 sm:pr-0">
                                                                        <div className="w-full flex flex-col flex-1 gap-3">
                                                                            <div>
                                                                                <h3 className="text-base">
                                                                                    <Link
                                                                                        to={`/tienda/los_productos/${ci?.product[0].$id}`}
                                                                                        className="font-bold text-balck-900 hover:text-blue-800"
                                                                                    >
                                                                                        {ci?.product[0].name}
                                                                                    </Link>
                                                                                </h3>
                                                                            </div>

                                                                            <p
                                                                                className={cn(
                                                                                    ci?.product[0]?.status === 'NO DISPONIBLE' ? 'line-through text-gray-500' : 'font-bold text-pink-800',
                                                                                    "mt-1 text-lg"
                                                                                )}
                                                                            >
                                                                                RD$ {formatPrice(ci?.product[0].price)}
                                                                            </p>

                                                                            <div className="max-w-[76px] flex flex-col gap-y-1">
                                                                                {/* QUANTITY */}
                                                                                <FormField
                                                                                    control={form?.control}
                                                                                    name={`cartItem.${idx}.cartItemQuantity`}
                                                                                    render={({ field }) => (
                                                                                        <FormItem>
                                                                                            <FormLabel className='text-gray-900 font-medium'>Cantidad</FormLabel>
                                                                                            <FormControl>
                                                                                                <Input
                                                                                                    {...field}
                                                                                                    disabled={ci?.product[0]?.status === 'NO DISPONIBLE'}
                                                                                                    className='font-bold'
                                                                                                    type="number"
                                                                                                    onChange={(e) => [
                                                                                                        form.setValue(`cartItem.${idx}.cartItemQuantity`, Number(e.target.value)),
                                                                                                        setIsUpdateQuantitiesButtonVisible(true)
                                                                                                    ]} />
                                                                                            </FormControl>
                                                                                            <FormMessage className='text-red-800' />
                                                                                        </FormItem>
                                                                                    )}
                                                                                />

                                                                            </div>
                                                                        </div>

                                                                        <div className="mt-4 sm:mt-0 sm:pr-9">

                                                                            <div className="absolute right-0 top-0">
                                                                                <Button
                                                                                    variant='outline'
                                                                                    type="button"
                                                                                    onClick={(e) => [
                                                                                        e.preventDefault(),
                                                                                        setSelectedCartItemToDelete(ci),
                                                                                        setDeletingProductFromCart(true)
                                                                                    ]}
                                                                                    className="inline-flex p-2 rounded-xl text-indigo hover:text-red-600 font-bold"
                                                                                >
                                                                                    <span className="sr-only">Remove</span>
                                                                                    <X aria-hidden="true" className="h-4 w-4 " />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="mt-4 flex space-x-2 text-sm text-gray-700">
                                                                        {ci?.product[0].status === 'DISPONIBLE' ? (
                                                                            <>
                                                                                <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-600" />
                                                                                <p className="ml-2 text-sm text-green-600 font-bold">{ci?.product[0].status}</p>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <X aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-pink-800" />
                                                                                <p className="ml-2 text-sm text-pink-800 font-bold">{ci?.product[0].status}</p>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </section>
                                            </form>
                                        </Form>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-16 lg:mt-0 lg:col-span-5">

                                        {/* Shipping Info */}
                                        {defaultAddress && (
                                            <section className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                                                <div className="flex items-start justify-center">
                                                    <span className="text-xl text-rose-800 font-bold">
                                                        Mi Dirección
                                                    </span>
                                                </div>
                                                <div className="flex items-start text-gray-800 space-x-4 rounded-md p-0.5 transition-all">
                                                    <div className="pt-5">
                                                        <p className="text-sm font-bold leading-none">{defaultAddress?.fullname}</p>
                                                        <p className="pt-3 text-sm">
                                                            {defaultAddress?.street_type === 'CALLE' ? 'C/' : 'AVE.'} {defaultAddress?.street_name} #{defaultAddress?.street_number}
                                                        </p>
                                                        <p className="text-sm">
                                                            {defaultAddress?.neighborhood}
                                                        </p>
                                                        <p className="text-sm">
                                                            {defaultAddress?.province}
                                                        </p>
                                                        <p className="text-sm">
                                                            {defaultAddress?.country}
                                                        </p>
                                                        <p className="text-sm">
                                                            Código postal: {defaultAddress?.zip_code}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start space-x-4 rounded-md p-0.5 pt-2 text-accent-foreground transition-all">
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-bold leading-none">Teléfono</p>
                                                        <p className="text-sm text-gray-800">
                                                            {defaultAddress?.phone_number}
                                                        </p>
                                                    </div>
                                                </div>
                                            </section>
                                        )}

                                        {/* Order summary */}
                                        <section
                                            aria-labelledby="summary-heading"
                                            className="rounded-lg border border-gray-300 bg-gray-50 p-4"
                                        >
                                            <div className="flex items-start justify-center">
                                                <h2 id="summary-heading" className="text-xl text-rose-800 font-bold">
                                                    Resumen del pedido
                                                </h2>
                                            </div>

                                            <dl className="mt-6 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                                    <dd className="text-sm font-medium text-gray-900">RD$ {formatPrice(subTotal)}</dd>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                                    <dt className="flex items-center text-sm text-gray-600">
                                                        <span>Costos de envío</span>
                                                    </dt>
                                                    <dd className="text-sm font-medium text-gray-900">RD$ {formatPrice(shippingTotal)}</dd>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                                    <dt className="text-base font-medium text-gray-900">Total a pagar</dt>
                                                    <dd className="text-base font-bold text-pink-800">RD$ {formatPrice(orderTotal)}</dd>
                                                </div>
                                            </dl>

                                            <div className="mt-6">
                                                <Button
                                                    disabled={allTheCartItems?.length === 0 || loading || loadingQuantity || defaultAddress === null}
                                                    onClick={() => payTheProducts()}
                                                    type="button"
                                                    className="w-full rounded-md border border-transparent bg-gray-900 hover:bg-rose-600 px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                                >
                                                    {loading ?
                                                        <>
                                                            <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                                </path>
                                                            </svg>
                                                            Redirigiendo...
                                                        </>
                                                        : 'IR A PAGAR'
                                                    }

                                                </Button>
                                            </div>
                                        </section>

                                        {/* <Form {...formToPayTheProduct}>
                                <form
                                    onSubmit={formToPayTheProduct?.handleSubmit(payTheProducts)}>

                                    <section className="rounded-lg bg-gray-50">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Métodos de pago</CardTitle>
                                                <CardDescription>
                                                    Agrega un nuevo método de pago.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="grid gap-6">
                                                <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                                        <Label
                                                            htmlFor="card"
                                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-indigo-600"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                className="mb-3 h-6 w-6"
                                                            >
                                                                <rect width="20" height="14" x="2" y="5" rx="2" />
                                                                <path d="M2 10h20" />
                                                            </svg>
                                                            Tarjeta
                                                        </Label>
                                                    </div>
                                                </RadioGroup>

                                                <div className="grid gap-2">

                                                    <FormField
                                                        control={formToPayTheProduct?.control}
                                                        name="fullname"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='dark:text-gray-100'>Nombre completo</FormLabel>
                                                                <FormControl>
                                                                    <Input className='uppercase font-medium' {...field} />
                                                                </FormControl>
                                                                <FormMessage className='text-red-800' />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid gap-2">

                                                    <FormField
                                                        control={formToPayTheProduct?.control}
                                                        name="cardNumber"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='dark:text-gray-100'>Número de tarjeta</FormLabel>
                                                                <FormControl>
                                                                    <InputMask
                                                                        {...field}
                                                                        mask="9999-9999-9999-9999"
                                                                        maskPlaceholder={null}
                                                                        type="text"
                                                                        className='flex h-10 w-full rounded-md border border-input bg-background dark:bg-slate-300 px-1.5 py-2 text-sm font-medium dark:text-gray-700 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className='text-red-800' />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="grid gap-2">

                                                        <FormField
                                                            control={formToPayTheProduct?.control}
                                                            name="expirationMonth"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <Select onValueChange={(e) => [field.onChange(e)]} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                                <SelectValue placeholder='Mes' />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                            <SelectItem value="1">ENERO</SelectItem>
                                                                            <SelectItem value="2">FEBRERO</SelectItem>
                                                                            <SelectItem value="3">MARZO</SelectItem>
                                                                            <SelectItem value="4">ABRIL</SelectItem>
                                                                            <SelectItem value="5">MAYO</SelectItem>
                                                                            <SelectItem value="6">JUNIO</SelectItem>
                                                                            <SelectItem value="7">JULIO</SelectItem>
                                                                            <SelectItem value="8">AGOSTO</SelectItem>
                                                                            <SelectItem value="9">SEPTIEMBRE</SelectItem>
                                                                            <SelectItem value="10">OCTUBRE</SelectItem>
                                                                            <SelectItem value="11">NOVIEMBRE</SelectItem>
                                                                            <SelectItem value="12">DICIEMBRE</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className='text-red-800' />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">

                                                        <FormField
                                                            control={formToPayTheProduct?.control}
                                                            name="expirationYear"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <Select onValueChange={(e) => [field.onChange(e)]} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                                <SelectValue placeholder='Año' />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                            {Array.from({ length: 10 }, (_, i) => (
                                                                                <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>
                                                                                    {new Date().getFullYear() + i}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className='text-red-800' />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">

                                                        <FormField
                                                            control={formToPayTheProduct?.control}
                                                            name="cvc"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl>

                                                                        <InputMask
                                                                            {...field}
                                                                            mask="999"
                                                                            maskPlaceholder={null}
                                                                            type="text"
                                                                            placeholder="CVC"
                                                                            className='flex h-10 w-full rounded-md border border-input bg-background dark:bg-slate-300 px-1.5 py-2 text-sm font-medium dark:text-gray-700 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className='text-red-800' />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button
                                                    disabled={allTheCartItems?.length === 0}
                                                    type="submit"
                                                    className="w-full rounded-md border border-transparent bg-rose-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                                >
                                                    PAGAR
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </section>
                                </form>
                            </Form> */}
                                    </div>
                                </div>
                            )
                    }

                </div>
            </div>

            {/* DELETE PRODUCTS FROM CART ALERT DIALOG */}
            <AlertDialog open={deletingProductFromCart} onOpenChange={setDeletingProductFromCart}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-red-700 text-xl text-center'>{selectedCartItemToDelete?.product?.name}</AlertDialogTitle>
                        <AlertDialogDescription className='text-base font-medium text-gray-900 text-center'>
                            {customerInSession?.gender === 'F' ?
                                "¿Segura de eliminarlo del carrito?"
                                :
                                "¿Seguro de eliminarlo del carrito?"
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>

                        <AlertDialogCancel className='bg-[#143a63] hover:bg-black text-gray-100 hover:text-gray-100'>
                            Entendido
                        </AlertDialogCancel>

                        <AlertDialogAction className='bg-rose-600 hover:bg-red-700' onClick={() => deleteProductFromCart(selectedCartItemToDelete?.$id as string)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* SUCCESSFUL PAYMENT ALERT DIALOG */}
            <AlertDialog open={isDefaultAdressFound} onOpenChange={setIsDefaultAdressFound}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center justify-center text-center text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-500'>
                            <span>No se encontró dirección predeterminada</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className='flex flex-col gap-y-3 text-center'>
                            <span className='text-xl text-gray-900'>Agregue una dirección predeterminada para hacer el pedido.</span>
                            <span className='text-base font-medium text-gray-900'>Será redirigido a la página de direcciones.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-row sm:justify-center">

                        <AlertDialogAction className='bg-rose-600' onClick={() => navigate('/direcciones')}>Entendido</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CustomerCartPage