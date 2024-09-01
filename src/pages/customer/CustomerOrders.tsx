/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from "react-router-dom";
import { es } from 'date-fns/locale';
import { format } from "date-fns"
import { Button } from '@/components/ui/button';
import { Models, Query } from 'appwrite';
import db from '@/appwrite/databases';
import useSellifyStore from '@/store/user';
import { formatPrice } from '@/customFunctions/formatPrice';
import { Link } from 'react-router-dom';
import {
    AlertDialog,
    AlertDialogAction,
    //AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const CustomerOrdersPage = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const stripe = searchParams.get('stripe')
    const [allTheOrders, setAllTheOrders] = useState<Models.Document[] | null>(null);
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const [isPaymentSuccessful, setIsPaymentSuccessful] = useState<boolean>(false)

    useEffect(() => {

        if (stripe && stripe === 'true') {
            setIsPaymentSuccessful(true)
        } else {
            checkTheCart()
            getAllOrders();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllOrders = async () => {
        const orders = await db.orders.list([
            Query.equal('customer', customerInSession?.id as string),
            Query.orderDesc("orderDate")
        ]);

        setAllTheOrders(orders.documents)
    }

    const checkTheCart = async () => {
        const cartItems = await db.cartItems.list([
            Query.equal('customer', customerInSession?.id as string),
            Query.equal("purchased", "NO")
        ]);

        let theCartItems: Models.Document | any = [];

        cartItems?.documents?.forEach((ci: Models.Document) => {

            if (ci?.product[0]?.status === 'DISPONIBLE' && ci?.product[0]?.quantity >= ci?.quantity) {
                theCartItems.push(ci)
            }
        });

        setCustomerCartItemsInSession(theCartItems, 'login')
    }

    const reloadThePage = () => {
        navigate('/pedidos')
        checkTheCart()
        getAllOrders();
    }

    return (
        <>
            <div className="grid grid-rows-[1fr] min-h-dvh">
                <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8 lg:pb-24">

                    <div className="max-w-xl py-8">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mis Pedidos</h1>
                        <p className="mt-2 text-base text-gray-700">
                            Aquí aparecen tus pedidos recientes con sus facturas.
                        </p>
                    </div>

                    <div>
                        <h2 className="sr-only">Recent orders</h2>

                        {!allTheOrders && (
                            <div className='h-screen flex items-center justify-center space-x-2'>
                                <span className='sr-only'>Loading...</span>
                                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                                <div className='h-8 w-8 bg-rose-800 rounded-full animate-bounce'></div>
                            </div>
                        )}

                        {
                            allTheOrders && allTheOrders?.length === 0 ?
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
                                ) :

                                <>
                                    {allTheOrders?.map((order: Models.Document) => (
                                        <div key={order.$id} className="space-y-20 rounded-lg border border-gray-300 my-3.5">
                                            <div>
                                                <h3 className="sr-only">
                                                    Order placed on <time dateTime={order.orderDate}>{order.orderDate}</time>
                                                </h3>

                                                <div className="rounded-t-lg border-b border-gray-300 bg-slate-100 px-4 py-3 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:px-6 lg:space-x-8">
                                                    <dl className="flex-auto space-y-2 divide-y divide-gray-200 text-sm text-gray-600 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:space-y-0 sm:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
                                                        <div className="flex justify-between sm:block">
                                                            <dt className="font-bold text-gray-900">Fecha</dt>
                                                            <dd className="sm:mt-1 text-gray-700 font-medium">
                                                                <span>{format(order.orderDate, 'PPP', { locale: es })}</span>
                                                            </dd>
                                                        </div>
                                                        <div className="flex justify-between pt-3 sm:block sm:pt-0">
                                                            <dt className="font-bold text-gray-900">Orden #</dt>
                                                            <dd className="sm:mt-1 text-gray-700 font-medium">{order.orderNumber}</dd>
                                                        </div>
                                                        <div className="flex justify-between pt-3 sm:block sm:pt-0">
                                                            <dt className="font-bold text-gray-900">Monto total</dt>
                                                            <dd className="sm:mt-1 text-pink-800 font-medium">RD$ {formatPrice(order.totalAmount)}</dd>
                                                        </div>
                                                    </dl>

                                                    <Button
                                                        className='bg-gray-900 hover:bg-rose-600 mt-6 text-base sm:text-sm flex w-full sm:w-fit'>
                                                        <Link
                                                            to={order.invoice_pdf_url}
                                                            target='_blank'
                                                        >

                                                            Ver Factura
                                                        </Link>
                                                    </Button>

                                                </div>

                                                <table className="mt-4 w-full text-gray-500 sm:mt-6">
                                                    <caption className="sr-only">Products</caption>
                                                    <thead className="sr-only text-left text-sm text-gray-800 sm:not-sr-only">
                                                        <tr>
                                                            <th scope="col" className="py-3 pl-3 pr-8 font-bold w-auto">
                                                                Producto
                                                            </th>
                                                            <th scope="col" className="hidden w-auto py-3 pr-8 font-bold sm:table-cell">
                                                                Precio
                                                            </th>
                                                            <th scope="col" className="hidden py-3 pr-8 font-bold sm:table-cell">
                                                                Cantidad
                                                            </th>
                                                            <th scope="col" className="hidden py-3 pr-8 font-bold sm:table-cell">
                                                                Sistema Operativo
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200 text-sm sm:border-t">
                                                        {order?.cartItems?.map((ci: Models.Document) => (
                                                            <tr key={ci?.$id}>
                                                                <td className="py-1 pl-1">
                                                                    <div className="flex items-center">
                                                                        <img
                                                                            alt={ci?.product[0].name}
                                                                            src={ci?.product[0].image}
                                                                            className="mr-6 h-16 w-16 rounded object-cover object-center"
                                                                        />
                                                                        <div>
                                                                            <div className="font-medium text-gray-800 hover:text-blue-700">
                                                                                <Link to={`/tienda/celulares/${ci?.product[0].$id}`}>
                                                                                    <span>{ci?.product[0].name}</span>
                                                                                    <span className="sr-only">, {ci?.product[0].name}</span>
                                                                                </Link>
                                                                            </div>
                                                                            <div className="mt-1 sm:hidden font-medium text-gray-900">RD$ {formatPrice(ci?.product[0].price)}</div>
                                                                            <div className="mt-1 sm:hidden font-medium text-gray-900">{ci?.product[0].operating_system}</div>
                                                                            <div className="mt-1 sm:hidden font-medium text-gray-900">Cant. {ci?.quantity}</div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">RD$ {formatPrice(ci?.product[0].price)}</td>
                                                                <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">{ci?.quantity}</td>
                                                                <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">{ci?.product[0].operating_system}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </>
                        }

                    </div>
                </div>
            </div>

            {/* SUCCESSFUL PAYMENT ALERT DIALOG */}
            <AlertDialog aria-hidden="true" open={isPaymentSuccessful} onOpenChange={setIsPaymentSuccessful}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center justify-center text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500'>
                            <span>Pago Exitoso</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className='flex flex-col gap-y-3 text-center'>
                            <span className='text-xl font-bold text-gray-900'>Gracias por realizar su pedido.</span>
                            <span className='text-base font-medium text-gray-900'>Aquí podrá ver todos sus pedidos.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:flex-row sm:justify-center">

                        <AlertDialogAction className='bg-rose-600' onClick={() => reloadThePage()}>Entendido</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CustomerOrdersPage