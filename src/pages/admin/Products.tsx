/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnDef } from "@tanstack/react-table";
import { randomCode } from 'generate-random-code';
import { Textarea } from "@/components/ui/textarea"
import { ID, Models } from 'appwrite';
import db from '@/appwrite/databases';
import upperCaseFunction from '@/customFunctions/upperCaseFunction';
import { cn } from '@/lib/utils';
import { storage } from '@/appwrite/config';
import PageHeader from '@/components/PageHeader';
import MyTable from '@/components/MyTable'
import { SquarePen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import {
    Card,
    CardContent,
    CardDescription,
    //CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatPrice } from '@/customFunctions/formatPrice';

const productFormSchema = z.object({
    name: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    description: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    price: z.coerce.number({ required_error: "Requerido" }).positive('Debe ser mayor a 0'),
    category: z.string({ required_error: "Requerido" }), //.min(1, { message: "Requerido" }),
    sub_category: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    operating_system: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    weight_unit: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    weight: z.coerce.number({ required_error: "Requerido" }).positive('Debe ser mayor a 0'),
    quantity: z.coerce.number({ required_error: "Requerido" }).positive('Debe ser mayor a 0'),
    sku: z.string({ required_error: "Requerido" }),
    status: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    deal: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    image: z.instanceof(File).refine((file) => file.size < 7000000, {
        message: 'La imagen debe ser menor a 7MB.',
    }).optional(),
})

const ProductsPage = () => {

    const [allTheProducts, setAllTheProducts] = useState<Models.Document[]>([]);
    const [allTheCategories, setAllTheCategories] = useState<Models.Document[]>([]);
    const [allTheSubCategories, setAllTheSubCategories] = useState<string[]>([]);
    const [isUpdateActive, setIsUpdateActive] = useState<boolean | undefined>(false);
    const [selectedProduct, setSelectedProduct] = useState<Models.Document | null>(null);
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const formToCreateProduct = useForm<z.infer<typeof productFormSchema>>({
        resolver: zodResolver(productFormSchema),
        mode: "onSubmit",
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: '',
            sub_category: '',
            operating_system: '',
            weight_unit: '',
            weight: 0,
            quantity: 0,
            sku: '',
            status: '',
            deal: '',
            image: undefined,
        },
    });

    const columns: ColumnDef<Models.Document[] | any>[] = [
        {
            accessorKey: "thePosition",
            header: "#",
            cell: ({ row }) => (
                <span className='font-medium'>{row.index + 1}</span>
            ),
        },
        {
            accessorKey: "image",
            header: "Imagen",
            cell: ({ row }) => (
                <img
                    alt="Imagen del Producto"
                    className="w-28 h-20 rounded-md object-cover"
                    src={row?.original?.image === '' ? '/placeholder.png' : row?.original?.image}
                />
            ),
        },
        {
            accessorKey: "name",
            header: "Producto",
            cell: ({ row }) => (
                <span className='font-bold text-xs'>{row?.original?.name}</span>
            ),
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
                // <Badge variant={row?.original?.status === 'DISPONIBLE' ? 'available' : 'destructive'}>
                //     <span className='text-xs'>{row?.original?.status}</span>
                // </Badge>
                <span className={cn(
                    row?.original?.status === 'DISPONIBLE' ? 'text-teal-600' : 'text-red-500',
                    'text-xs font-bold'
                )}>
                    {row?.original?.status}
                </span>
            ),
        },
        {
            accessorKey: "price",
            header: "Precio",
            cell: ({ row }) => (
                <span className='font-bold text-xs text-gray-800'>RD$ {formatPrice(row?.original?.price)}</span>
            ),
        },
        {
            accessorKey: "sales",
            header: "Ventas",
            cell: ({ row }) => (
                <span className='font-bold text-xs text-gray-800'>{row?.original?.sales}</span>
            ),
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
        setAllTheProducts(products.documents)
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

        setAllTheCategories(categoriesByName)
    }

    const handleCategoryChange = (e: string) => {
        const selectedCategory = allTheCategories?.find((category: any) => category?.$id === e);
        setAllTheSubCategories(selectedCategory?.sub_categories);
    };

    const getImage = async (file: File | undefined) => {
        setImage(await convertImageToBase64(file))
    }

    const convertImageToBase64 = (file: File | undefined) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            if (!file) {
                alert("Please select an image");
            } else {
                fileReader.readAsDataURL(file);
                fileReader.onload = () => {
                    resolve(fileReader.result);
                };
            }
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    async function createProduct(values: z.infer<typeof productFormSchema>) {

        setLoading(true)

        let myImageURL: string = '';
        let myImageFileId: string = '';

        if (values?.image) {

            const result = await storage.createFile(
                import.meta.env.VITE_APPWRITE_BUCKET_ID as string, // bucketId
                ID.unique(), // fileId
                values?.image as File, // file
            );

            myImageFileId = result?.$id

            const preview = await storage.getFileView(
                import.meta.env.VITE_APPWRITE_BUCKET_ID as string, // bucketId
                result?.$id, // fileId
            );

            myImageURL = preview?.href
        }

        const myProduct = {
            name: upperCaseFunction(values?.name),
            description: values?.description,
            price: values?.price,
            category: values?.category,
            sub_category: values?.sub_category,
            operating_system: values?.operating_system,
            weight_unit: values?.weight_unit,
            weight: values?.weight,
            quantity: values?.quantity,
            sku: 'SL' + randomCode(10, { numericOnly: true }),
            status: values?.status,
            deal: values?.deal,
            image_file_id: myImageFileId,
            image: myImageURL,
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
        formToCreateProduct?.setValue('operating_system', theProduct?.operating_system);
        formToCreateProduct?.setValue('weight_unit', theProduct?.weight_unit);
        formToCreateProduct?.setValue('weight', theProduct?.weight);
        formToCreateProduct?.setValue('quantity', theProduct?.quantity);
        formToCreateProduct?.setValue('deal', theProduct?.deal);
        formToCreateProduct?.setValue('status', theProduct?.status);

        setImage(theProduct?.image)
        setSelectedProduct(theProduct)
        setIsUpdateActive(true)
        setIsSheetOpened(true)
    }

    async function updateProduct(values: z.infer<typeof productFormSchema>) {

        setLoading(true)

        let myImageURL: string = selectedProduct?.image;
        let myImageFileId: string = '';

        if (values?.image) {

            const result = await storage.createFile(
                import.meta.env.VITE_APPWRITE_BUCKET_ID as string, // bucketId
                ID.unique(), // fileId
                values?.image as File, // file
            );

            myImageFileId = result?.$id

            const preview = await storage.getFileView(
                import.meta.env.VITE_APPWRITE_BUCKET_ID as string, // bucketId
                result?.$id, // fileId
            );

            myImageURL = preview?.href

            await storage.deleteFile(
                import.meta.env.VITE_APPWRITE_BUCKET_ID as string, // bucketId
                selectedProduct?.image_file_id, // fileId
            );
        }

        const myProduct = {
            name: upperCaseFunction(values?.name),
            description: values?.description,
            price: values?.price,
            category: values?.category,
            sub_category: values?.sub_category,
            operating_system: values?.operating_system,
            weight_unit: values?.weight_unit,
            weight: values?.weight,
            quantity: values?.quantity,
            deal: values?.deal,
            status: values?.status,
            image: myImageURL,
            image_file_id: myImageFileId,
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
        setIsSheetOpened(false)
        formToCreateProduct?.reset();
        setIsUpdateActive(false)
        setSelectedProduct(null)
        setImage(null)
        setLoading(false)
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
                                                    <Button type="submit" className='bg-indigo-600 hover:bg-black'>
                                                        {isUpdateActive ? loading ? 'Actualizando...' : 'Actualizar' : loading ? 'Agregando...' : 'Crear Producto'}
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
                                                                        <TableHead className='font-bold text-gray-700'>Cantidad</TableHead>
                                                                        <TableHead className='font-bold text-gray-700'>Precio</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    <TableRow className='hover:bg-transparent'>

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
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </CardContent>
                                                    </Card>

                                                    <div className='grid grid-cols-2 gap-4'>
                                                        <Card>
                                                            <CardHeader>
                                                                <CardTitle>Categoría</CardTitle>
                                                            </CardHeader>
                                                            <CardContent>
                                                                <div className="grid gap-4 sm:grid-cols-1">

                                                                    {/* CATEGORY */}
                                                                    <FormField
                                                                        control={formToCreateProduct?.control}
                                                                        name="category"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <Select onValueChange={(e) => [field.onChange(e), handleCategoryChange(e)]} defaultValue={field.value}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
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

                                                                    {/* SUB_CATEGORY */}
                                                                    <FormField
                                                                        control={formToCreateProduct?.control}
                                                                        name="sub_category"
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className='text-gray-900 font-bold'>Sub-Categoría</FormLabel>
                                                                                <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                                    <FormControl>
                                                                                        <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
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
                                                                <CardTitle>Sistema Operativo</CardTitle>
                                                            </CardHeader>
                                                            <CardContent>

                                                                {/* OPERATING SYSTEM */}
                                                                <FormField
                                                                    control={formToCreateProduct?.control}
                                                                    name="operating_system"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                                <FormControl>
                                                                                    <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                                        <SelectValue placeholder='Escoga el sistema operativo' />
                                                                                    </SelectTrigger>
                                                                                </FormControl>
                                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                    <SelectItem value="ANDROID">ANDROID</SelectItem>
                                                                                    <SelectItem value="IOS">IOS</SelectItem>
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

                                                <div className="grid auto-rows-max items-start gap-4">

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
                                                                                <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
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

                                                    <Card>
                                                        <CardHeader>
                                                            <CardTitle>Oferta</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>

                                                            {/* DEAL */}
                                                            <FormField
                                                                control={formToCreateProduct?.control}
                                                                name="deal"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                            <FormControl>
                                                                                <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                                    <SelectValue placeholder='¿Es una oferta?' />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                                <SelectItem value="false">NO</SelectItem>
                                                                                <SelectItem value="true">SI</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage className='text-red-800' />
                                                                    </FormItem>
                                                                )}
                                                            />
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
                                                                                    <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
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
                                                                            <FormLabel className='text-gray-900 font-bold'>Peso</FormLabel>
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


                                                    <Card className="overflow-hidden">
                                                        <CardHeader>
                                                            <CardTitle>Imagen</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>

                                                            {/* IMAGE */}
                                                            <FormField
                                                                control={formToCreateProduct.control}
                                                                name="image"
                                                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                                                    <div className="grid gap-2">
                                                                        <img
                                                                            alt="Imagen del Producto"
                                                                            className="w-full rounded-md object-cover"
                                                                            src={image ? image : '/placeholder.png'}
                                                                        />

                                                                        <FormItem>
                                                                            <FormLabel
                                                                                htmlFor='upload'
                                                                                className='cursor-pointer w-full bg-primary text-primary-foreground hover:bg-primary/90 
                                                                                h-10 px-4 py-2 text-gray-100 font-bold inline-flex items-center justify-center 
                                                                                whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors 
                                                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                                                                                focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
                                                                            >
                                                                                <Upload className="h-4 w-4 text-white mr-2" />
                                                                                Agregar imagen
                                                                            </FormLabel>
                                                                            <Input
                                                                                {...fieldProps}
                                                                                className='hidden'
                                                                                type="file"
                                                                                placeholder="Imagen"
                                                                                accept="image/*"
                                                                                id='upload'
                                                                                onChange={(event) =>
                                                                                    [
                                                                                        onChange(event.target.files && event.target.files[0]),
                                                                                        getImage(formToCreateProduct.getValues().image)
                                                                                    ]
                                                                                }
                                                                            />
                                                                        </FormItem>
                                                                    </div>
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
                                                    {isUpdateActive ? loading ? 'Actualizando...' : 'Actualizar' : loading ? 'Agregando...' : 'Crear Producto'}
                                                </Button>
                                            </div>
                                        </div>
                                    </main>
                                </form>
                            </Form>
                        </SheetContent>
                    </Sheet >

                </div >
            </div >

            {
                allTheProducts.length === 0 ?
                    (
                        <div className="flex flex-1 items-center justify-center rounded-lg">
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