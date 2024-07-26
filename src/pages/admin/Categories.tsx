/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from "@tanstack/react-table";
import PageHeader from '@/lib/PageHeader'
import MyTable from '@/lib/MyTable'
import { SquarePen } from 'lucide-react';
import { Category, Product } from '@/types/myTypes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Trash2 } from "lucide-react"

import { Textarea } from "@/components/ui/textarea"

import upperCaseFunction from '@/customFunctions/upperCaseFunction';
import { databases } from '@/appwrite/config';
import { Models } from 'appwrite';
import db from '@/appwrite/databases';

const categoryFormSchema = z.object({
    name: z.string({ required_error: "Requerido" }).min(2, { message: "Mínimo 2 caracteres" }),
    sub_categories: z.string({ required_error: "Requerido" }).min(2, { message: "Mínimo 2 caracteres" })
})

const CategoriesPage = () => {

    const [allTheCategories, setAllTheCategories] = useState<Models.Document[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Models.Document | null>(null);
    const [selectedCategoryToDelete, setSelectedCategoryToDelete] = useState<Models.Document | null>(null);
    const [isUpdateActive, setIsUpdateActive] = useState<boolean | undefined>(false);
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);
    const [canBeDeletedDialog, setCanBeDeletedDialog] = useState<boolean>(false);
    const [canNotBeDeletedDialog, setCanNotBeDeletedDialog] = useState<boolean>(false);

    const formToCreateCategory = useForm<z.infer<typeof categoryFormSchema>>({
        resolver: zodResolver(categoryFormSchema),
        mode: "onSubmit",
        defaultValues: {
            name: '',
            sub_categories: ''
        },
    });

    const columns: ColumnDef<Models.Document[]>[] = [
        {
            accessorKey: "thePosition",
            header: "#",
            cell: ({ row }) => (
                <span className='font-medium'>{row.index + 1}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "Categoría",
        },
        {
            accessorKey: "sub_categories",
            header: "Categorías",
            cell: ({ row }) => (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className='cursor-pointer text-blue-700 font-bold'>Ver Sub-Categorias</span>
                        </TooltipTrigger>
                        <TooltipContent className='text-red-800 font-bold'>
                            {/* {row.original?.sub_categories?.join(', ')} */}
                            {row.original?.sub_categories?.map((subc: string) => (
                                <p key={subc}>{subc}</p>
                            ))}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ),
        },
        {
            accessorKey: "products",
            header: "Productos",
            cell: ({ row }) => (
                <span className='text-red-800 font-bold'>{row.original?.products?.length}</span>
            ),
        },
        {
            accessorKey: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className='flex gap-3'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    className='rounded-lg h-8 w-8'
                                    onClick={() => { fillCategoryToUpdate(row.original) }}
                                >
                                    <span><SquarePen className="h-6 w-6" /></span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className='rounded-lg h-8 w-8'
                                    onClick={() => fillCategoryToDelete(row?.original)}
                                    disabled={isUpdateActive}
                                >
                                    <span><Trash2 className="h-6 w-6" /></span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            ),
        },
    ];

    useEffect(() => {
        getAllCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllCategories = async () => {
        const categories = await db.categories.list();

        const categoriesByName = categories.documents;

        categoriesByName.sort(function (a: any, b: any) {
            if (a?.name < b?.name) {
                return -1;
            }
            if (a?.name > b?.name) {
                return 1;
            }
            return 0;
        });

        setAllTheCategories(categoriesByName)
    }

    async function createCategory(values: z.infer<typeof categoryFormSchema>) {

        const subCategories = values.sub_categories.split(',')

        const allTheSubCategories: string[] = []

        subCategories.forEach((subCategory: string) => {
            allTheSubCategories.push(subCategory.trim().toUpperCase());
        });

        const myCategory = {
            name: upperCaseFunction(values?.name),
            sub_categories: allTheSubCategories.sort()
        }

        try {
            const response = await db.categories.create(myCategory);
            setAllTheCategories((prev) => [response, ...prev])
            clearCategoryForm()

        } catch (error) {
            console.log(error)
        }

    }

    const fillCategoryToUpdate = (theCategory: any) => {

        let result: string = ''

        theCategory?.sub_categories?.forEach((subc: string, index: number, array: []) => {

            if (index === array.length - 1) {
                result += subc
            } else {
                result += subc + ', '
            }
        });

        formToCreateCategory?.setValue('name', theCategory?.name);
        formToCreateCategory?.setValue('sub_categories', result);

        setSelectedCategory(prev => prev = theCategory)
        setIsUpdateActive(prev => prev = true)
        setIsSheetOpened(prev => prev = true)
    }

    async function updateCategory(values: z.infer<typeof categoryFormSchema>) {

        const subCategories = values.sub_categories.split(',')

        const allTheSubCategories: string[] = []

        subCategories.forEach((subCategory: string) => {

            allTheSubCategories.push(subCategory.trim().toUpperCase());
        });

        const myCategory = {
            name: upperCaseFunction(values?.name),
            sub_categories: allTheSubCategories.sort()
        }
        try {
            await db.categories.update(selectedCategory?.$id, myCategory);
            getAllCategories()
            clearCategoryForm()
        } catch (error) {
            console.log(error)
        }
    }

    const fillCategoryToDelete = async (theCategory: any) => {

        // Check if this category has products attached 

        if (theCategory?.products?.length === 0) {
            setSelectedCategoryToDelete(prev => prev = theCategory)
            setCanBeDeletedDialog(prev => prev = true)
        } else {
            setSelectedCategoryToDelete(prev => prev = theCategory)
            setCanNotBeDeletedDialog(prev => prev = true)
        }
    }

    const deleteCategory = async (categoryID: string | undefined) => {

        await db.categories.delete(categoryID)
        getAllCategories()
        clearCategoryForm()
    }

    const clearCategoryForm = () => {
        setIsSheetOpened((prev) => prev = false)
        formToCreateCategory?.reset();
        setIsUpdateActive(prev => prev = false)
        setSelectedCategory(prev => prev = null)
        setCanNotBeDeletedDialog(prev => prev = false)
        setCanBeDeletedDialog(prev => prev = false)
        setSelectedCategoryToDelete(prev => prev = null)
    };

    return (
        <>

            <PageHeader pageName="Categorías" />

            <div className="pt-4 flex items-center justify-end">
                <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">

                    {/* CATEGORY FORM */}
                    <Sheet open={isSheetOpened} onOpenChange={setIsSheetOpened}>
                        <SheetTrigger asChild>
                            <Button variant="default">
                                Agregar Categoría
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            onInteractOutside={event => event.preventDefault()}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            className='bg-slate-300 dark:bg-gray-800 overflow-y-auto'
                            side="right"
                        >
                            <SheetHeader className='pt-4 pl-3 pb-3 bg-blue-950'>
                                <SheetTitle className='text-gray-200 text-2xl text-center'>
                                    {isUpdateActive ?
                                        <span className='text-amber-400 text-xl'>{selectedCategory?.name}</span>
                                        :
                                        'Agregar Categoría'
                                    }
                                </SheetTitle>
                                <SheetDescription className='text-gray-200 text-base text-center'>
                                    {isUpdateActive ? 'Actualiza categorías de la tienda' : 'Agrega categorías a la tienda'}
                                </SheetDescription>
                            </SheetHeader>
                            <Form {...formToCreateCategory}>
                                <form className='p-4' onSubmit={formToCreateCategory?.handleSubmit(isUpdateActive ? updateCategory : createCategory)}>

                                    <div className="grid gap-6">

                                        {/* NAME */}
                                        <FormField
                                            control={formToCreateCategory?.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-lg text-gray-900 font-bold'>Nombre</FormLabel>
                                                    <FormControl>
                                                        <Input autoComplete='off' className='uppercase font-medium' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-800' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* SUB-CATEGORIES */}
                                        <FormField
                                            control={formToCreateCategory?.control}
                                            name="sub_categories"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-lg text-gray-900 font-bold'>Sub-Categorías</FormLabel>
                                                    <div>Divididas por comas (,)</div>
                                                    <FormControl>
                                                        <Textarea
                                                            autoComplete='off'
                                                            className="resize-none min-h-32 uppercase"
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
                                            <Button type="button" className='bg-rose-400 hover:bg-rose-500 text-gray-100 dark:text-gray-100' onClick={clearCategoryForm}>Cancelar</Button>
                                        </SheetClose>
                                        <Button type="submit">
                                            {isUpdateActive ? 'Actualizar' : 'Crear Categoría'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </SheetContent>
                    </Sheet>

                </div>
            </div >

            {
                allTheCategories.length === 0 ? (<div
                    className="flex flex-1 items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No tienes categorías
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Agrega una categorías y empieza a construir tu tienda.
                        </p>
                    </div>
                </div>
                ) : (
                    <MyTable myData={allTheCategories} myColumns={columns} rowsName={allTheCategories?.length === 1 ? 'Categoría' : 'Categorías'} />
                )
            }

            {/* CANNOT BE DELETED ALERT DIALOG */}
            <AlertDialog open={canNotBeDeletedDialog} onOpenChange={setCanNotBeDeletedDialog}>
                <AlertDialogContent className=''>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-2xl text-red-700 text-center'>{selectedCategoryToDelete?.name}</AlertDialogTitle>
                        <AlertDialogDescription className='text-base text-gray-900 text-center'>
                            No se puede eliminar esta categoría, porque hay productos que dependen de ella.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='bg-gray-900 hover:bg-blue-900 text-gray-100 hover:text-gray-100'>Entendido</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* CAN BE DELETED ALERTDIALOG */}
            <AlertDialog open={canBeDeletedDialog} onOpenChange={setCanBeDeletedDialog}>
                <AlertDialogContent className=''>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-2xl text-red-700 text-center'>{selectedCategoryToDelete?.name}</AlertDialogTitle>
                        <AlertDialogDescription className='flex flex-col text-base text-gray-900 text-center'>
                            <span className='text-base font-bold'>Se eliminará esta categoría y todas estas Sub-Categorías:</span>

                            <span>
                                <span className='text-sm text-red-800 font-bold'>{selectedCategoryToDelete?.sub_categories?.join(', ')}</span>
                            </span>

                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='bg-gray-900 hover:bg-blue-900 text-gray-100 hover:text-gray-100'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className='bg-red-500 hover:bg-red-700' onClick={() => deleteCategory(selectedCategoryToDelete?.$id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CategoriesPage