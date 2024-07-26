/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from "@tanstack/react-table";
import { randomCode } from 'generate-random-code';
import PageHeader from '@/lib/PageHeader'
import MyTable from '@/lib/MyTable'
import { SquarePen } from 'lucide-react';
import { Product } from '@/types/myTypes';
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
import { Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Models } from 'appwrite';
import db from '@/appwrite/databases';
import upperCaseFunction from '@/customFunctions/upperCaseFunction';
import { cn } from '@/lib/utils';

const productFormSchema = z.object({
    name: z.string({ required_error: "Requerido" }).min(2, { message: "Mínimo 2 caracteres" }),
    description: z.string({ required_error: "Requerido" }).min(2, { message: "Mínimo 2 caracteres" }),
    price: z.coerce.number({ required_error: "Requerido" }).positive(),
    category: z.string({ required_error: "Requerido" }),
    sub_category: z.string({ required_error: "Requerido" }).min(2, { message: "Mínimo 2 caracteres" }),
    size: z.string().optional(),
    weight_unit: z.string().optional(),
    weight: z.coerce.number({ required_error: "Requerido" }).positive(),
    quantity: z.coerce.number({ required_error: "Requerido" }).positive(),
    sku: z.string({ required_error: "Requerido" }),
    status: z.string({ required_error: "Requerido" }),
    image: z.string().optional(),
})

