/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { es } from 'date-fns/locale';
import { format } from "date-fns"
import { Button } from '@/components/ui/button';
import { Models } from 'appwrite';
import db from '@/appwrite/databases';
import { formatPrice } from '@/customFunctions/formatPrice';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';

const OrdersPage = () => {

    const [allTheOrders, setAllTheOrders] = useState<Models.Document[]>([]);

    useEffect(() => {
        getAllorders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllorders = async () => {
        const orders = await db.orders.list();
        setAllTheOrders(orders.documents)
    }

    return (
        <>
            <PageHeader pageName="Órdenes" />

            <div>
                <h2 className="sr-only">Recent orders</h2>

                {allTheOrders?.map((order: Models.Document) => (
                    <div key={order.$id} className="space-y-20 rounded-lg border border-gray-300 my-6">
                        <div>
                            <h3 className="sr-only">
                                Order placed on <time dateTime={order.orderDate}>{order.orderDate}</time>
                            </h3>

                            <div className="rounded-t-lg border-b border-gray-300 bg-slate-100 px-4 py-6 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:px-6 lg:space-x-8">
                                <div className="flex-auto space-y-2 divide-y divide-gray-200 text-sm text-gray-600 sm:grid sm:grid-cols-2 sm:gap-y-2 sm:gap-x-3 sm:space-y-0 sm:divide-y-0 lg:grid-cols-4 lg:w-4/5 lg:flex-none lg:gap-x-4">
                                    <div className="flex items-center justify-between sm:block sm:pt-0">
                                        {/* <div className='flex items-center'>
                                            <Avatar className='h-9 w-9'>
                                                <AvatarImage src={undefined} alt="Foto" />
                                                <AvatarFallback className={cn(
                                                    order?.customer?.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600',
                                                    'text-gray-100'
                                                )}>
                                                    <span className='grid grid-cols-1 justify-items-center'>

                                                        <span className="text-sm">
                                                            {order?.customer?.names && order?.customer?.names?.split(" ")?.map((name: string) =>
                                                                <span key={name}>{name[0][0]}</span>
                                                            )}
                                                        </span>


                                                        <span className="text-sm">
                                                            {order?.customer?.lastnames && order?.customer?.lastnames?.split(" ")?.map((lastname: string) =>
                                                                <span key={lastname}>{lastname[0][0]}</span>
                                                            )}
                                                        </span>
                                                    </span>
                                                </AvatarFallback>
                                            </Avatar>
                                        </div> */}

                                        <div className="font-bold text-gray-900">Cliente</div>

                                        <div className="sm:mt-1 text-indigo-700 font-bold text-xs">
                                            <span>{order?.customer?.names} {order?.customer?.lastnames}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 sm:block sm:pt-0">
                                        <div className="font-bold text-gray-900">Fecha</div>
                                        <div className="sm:mt-1 text-indigo-700 font-bold">
                                            <span>{format(order.orderDate, 'PPP', { locale: es })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 sm:block sm:pt-0">
                                        <div className="font-bold text-gray-900">Orden #</div>
                                        <div className="sm:mt-1 text-indigo-700 font-bold">{order.orderNumber}</div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 sm:block sm:pt-0">
                                        <div className="font-bold text-gray-900">Monto total</div>
                                        <div className="sm:mt-1 text-pink-800 font-bold">RD$ {formatPrice(order.totalAmount)}</div>
                                    </div>
                                </div>

                                <Button
                                    //onClick={() => }
                                    className='bg-indigo-600 mt-6 text-base sm:text-sm flex w-full sm:w-fit'>
                                    Ver Factura
                                </Button>

                            </div>

                            <table className="mt-4 w-full text-gray-500 sm:mt-6">
                                <caption className="sr-only">Products</caption>
                                <thead className="sr-only text-left text-sm text-gray-800 sm:not-sr-only">
                                    <tr>
                                        <th scope="col" className="py-3 pl-3 pr-8 font-bold sm:w-2/5 lg:w-1/3">
                                            Producto
                                        </th>
                                        <th scope="col" className="hidden w-1/5 py-3 pr-8 font-bold sm:table-cell">
                                            Precio
                                        </th>
                                        <th scope="col" className="hidden py-3 pr-8 font-bold sm:table-cell">
                                            Cantidad
                                        </th>
                                        <th scope="col" className="hidden py-3 pr-8 font-bold sm:table-cell">
                                            Sistema Operativo
                                        </th>
                                        <th scope="col" className="w-0 py-3 font-bold">
                                            Info
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm sm:border-t">
                                    {order?.cartItems?.map((ci: Models.Document) => (
                                        <tr key={ci?.$id}>
                                            <td className="py-6 pl-3 pr-8">
                                                <div className="flex items-center">
                                                    <img
                                                        alt={ci?.product[0].name}
                                                        src={ci?.product[0].image}
                                                        className="mr-6 h-16 w-16 rounded object-cover object-center"
                                                    />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{ci?.product[0].name}</div>
                                                        <div className="mt-1 sm:hidden font-medium text-gray-900">RD$ {formatPrice(ci?.product[0].price)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">RD$ {formatPrice(ci?.product[0].price)}</td>
                                            <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">{ci?.quantity}</td>
                                            <td className="hidden font-medium text-gray-900 py-6 pr-8 sm:table-cell">{ci?.product[0].operating_system}</td>
                                            <td className="whitespace-nowrap py-6 pr-3 font-bold">
                                                <Link to={`/tienda/celulares/${ci?.product[0].$id}`} className="text-indigo-600 hover:text-pink-800">
                                                    Ver<span className="hidden lg:inline"> Producto</span>
                                                    <span className="sr-only">, {ci?.product[0].name}</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default OrdersPage