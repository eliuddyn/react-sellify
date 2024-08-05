/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import db from "@/appwrite/databases";
import { Models } from "appwrite";
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from "react-input-mask";
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
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/customFunctions/formatPrice";

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

    const [allTheCartItems, setAllTheCartItems] = useState<Models.Document[]>([]);
    const [subTotal, setSubTotal] = useState<number>(0)
    const [shippingTotal, setShippingTotal] = useState<number>(0)
    const [taxTotal, setTaxTotal] = useState<number>(0)
    const [orderTotal, setOrderTotal] = useState<number>(0)
    const [isUpdateQuantitiesButtonVisible, setIsUpdateQuantitiesButtonVisible] = useState<boolean>(false)

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
        const cartItems = await db.cartItems.list();

        let mySubTotal: number = 0

        cartItems?.documents?.forEach((ci: Models.Document, idx: number) => {
            mySubTotal += ci?.product?.price * ci?.quantity;

            form.register(`cartItem.${idx}.cartItem` as const)
            form.setValue(`cartItem.${idx}.cartItem`, ci)

            form.register(`cartItem.${idx}.cartItemQuantity` as const)
            form.setValue(`cartItem.${idx}.cartItemQuantity` as const, ci?.quantity)

        });

        setSubTotal(mySubTotal)
        setShippingTotal(250)
        setTaxTotal(475)
        setOrderTotal(shippingTotal + taxTotal + mySubTotal)
        setAllTheCartItems(cartItems.documents)
    }

    async function changeCartItemQuantity() {

        form.getValues().cartItem?.forEach(async (ci: any) => {

            if (ci?.quantity !== ci?.cartItemQuantity) {
                if (ci?.cartItemQuantity <= ci?.cartItem?.product?.quantity && ci?.cartItem?.product?.status === 'DISPONIBLE') {
                    await db.cartItems.update(ci?.cartItem?.$id, { quantity: ci?.cartItemQuantity });
                }
            }

        });

        await getAllCartItems()
    }

    async function payTheProducts(values: z.infer<typeof paymentCardFormSchema>) {
        console.log(values)
    }

    return (
        <div className="bg-white grid grid-rows-[1fr] min-h-dvh">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Mi Carrito</h1>

                <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">

                    <div className="lg:col-span-7">

                        <Form {...form}>
                            <form
                                onSubmit={form?.handleSubmit(changeCartItemQuantity)}
                                className="">
                                <section aria-labelledby="cart-heading" className="">
                                    <h2 id="cart-heading" className="sr-only">
                                        Artículos en mi carrito
                                    </h2>

                                    <div className="flex items-center justify-end">
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
                                    </div>


                                    <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                                        {allTheCartItems.map((ci: Models.Document, idx: number) => (
                                            <li key={ci?.$id} className="flex py-6 sm:py-10">
                                                <div className="flex-shrink-0">
                                                    <img
                                                        alt={ci?.product.name}
                                                        src={ci?.product.image}
                                                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                                                    />
                                                </div>

                                                <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                                        <div>
                                                            <div className="flex justify-between">
                                                                <h3 className="text-sm">
                                                                    <Link to={ci?.product.name} className="font-medium text-gray-700 hover:text-gray-800">
                                                                        {ci?.product.name}
                                                                    </Link>
                                                                </h3>
                                                            </div>
                                                            <p className="mt-1 text-sm font-medium text-red-800">RD$ {formatPrice(ci?.product.price * ci?.quantity)}</p>
                                                        </div>

                                                        <div className="mt-4 sm:mt-0 sm:pr-9">

                                                            <div className=" flex flex-col gap-y-2">
                                                                {/* QUANTITY */}
                                                                <FormField
                                                                    control={form?.control}
                                                                    name={`cartItem.${idx}.cartItemQuantity`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='text-gray-900 font-bold'>Cantidad</FormLabel>
                                                                            <FormControl>
                                                                                <Input className='font-medium' type="number" {...field} onChange={(e) => [
                                                                                    form.setValue(`cartItem.${idx}.cartItemQuantity`, Number(e.target.value)),
                                                                                    setIsUpdateQuantitiesButtonVisible(true)
                                                                                ]} />
                                                                            </FormControl>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                            </div>


                                                            <div className="absolute right-0 top-0">
                                                                <button type="button" className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                                                                    <span className="sr-only">Remove</span>
                                                                    <X aria-hidden="true" className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="mt-4 flex space-x-2 text-sm text-gray-700">
                                                        {ci?.product.status === 'DISPONIBLE' ? (
                                                            <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-green-500" />
                                                        ) : (
                                                            <X aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-red-700" />
                                                        )}

                                                        <span>{ci?.product.status}</span>
                                                    </p>
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
                                    <dd className="text-base font-bold text-red-800">RD$ {formatPrice(orderTotal)}</dd>
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
                                            <CardTitle>Métodos de pagos</CardTitle>
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
                                            <button
                                                type="submit"
                                                className="w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                            >
                                                PAGAR
                                            </button>
                                        </CardFooter>
                                    </Card>
                                </section>
                            </form>
                        </Form>
                    </div>
                </div>

                {/* </form>
                </Form> */}

            </div>
        </div>
    )
}

export default CustomerCartPage