const ProductsPage = () => {

    const [allTheProducts, setAllTheProducts] = useState<Models.Document[]>([]);
    const [allTheCategories, setAllTheCategories] = useState<Models.Document[]>([]);
    const [allTheSubCategories, setAllTheSubCategories] = useState<string[]>([]);
    const [isUpdateActive, setIsUpdateActive] = useState<boolean | undefined>(false);
    const [selectedProduct, setSelectedProduct] = useState<Models.Document | null>(null);
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);

    const formToCreateProduct = useForm<z.infer<typeof productFormSchema>>({
        resolver: zodResolver(productFormSchema),
        mode: "onSubmit",
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            sub_category: '',
            size: 'n/a',
            weight_unit: '',
            weight: 0,
            quantity: 0,
            sku: '',
            status: '',
            image: '',
        },
    });

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "thePosition",
            header: "#",
            cell: ({ row }) => (
                <span className='font-medium'>{row.index + 1}</span>
            ),
        },
        {
            accessorKey: "name",
            header: "Producto",
        },
        {
            accessorKey: "status",
            header: "Estado",
        },
        {
            accessorKey: "price",
            header: "Precio",
        },
        {
            accessorKey: "sales",
            header: "Ventas",
        },
        {
            accessorKey: "sku",
            header: "SKU",
            cell: ({ row }) => (
                <span className='text-blue-600 font-bold'>
                    {row?.original?.sku}
                </span>
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
            cell: ({ row }) => (
                <div className='flex gap-3'>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="default"
                                    className='rounded-lg h-8 w-8'
                                    onClick={() => { fillProductToUpdate(row?.original) }}
                                >
                                    <span><SquarePen className="h-6 w-6" /></span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Editar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className='rounded-lg h-8 w-8'
                                //onClick={() => fillRoleToDelete(row?.original)}
                                //disabled={isUpdateActive}
                                >
                                    <span><HiOutlineTrash className="h-6 w-6" /></span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Eliminar</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> */}
                </div>
            ),
        },
    ];

    useEffect(() => {
        getAllProducts();
        getAllCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllProducts = async () => {

        const products = await db.products.list();
        //console.log(products.documents)
        setAllTheProducts(prev => prev = products.documents)

    }

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

        //console.log(categoriesByName)

        setAllTheCategories(categoriesByName)
    }

    const handleCategoryChange = (e: string) => {
        const selectedCategory = allTheCategories?.find((category: any) => category?.$id === e);
        setAllTheSubCategories(prev => prev = selectedCategory?.sub_categories);
    };

    async function createProduct(values: z.infer<typeof productFormSchema>) {

        //console.log(values)

        const myProduct = {
            name: upperCaseFunction(values?.name),
            description: values?.description,
            price: values?.price,
            category: values?.category,
            sub_category: values?.sub_category,
            size: values?.size,
            weight_unit: values?.weight_unit,
            weight: values?.weight,
            quantity: values?.quantity,
            sku: 'SL' + randomCode(10, { numericOnly: true }),
            status: values?.status,
            image: values?.image,
            created_at: new Date()
        }

        try {
            const response = await db.products.create(myProduct);
            setAllTheProducts((prev) => [response, ...prev])
            clearProductForm()

        } catch (error) {
            console.log(error)
        }
    }

    const fillProductToUpdate = (theProduct: any) => {

        handleCategoryChange(theProduct?.category?.$id)

        formToCreateProduct?.setValue('name', theProduct?.name);
        formToCreateProduct?.setValue('description', theProduct?.description);
        formToCreateProduct?.setValue('price', theProduct?.price);
        formToCreateProduct?.setValue('category', theProduct?.category?.$id, { shouldValidate: true });
        formToCreateProduct?.setValue('sub_category', theProduct?.sub_category, { shouldValidate: true });
        formToCreateProduct?.setValue('size', theProduct?.size);
        formToCreateProduct?.setValue('weight_unit', theProduct?.weight_unit);
        formToCreateProduct?.setValue('weight', theProduct?.weight);
        formToCreateProduct?.setValue('quantity', theProduct?.quantity);
        formToCreateProduct?.setValue('status', theProduct?.status);
        formToCreateProduct?.setValue('image', theProduct?.image ? theProduct?.image : '');

        setSelectedProduct(prev => prev = theProduct)
        setIsUpdateActive(prev => prev = true)
        setIsSheetOpened(prev => prev = true)
    }

    async function updateProduct(values: z.infer<typeof productFormSchema>) {

        const myProduct = {
            name: upperCaseFunction(values?.name),
            description: values?.description,
            price: values?.price,
            category: values?.category,
            sub_category: values?.sub_category,
            size: values?.size,
            weight_unit: values?.weight_unit,
            weight: values?.weight,
            quantity: values?.quantity,
            status: values?.status,
            image: values?.image
        }

        try {
            await db.products.update(selectedProduct?.$id, myProduct);
            getAllProducts()
            clearProductForm()
        } catch (error) {
            console.log(error)
        }
    }

    const clearProductForm = () => {
        setIsSheetOpened(prev => prev = false)
        formToCreateProduct?.reset();
        setIsUpdateActive(prev => prev = false)
        setSelectedProduct(prev => prev = null)
    };

    return (
        <>
            <PageHeader pageName="Productos" />

            <div className="pt-4 flex items-center justify-end">
                <div className="mt-4 flex flex-shrink-0 md:ml-4 md:mt-0">

                    {/* PRODUCT FORM */}
                    <Sheet open={isSheetOpened} onOpenChange={setIsSheetOpened}>
                        <SheetTrigger asChild>
                            <Button variant="default">
                                Agregar
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            onInteractOutside={event => event.preventDefault()}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            className='bg-slate-300 overflow-y-auto'
                            side="full"
                        >
                            <SheetHeader className='pt-4 pl-3 pb-3 bg-blue-950'>
                                <SheetTitle className='text-gray-200 text-2xl text-center'>
                                    {isUpdateActive ?
                                        <span className='text-amber-400 text-xl'>{selectedProduct?.name}</span>
                                        :
                                        'Agregar Producto'
                                    }
                                </SheetTitle>
                                <SheetDescription className='text-gray-200 text-base text-center'>
                                    {isUpdateActive ? 'Actualiza productos de la plataforma.' : 'Agrega productos a la plataforma.'}
                                </SheetDescription>
                            </SheetHeader>
                            <Form {...formToCreateProduct}>
                                <form className='p-4' onSubmit={formToCreateProduct?.handleSubmit(isUpdateActive ? updateProduct : createProduct)}>

                                    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                                        <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">

                                            <div className="flex items-center gap-4">

                                                {selectedProduct && (
                                                    <>
                                                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                                            {selectedProduct?.name}
                                                        </h1>
                                                        <Badge variant="outline" className={cn(
                                                            selectedProduct?.status === 'DISPONIBLE' ? 'bg-green-600' : 'bg-red-700',
                                                            "ml-auto sm:ml-0 text-gray-100")}>
                                                            {selectedProduct?.status}
                                                        </Badge>
                                                    </>

                                                )}

                                                <div className="hidden items-center gap-2 md:ml-auto md:flex">

                                                    <SheetClose asChild>
                                                        <Button type="button" className='bg-red-500 hover:bg-red-700 text-gray-100' onClick={clearProductForm}>Cancelar</Button>
                                                    </SheetClose>
                                                    <Button type="submit" variant='default'>
                                                        {isUpdateActive ? 'Actualizar' : 'Crear Producto'}
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3">
                                                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Detalles</CardTitle>
                                                            <CardDescription>
                                                                Describe tu producto
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid gap-6">

                                                                {/* NAME */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="name"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='text-gray-900 font-bold'>Nombre</FormLabel>
                                                                            <FormControl>
                                                                                <Input autoComplete='off' className='uppercase font-medium' {...field} />
                                                                            </FormControl>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* DESCRIPTION */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="description"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='text-gray-900 font-bold'>Descripción</FormLabel>
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

                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Inventario</CardTitle>
                                                            <CardDescription>
                                                                Especifica las cantidades, variaciones y precio de tu producto
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <Table className='overflow-x-auto'>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className='w-20 font-bold text-gray-700'>Cantidad</TableHead>
                                                                        <TableHead className='w-20 font-bold text-gray-700'>Precio</TableHead>
                                                                        <TableHead className='w-20 font-bold text-gray-700'>Size</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    <TableRow>

                                                                        <TableCell>

                                                                            {/* QUANTITY */}
                                                                            <FormField
                                                                                control={formToCreateProduct?.control}
                                                                                name="quantity"
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input className='font-medium' {...field} />
                                                                                        </FormControl>
                                                                                        <FormMessage className='text-red-800' />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>

                                                                            {/* PRICE */}
                                                                            <FormField
                                                                                control={formToCreateProduct?.control}
                                                                                name="price"
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <Input className='font-medium' {...field} />
                                                                                        </FormControl>
                                                                                        <FormMessage className='text-red-800' />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>

                                                                        <TableCell>

                                                                            {/* SIZE */}
                                                                            <FormField
                                                                                control={formToCreateProduct?.control}
                                                                                name="size"
                                                                                render={({ field }) => (
                                                                                    <FormItem>
                                                                                        <FormControl>
                                                                                            <ToggleGroup
                                                                                                {...field}
                                                                                                type="single"
                                                                                                size={"lg"}
                                                                                                variant="outline"
                                                                                                className='grid grid-cols-4 gap-x-4 gap-y-2'
                                                                                            >
                                                                                                <ToggleGroupItem value="n/a">N/A</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="s">S</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="m">M</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="l">L</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="xl">XL</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="2xl">2XL</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="3xl">3XL</ToggleGroupItem>
                                                                                                <ToggleGroupItem value="4xl">4XL</ToggleGroupItem>
                                                                                            </ToggleGroup>
                                                                                        </FormControl>
                                                                                        <FormMessage className='text-red-800' />
                                                                                    </FormItem>
                                                                                )}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </CardContent>
                                                    </Card>

                                                </div>

                                                <div className="grid auto-rows-max items-start gap-4">

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Categoría</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="grid gap-4 sm:grid-cols-1">

                                                                {/* CATERORY */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="category"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <Select onValueChange={(e) => [field.onChange(e), handleCategoryChange(e)]} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300 focus-visible:ring-teal-600">
                                                                                        <SelectValue placeholder='Selecciona una categoría' />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                    {allTheCategories?.map((category: Models.Document) => (
                                                                                        <SelectItem
                                                                                            key={category.$id}
                                                                                            value={category.$id}
                                                                                        >
                                                                                            {category.name}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* SUB_CATERORY */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="sub_category"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='text-gray-900 font-bold'>Sub-Categoría</FormLabel>
                                                                            <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300 focus-visible:ring-teal-600">
                                                                                        <SelectValue placeholder='Selecciona una sub-categoría' />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                    {allTheSubCategories?.map((subc: string) => (
                                                                                        <SelectItem
                                                                                            key={subc}
                                                                                            value={subc}
                                                                                        >
                                                                                            {subc}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        </CardContent>
                                                    </Card>


                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Peso</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>

                                                            <div className="grid gap-4 sm:grid-cols-1">

                                                                {/* WEIGHT UNIT*/}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="weight_unit"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='text-gray-900 font-bold'>Unidad</FormLabel>
                                                                            <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300 focus-visible:ring-teal-600">
                                                                                        <SelectValue placeholder='Selecciona la unidad' />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                    <SelectItem value="LB">LIBRAS</SelectItem>
                                                                                    <SelectItem value="KG">KILOGRAMOS</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />

                                                                {/* WEIGHT */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="weight"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className='dark:text-gray-100'>Peso</FormLabel>
                                                                            <FormControl>
                                                                                <Input className='uppercase font-medium' {...field} />
                                                                            </FormControl>
                                                                            <FormMessage className='text-red-800' />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>

                                                        </CardContent>
                                                    </Card>


                                                    <Card
                                                        className="overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle>Imagen</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>

                                                            {/* IMAGE */}
                                                            <FormField
                                                                control={formToCreateProduct?.control}
                                                                name="image"
                                                                render={({ field }) => (
                                                                    <div className="grid gap-2">
                                                                        <img
                                                                            alt="Product image"
                                                                            className="w-full rounded-md object-cover border border-dashed"
                                                                            width="300"
                                                                            height="200"
                                                                            src="/placeholder.svg"
                                                                        />
                                                                        <div className="grid gap-2">
                                                                            <Button className='flex items-center justify-center gap-2'>
                                                                                <Upload className="h-4 w-4 text-white" />
                                                                                <span className="sr-only">Subir</span>
                                                                                Agregar imagen
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            />

                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Estado</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>

                                                            {/* STATUS */}
                                                            <FormField
                                                                control={formToCreateProduct?.control}
                                                                name="status"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300 focus-visible:ring-teal-600">
                                                                                    <SelectValue placeholder='Selecciona el estado' />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                <SelectItem value="DISPONIBLE">DISPONIBLE</SelectItem>
                                                                                <SelectItem value="NO DISPONIBLE">NO DISPONIBLE</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage className='text-red-800' />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </CardContent>
                                                    </Card>

                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 md:hidden">
                                                <SheetClose asChild>
                                                    <Button type="button" className='bg-red-500 hover:bg-rose-700 text-gray-100 dark:text-gray-100' onClick={clearProductForm}>Cancelar</Button>
                                                </SheetClose>
                                                <Button type="submit" variant='default'>
                                                    {isUpdateActive ? 'Actualizar' : 'Crear Producto'}
                                                </Button>
                                            </div>
                                        </div>
                                    </main>
                                </form>
                            </Form>
                        </SheetContent>
                    </Sheet>

                </div>
            </div >

            {
                allTheProducts.length === 0 ? (<div
                    className="flex flex-1 items-center justify-center rounded-lg">
                    <div className="flex flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl font-bold tracking-tight">
                            No tienes productos
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Agrega un producto y empieza a vender.
                        </p>
                    </div>
                </div>
                ) : (
                    <MyTable myData={allTheProducts} myColumns={columns} rowsName={allTheProducts?.length === 1 ? 'Producto' : 'Productos'} />
                )
            }

        </>
    )
}

export default ProductsPage