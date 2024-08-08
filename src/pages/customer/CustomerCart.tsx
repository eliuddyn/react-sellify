/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import db from "@/appwrite/databases";
import { Models, Query } from "appwrite";
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from "@mona-health/react-input-mask";
import { randomCode } from 'generate-random-code';
import { X, Check } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import upperCaseFunction from "@/customFunctions/upperCaseFunction";

const paymentCardFormSchema = z.object({
    fullname: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    cardNumber: z.string({ required_error: "Requerido" }).length(19, { message: "19 caracteres mínimo" }),
    expirationMonth: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    expirationYear: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    cvc: z.string({ required_error: "Requerido" }).length(3, { message: "3 caracteres mínimo" }),
})

type FormValues = {
    cartItem: {
        cartItem: Models.Document;
        cartItemQuantity: number;
    }[];
};

const CustomerCartPage = () => {

    const navigate = useNavigate()
    const [allTheCartItems, setAllTheCartItems] = useState<Models.Document[]>([]);
    const [allTheUnavailableCartItems, setAllTheUnavailableCartItems] = useState<Models.Document[]>([]);
    const [subTotal, setSubTotal] = useState<number>(0)
    const [shippingTotal, setShippingTotal] = useState<number>(0)
    const [taxTotal, setTaxTotal] = useState<number>(0)
    const [orderTotal, setOrderTotal] = useState<number>(0)
    const [selectedCartItemToDelete, setSelectedCartItemToDelete] = useState<Models.Document | null>(null);
    const [deletingProductFromCart, setDeletingProductFromCart] = useState<boolean>(false)
    const [isUpdateQuantitiesButtonVisible, setIsUpdateQuantitiesButtonVisible] = useState<boolean>(false)
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false)
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)

    const formToPayTheProduct = useForm<z.infer<typeof paymentCardFormSchema>>({
        resolver: zodResolver(paymentCardFormSchema),
        mode: "onSubmit",
        defaultValues: {
            fullname: '',
            cardNumber: '',
            expirationMonth: '',
            expirationYear: '',
            cvc: '',
        },
    });

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
        let myTaxTotal: number = 0

        cartItems?.documents?.forEach((ci: Models.Document, idx: number) => {

            if (ci?.product[0]?.status === 'DISPONIBLE' && ci?.product[0]?.quantity >= ci?.quantity) {

                myShippingTotal = 635
                myTaxTotal = 490

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
        setTaxTotal(myTaxTotal)
        setOrderTotal(myShippingTotal + myTaxTotal + mySubTotal)
        setCustomerCartItemsInSession(theCartItems, 'login')
        setAllTheCartItems(theCartItems)
    }

    async function changeCartItemQuantity() {

        form.getValues().cartItem?.forEach(async (ci: any) => {

            if (ci?.cartItem?.quantity !== ci?.cartItemQuantity) {
                if (ci?.cartItemQuantity <= ci?.cartItem?.product[0]?.quantity && ci?.cartItem?.product[0]?.status === 'DISPONIBLE') {

                    try {
                        await db.cartItems.update(ci?.cartItem?.$id, { quantity: ci?.cartItemQuantity });

                    } catch (error) {
                        console.log(error)
                    }
                }
            }
        });

        await getAllCartItems()
        window.location.reload()
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

    async function payTheProducts(values: z.infer<typeof paymentCardFormSchema>) {

        let cartItemsIDs: string[] = [];
        let quantityByProduct: any[] = [];
        let changesInDbAfterPurchase: any[] = [];

        form.getValues().cartItem?.forEach(async (ci: any) => {

            if (ci?.quantity !== ci?.cartItemQuantity) {
                if (ci?.cartItemQuantity <= ci?.cartItem?.product[0]?.quantity && ci?.cartItem?.product[0]?.status === 'DISPONIBLE') {

                    const quantityOrdered = {
                        productID: ci?.cartItem?.product[0]?.$id,
                        quantity: ci?.cartItem?.quantity
                    }

                    const dataAfterPurchase = {
                        cartItemID: ci?.cartItem?.$id, //To set -purchased- attribute to -YES- in CARTITEMS collection
                        productID: ci?.cartItem?.product[0]?.$id,
                        newProductQuantity: ci?.cartItem?.product[0]?.quantity - ci?.cartItem?.quantity,
                        newProductSales: ci?.cartItem?.product[0]?.sales + ci?.cartItem?.quantity
                    }

                    cartItemsIDs.push(ci?.cartItem?.$id)
                    quantityByProduct.push(quantityOrdered)
                    changesInDbAfterPurchase.push(dataAfterPurchase)
                }
            }
        });

        const myOrderToPurchase = {
            customer: customerInSession?.id,
            cartItems: cartItemsIDs,
            shippingTotal: shippingTotal,
            taxTotal: taxTotal,
            subTotal: subTotal,
            totalAmount: orderTotal,
            nameOnCard: upperCaseFunction(values.fullname),
            cardNumber: values.cardNumber,
            orderNumber: 'SLO' + randomCode(10, { numericOnly: true }),
            orderDate: new Date(),
        }

        try {
            await db.orders.create(myOrderToPurchase);

            changesInDbAfterPurchase?.forEach(async (purchase: any) => {
                await db.cartItems.update(purchase?.cartItemID, { purchased: 'YES' });
                await db.products.update(purchase?.productID, { quantity: purchase?.newProductQuantity, sales: purchase?.newProductSales });
            });

            setIsPaymentSuccessful(true)

        } catch (error) {
            console.log(error)
        }
    }

    const reCheckTheCart = () => {
        getAllCartItems().then(() => {
            navigate('/pedidos')
        })
    }

    return (
        <>
            <div className="bg-white grid grid-rows-[1fr] min-h-dvh">
                <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Mi Carrito</h1>

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
                                                    className="bg-indigo-600 my-4"
                                                >
                                                    ACTUALIZAR CANTIDADES
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
                                                                            to={`/tienda/celulares/${ci?.product[0].$id}`}
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
                                                                            to={`/tienda/celulares/${ci?.product[0].$id}`}
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


                            {/* Order summary */}
                            <section
                                aria-labelledby="summary-heading"
                                className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-6 sm:p-6 lg:p-8"
                            >
                                <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
                                    Resumen del pedido
                                </h2>

                                <dl className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-sm text-gray-600">Subtotal</dt>
                                        <dd className="text-sm font-medium text-gray-900">RD$ {formatPrice(subTotal)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <dt className="flex items-center text-sm text-gray-600">
                                            <span>Costos de envío</span>
                                            {/* <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                                            <span className="sr-only">Learn more about how shipping is calculated</span>
                                            <CircleHelp aria-hidden="true" className="h-5 w-5" />
                                        </a> */}
                                        </dt>
                                        <dd className="text-sm font-medium text-gray-900">RD$ {formatPrice(shippingTotal)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <dt className="flex text-sm text-gray-600">
                                            <span>Impuestos</span>
                                            {/* <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                                            <span className="sr-only">Learn more about how tax is calculated</span>
                                            <CircleHelp aria-hidden="true" className="h-5 w-5" />
                                        </a> */}
                                        </dt>
                                        <dd className="text-sm font-medium text-gray-900">RD$ {formatPrice(taxTotal)}</dd>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                        <dt className="text-base font-medium text-gray-900">Total a pagar</dt>
                                        <dd className="text-base font-bold text-pink-800">RD$ {formatPrice(orderTotal)}</dd>
                                    </div>
                                </dl>

                                {/* <div className="mt-6">
                                    <button
                                        type="submit"
                                        className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                    >
                                        Checkout
                                    </button>
                                </div> */}
                            </section>

                            <Form {...formToPayTheProduct}>
                                <form
                                    onSubmit={formToPayTheProduct?.handleSubmit(payTheProducts)}>

                                    {/* Payment Methods */}
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

                                                    {/* FULLNAME */}
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

                                                    {/* CARD NUMBER */}
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

                                                        {/* EXPIRATION MONTH */}
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

                                                        {/* EXPIRATION YEAR */}
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

                                                        {/* CVC */}
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
                                                    className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                                >
                                                    PAGAR
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </section>
                                </form>
                            </Form>
                        </div>
                    </div>

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

                        <AlertDialogAction className='bg-indigo-600 hover:bg-red-700' onClick={() => deleteProductFromCart(selectedCartItemToDelete?.$id as string)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* SUCCESSFUL PAYMENT ALERT DIALOG */}
            <AlertDialog open={isPaymentSuccessful} onOpenChange={setIsPaymentSuccessful}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center justify-center text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500'>
                            <span>Pago Exitoso</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className='flex flex-col gap-y-3 text-center'>
                            <span className='text-xl font-bold text-gray-900'>Gracias por realizar su pedido.</span>
                            <span className='text-base font-medium text-gray-900'>Será redirigido a su página de pedidos.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-row sm:justify-center">

                        <AlertDialogAction className='bg-indigo-600' onClick={() => reCheckTheCart()}>Entendido</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CustomerCartPage