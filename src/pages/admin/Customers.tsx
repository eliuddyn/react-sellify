/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from '@/components/PageHeader';
import MyTable from '@/components/MyTable'
import { SquarePen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Models } from 'appwrite';
import db from '@/appwrite/databases';
import { cn } from '@/lib/utils';

const CustomersPage = () => {

    const [allTheCustomers, setAllTheCustomers] = useState<Models.Document[]>([]);

    const columns: ColumnDef<Models.Document[] | any>[] = [
        {
            accessorKey: "thePosition",
            header: "#",
            cell: ({ row }) => (
                <span className='font-medium'>{row.index + 1}</span>
            ),
        },
        // {
        //     accessorKey: "image",
        //     header: "Imagen",
        //     cell: ({ row }) => (
        //         <img
        //             alt="Imagen del Producto"
        //             className="w-28 h-20 rounded-md object-cover"
        //             src={row?.original?.image === '' ? '/placeholder.png' : row?.original?.image}
        //         />
        //     ),
        // },
        {
            accessorKey: "picture",
            header: "Foto",
            cell: ({ row }) => (
                <div className='flex items-center'>
                    <Avatar>
                        <AvatarImage src={row?.original?.picture ?? undefined} alt="Foto" />
                        <AvatarFallback className={cn(
                            row?.original?.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600',
                            'text-gray-100'
                        )}>
                            <span className='grid grid-cols-1 justify-items-center'>
                                {/* NAMES */}
                                <span className="text-sm">
                                    {row?.original?.names && row?.original?.names?.split(" ")?.map((name: string) =>
                                        <span key={name}>{name[0][0]}</span>
                                    )}
                                </span>

                                {/* LASTNAMES */}
                                <span className="text-sm">
                                    {row?.original?.lastnames && row?.original?.lastnames?.split(" ")?.map((lastname: string) =>
                                        <span key={lastname}>{lastname[0][0]}</span>
                                    )}
                                </span>
                            </span>
                        </AvatarFallback>
                    </Avatar>
                </div>
            ),
        },
        {
            accessorKey: "names",
            header: "Nombres",
            cell: ({ row }) => (
                <span className='font-bold text-xs'>{row?.original?.names}</span>
            ),
        },
        {
            accessorKey: "lastnames",
            header: "Apellidos",
            cell: ({ row }) => (
                <span className='font-bold text-xs'>{row?.original?.lastnames}</span>
            ),
        },
        {
            accessorKey: "gender",
            header: "Género",
            cell: ({ row }) => (
                <span className={cn(
                    row?.original?.gender === 'M' ? 'text-blue-600' : 'text-pink-600',
                    'text-xs font-bold'
                )}>
                    {row?.original?.gender}
                </span>
            ),
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className='font-bold text-xs'>{row?.original?.email}</span>
            ),
        },
        {
            accessorKey: "orders",
            header: "Órdenes",
            cell: ({ row }) => (
                <span className='font-bold text-xs text-teal-700'>{row?.original?.orders?.length}</span>
            ),
        },

        // {
        //     accessorKey: "gender",
        //     header: "Sexo",
        //     cell: ({ row }) => (
        //         <span className={classNames(
        //             row?.original?.gender === 'M' ? 'text-blue-600' : 'text-rose-500',
        //             'font-medium'
        //         )}>
        //             {row?.original?.gender}
        //         </span>
        //     ),
        // },
        {
            accessorKey: "actions",
            header: "Acciones",
            cell: () => (
                <div className='flex gap-3'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    className='rounded-lg h-8 w-8'
                                // onClick={() => { fillProductToUpdate(row?.original) }}
                                >
                                    <span><SquarePen className="h-6 w-6" /></span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    useEffect(() => {
        getAllCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllCustomers = async () => {

        const customers = await db.customers.list();
        //console.log(customers.documents)
        setAllTheCustomers(customers.documents)
    }

    return (
        <>
            <PageHeader pageName="Clientes" />

            {
                allTheCustomers.length === 0 ? (<div
                    className="flex flex-1 items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No tienes clientes todavía
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Llama la atención con buena publicidad mediante las redes sociales.
                        </p>
                    </div>
                </div>
                ) : (
                    <MyTable myData={allTheCustomers} myColumns={columns} rowsName={allTheCustomers?.length === 1 ? 'Cliente' : 'Clientes'} />
                )
            }
        </>
    )
}

export default CustomersPage