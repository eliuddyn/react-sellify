/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import InputMask from "@mona-health/react-input-mask";
import { Models, Query } from 'appwrite';
import db from '@/appwrite/databases';
import upperCaseFunction from '@/customFunctions/upperCaseFunction';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import useDrProvinces from '@/hooks/useDrProvinces';
import { MunicipalDistrict, Municipality, Neighborhood, Province } from '@/types/myTypes';
import useSellifyStore from '@/store/user';

const addressFormSchema = z.object({
    alias: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    country: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    fullname: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    phone_number: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    province: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    municipality: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    municipal_district: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    neighborhood: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    street_type: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    street_name: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    street_number: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    zip_code: z.string({ required_error: "Requerido" }).min(1, { message: "Requerido" }),
    isDefault: z.boolean({ required_error: "Requerido" })

})

const CustomerAddressesPage = () => {

    const [allTheAddresses, setAllTheAddresses] = useState<Models.Document[] | null>(null);
    const [isUpdateActive, setIsUpdateActive] = useState<boolean | undefined>(false);
    const [selectedAddress, setSelectedAddress] = useState<Models.Document | null>(null);
    //const [selectedAddressToRemoveAsDefault, setSelectedAddressToRemoveAsDefault] = useState<Models.Document | null>(null);
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { allTheProvinces } = useDrProvinces()
    //const [allTheMunicipalities, setAllTheMunicipalities] = useState<Municipality[] | any>([]);
    //const [allTheMunicipalDistricts, setAllTheMunicipalDistricts] = useState<MunicipalDistrict[] | any>([]);
    //const [allTheNeighborhoods, setAllTheNeighborhoods] = useState<Neighborhood[] | any>([]);
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const [deletingAddressDialog, setDeletingAddressDialog] = useState<boolean>(false);
    const allTheMunicipalities = useSellifyStore((state) => state.allTheMunicipalities)
    const setAllTheMunicipalities = useSellifyStore((state) => state.setAllTheMunicipalities)
    const allTheMunicipalDistricts = useSellifyStore((state) => state.allTheMunicipalDistricts)
    const setAllTheMunicipalDistricts = useSellifyStore((state) => state.setAllTheMunicipalDistricts)
    const allTheNeighborhoods = useSellifyStore((state) => state.allTheNeighborhoods)
    const setAllTheNeighborhoods = useSellifyStore((state) => state.setAllTheNeighborhoods)

    const formToCreateAddress = useForm<z.infer<typeof addressFormSchema>>({
        resolver: zodResolver(addressFormSchema),
        mode: "onSubmit",
        defaultValues: {
            alias: '',
            fullname: '',
            phone_number: '',
            country: '',
            province: '',
            municipality: '',
            municipal_district: '',
            neighborhood: '',
            street_type: '',
            street_name: '',
            street_number: '',
            zip_code: '',
            isDefault: false,
        },
    });

    useEffect(() => {
        getAllAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllAddresses = async () => {
        const addresses = await db.addresses.list([
            Query.equal('customerID', customerInSession?.id as string)
        ]);

        let theDefaultAddress: any = null;
        let theOthersAddresses: Models.Document[] = [];

        addresses.documents?.forEach((address: Models.Document) => {
            if (address?.isDefault === true) {
                theDefaultAddress = address
            } else {
                theOthersAddresses.push(address)
            }
        });

        if (theDefaultAddress) {
            theOthersAddresses.unshift(theDefaultAddress)
        }

        setAllTheAddresses(theOthersAddresses)
    }

    const handleProvinceChange = async () => {
        const selectedProvince = await allTheProvinces?.find((prvnc: Province) => prvnc?.name === formToCreateAddress.getValues('province'));
        setAllTheMunicipalities(selectedProvince?.municipalities);
    };

    const handleMunicipalityChange = async () => {
        const selectedMunicipality = await allTheMunicipalities?.find((mncplty: Municipality) => mncplty?.municipalityName === formToCreateAddress.getValues('municipality'));
        setAllTheMunicipalDistricts(selectedMunicipality?.municipalDistricts ?? []);
    };

    const handleMunicipalDistrictChange = async () => {
        const selectedMunicipalDistrict = await allTheMunicipalDistricts?.find((munDist: MunicipalDistrict) => munDist?.municipalDistrictName === formToCreateAddress.getValues('municipal_district'));
        setAllTheNeighborhoods(selectedMunicipalDistrict?.neighborhoods ?? []);
    };

    async function createAddress(values: z.infer<typeof addressFormSchema>) {

        setLoading(true)

        const myAdress = {
            customerID: customerInSession?.id as string,
            alias: upperCaseFunction(values.alias),
            phone_number: values.phone_number,
            fullname: upperCaseFunction(values.fullname),
            country: values.country,
            province: values.province,
            municipality: values.municipality,
            municipal_district: values.municipal_district,
            neighborhood: values.neighborhood,
            street_type: upperCaseFunction(values.street_type),
            street_name: upperCaseFunction(values.street_name),
            street_number: upperCaseFunction(values.street_number),
            zip_code: upperCaseFunction(values.zip_code),
            isDefault: allTheAddresses && allTheAddresses?.length === 0 ? true : values.isDefault,
        }

        await db.addresses.create(myAdress)
            .then(async () => {
                await getAllAddresses()
                clearAddressForm()
            })
    }

    const fillDataToUpdateAddress = async (theAddress: Models.Document) => {

        formToCreateAddress?.setValue('province', theAddress?.province);
        await handleProvinceChange()
            .then(async () => {
                formToCreateAddress?.setValue('municipality', theAddress?.municipality);
                await handleMunicipalityChange()
                    .then(async () => {
                        formToCreateAddress?.setValue('municipal_district', theAddress?.municipal_district);
                        await handleMunicipalDistrictChange()
                            .then(() => {
                                formToCreateAddress?.setValue('neighborhood', theAddress?.neighborhood);
                            })
                    })
            })

        formToCreateAddress?.setValue('alias', theAddress?.alias);
        formToCreateAddress?.setValue('fullname', theAddress?.fullname);
        formToCreateAddress?.setValue('phone_number', theAddress?.phone_number);
        formToCreateAddress?.setValue('country', theAddress?.country);
        formToCreateAddress?.setValue('street_type', theAddress?.street_type);
        formToCreateAddress?.setValue('street_name', theAddress?.street_name);
        formToCreateAddress?.setValue('street_number', theAddress?.street_number);
        formToCreateAddress?.setValue('zip_code', theAddress?.zip_code);
        formToCreateAddress?.setValue('isDefault', theAddress?.isDefault);

        setIsUpdateActive(true)
        setSelectedAddress(theAddress)
        setIsSheetOpened(true)
    }

    async function updateAddress(values: z.infer<typeof addressFormSchema>) {

        setLoading(true)

        let theAlias: any = null
        let thePhoneNumber: any = null
        let theProvince: any = null
        let theMunicipality: any = null
        let theMunicipalDistrict: any = null
        let theNeighborhood: any = null
        let theStreetType: any = null
        let theStreetName: any = null
        let theStreetNumber: any = null
        let theZipCode: any = null
        let theIsDefault: any = null
        let selectedAddressToRemoveAsDefault: Models.Document | undefined;

        if (selectedAddress?.alias !== upperCaseFunction(values?.alias)) {
            theAlias = { alias: upperCaseFunction(values?.alias) }
        }

        if (selectedAddress?.phone_number !== values?.phone_number) {
            thePhoneNumber = { phone_number: values?.phone_number }
        }

        if (selectedAddress?.province !== upperCaseFunction(values?.province)) {
            theProvince = { province: upperCaseFunction(values?.province) }
        }

        if (selectedAddress?.municipality !== upperCaseFunction(values?.municipality)) {
            theMunicipality = { municipality: upperCaseFunction(values?.municipality) }
        }

        if (selectedAddress?.municipal_district !== upperCaseFunction(values?.municipal_district)) {
            theMunicipalDistrict = { municipal_district: upperCaseFunction(values?.municipal_district) }
        }

        if (selectedAddress?.neighborhood !== upperCaseFunction(values?.neighborhood)) {
            theNeighborhood = { neighborhood: upperCaseFunction(values?.neighborhood) }
        }

        if (selectedAddress?.street_type !== upperCaseFunction(values?.street_type)) {
            theStreetType = { street_type: upperCaseFunction(values?.street_type) }
        }
        if (selectedAddress?.street_name !== upperCaseFunction(values?.street_name)) {
            theStreetName = { street_name: upperCaseFunction(values?.street_name) }
        }
        if (selectedAddress?.street_number !== upperCaseFunction(values?.street_number)) {
            theStreetNumber = { street_number: upperCaseFunction(values?.street_number) }
        }
        if (selectedAddress?.zip_code !== upperCaseFunction(values?.zip_code)) {
            theZipCode = { zip_code: upperCaseFunction(values?.zip_code) }
        }
        if (selectedAddress?.isDefault !== values?.isDefault) {
            theIsDefault = { isDefault: values?.isDefault }
        }

        if (values?.isDefault === true) {
            selectedAddressToRemoveAsDefault = allTheAddresses?.find((address: Models.Document) => address?.isDefault === true)
        }

        const myAddress = {
            ...theAlias,
            ...thePhoneNumber,
            ...theProvince,
            ...theMunicipality,
            ...theMunicipalDistrict,
            ...theNeighborhood,
            ...theStreetType,
            ...theStreetName,
            ...theStreetNumber,
            ...theZipCode,
            ...theIsDefault,
        }

        try {
            await db.addresses.update(selectedAddress?.$id, myAddress)
                .then(async () => {

                    if (selectedAddressToRemoveAsDefault) {
                        await db.addresses.update(selectedAddressToRemoveAsDefault?.$id, { isDefault: false })
                            .then(async () => {
                                await getAllAddresses()
                                clearAddressForm()
                            })
                    } else {
                        await getAllAddresses()
                        clearAddressForm()
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }

    const fillAddressToDelete = (theAddress: Models.Document) => {
        setSelectedAddress(theAddress)
        setDeletingAddressDialog(true)
    }

    const deleteAddress = async (addressID: string | undefined) => {
        try {
            await db.addresses.delete(addressID)
                .then(async () => {

                    const theNextDefaultAddress = allTheAddresses?.find((address: Models.Document) => address?.$id !== addressID)

                    if (theNextDefaultAddress) {
                        if (!theNextDefaultAddress?.isDefault) {
                            await db.addresses.update(theNextDefaultAddress?.$id, { isDefault: true })
                                .then(async () => {
                                    await getAllAddresses()
                                        .then(async () => {
                                            clearAddressForm()
                                        })
                                })
                        } else {
                            await getAllAddresses()
                                .then(async () => {
                                    clearAddressForm()
                                })
                        }

                    } else {
                        await getAllAddresses()
                            .then(async () => {
                                clearAddressForm()
                            })
                    }
                })
        } catch (error) {
            console.log(error)
        }
    }

    const clearAddressForm = () => {
        setIsSheetOpened(false)
        formToCreateAddress?.reset();
        setIsUpdateActive(false)
        setSelectedAddress(null)
        setLoading(false)
    };

    if (!allTheAddresses) {
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
            <div className="mx-auto flex w-full px-4 py-4 sm:px-6 lg:px-8">

                <div className="w-full py-6 flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Mis Direcciones</h1>
                    <p className="mt-2 text-base text-gray-700 max-w-56 sm:max-w-full">
                        Las direcciones donde te llegarán tus pedidos.
                    </p>
                </div>

                <div className='sm:py-8'>
                    <div className="pt-4 flex items-center justify-end">
                        <div className="flex flex-shrink-0 md:ml-4 md:mt-0">

                            {/* ADDRESS FORM */}
                            <Sheet open={isSheetOpened} onOpenChange={setIsSheetOpened}>
                                <SheetTrigger asChild>
                                    <Button
                                        onClick={() => formToCreateAddress.setValue('fullname', customerInSession?.names + ' ' + customerInSession?.lastnames)}
                                        variant="default"
                                    >
                                        Agregar
                                    </Button>
                                </SheetTrigger>
                                <SheetContent
                                    onInteractOutside={event => event.preventDefault()}
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                    className='bg-slate-300 overflow-y-auto'
                                    side="right"
                                >
                                    <SheetHeader className='pt-4 pl-3 pb-3 bg-blue-950'>
                                        <SheetTitle className='text-gray-200 text-2xl text-center'>
                                            {isUpdateActive ?
                                                <span className='text-amber-400 text-xl'>{selectedAddress?.alias}</span>
                                                :
                                                'Agregar Dirección'
                                            }
                                        </SheetTitle>
                                        <SheetDescription className='text-gray-200 text-base text-center'>
                                            {isUpdateActive ? 'Actualiza esta dirección' : 'Agrega tu dirección'}
                                        </SheetDescription>
                                    </SheetHeader>
                                    <Form {...formToCreateAddress}>
                                        <form className='p-4' onSubmit={formToCreateAddress?.handleSubmit(isUpdateActive ? updateAddress : createAddress)}>

                                            <div className="grid sm:grid-cols-2 gap-4 items-center">

                                                {/* ALIAS */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="alias"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Alias de la dirección</FormLabel>
                                                            <FormControl>
                                                                <Input autoComplete='off' className='uppercase' {...field} />
                                                            </FormControl>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* PHONE NUMBER */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="phone_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Teléfono</FormLabel>
                                                            <FormControl>
                                                                <InputMask
                                                                    {...field}
                                                                    mask="999-999-9999"
                                                                    maskPlaceholder={null}
                                                                    type="text"
                                                                    className='flex h-10 w-full rounded-md border border-input bg-background dark:bg-slate-300 px-1.5 py-2 text-sm font-medium dark:text-gray-700 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
                                                                />
                                                            </FormControl>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className='sm:col-span-2'>
                                                    {/* FULLNAME */}
                                                    <FormField
                                                        control={formToCreateAddress?.control}
                                                        name="fullname"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className='text-gray-900 font-bold'>Nombre completo</FormLabel>
                                                                <FormControl>
                                                                    <Input disabled autoComplete='off' className='uppercase' {...field} />
                                                                </FormControl>
                                                                <FormMessage className='text-red-800' />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                {/* COUNTRY */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="country"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>País</FormLabel>
                                                            <Select onValueChange={(e) => { field.onChange(e), handleProvinceChange() }} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona el país' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    <SelectItem value="REPÚBLICA DOMINICANA">
                                                                        REPÚBLICA DOMINICANA
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* PROVINCE */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="province"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Provincia</FormLabel>
                                                            <Select onValueChange={(e) => { field.onChange(e), handleProvinceChange() }} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona una provincia' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    {allTheProvinces?.map((province: Province) => (
                                                                        <SelectItem
                                                                            key={province?.name}
                                                                            value={province?.name}
                                                                        >
                                                                            {province?.name}
                                                                        </SelectItem>
                                                                    ))}

                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* MUNICIPALITY */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="municipality"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Municipio</FormLabel>
                                                            <Select onValueChange={(e) => { field.onChange(e), handleMunicipalityChange() }} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona un municipio' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    {allTheMunicipalities?.map((municipality: Municipality) => (
                                                                        <SelectItem
                                                                            key={municipality?.municipalityName}
                                                                            value={municipality?.municipalityName}
                                                                        >
                                                                            {municipality?.municipalityName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* MUNICIPAL DISTRICT */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="municipal_district"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Distrito Municipal</FormLabel>
                                                            <Select onValueChange={(e) => { field.onChange(e), handleMunicipalDistrictChange() }} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona un distrito municipal' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    {allTheMunicipalDistricts?.map((municipalDistrict: MunicipalDistrict) => (
                                                                        <SelectItem
                                                                            key={municipalDistrict?.municipalDistrictName}
                                                                            value={municipalDistrict?.municipalDistrictName}
                                                                        >
                                                                            {municipalDistrict?.municipalDistrictName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* NEIGHBORHOOD*/}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="neighborhood"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Sector</FormLabel>
                                                            <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona un sector' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    {allTheNeighborhoods?.map((neighborhood: Neighborhood) => (
                                                                        <SelectItem
                                                                            key={neighborhood?.neighborhoodName}
                                                                            value={neighborhood?.neighborhoodName}
                                                                        >
                                                                            {neighborhood?.neighborhoodName}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* STREET TYPE */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="street_type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Tipo de vía</FormLabel>
                                                            <Select onValueChange={(e) => { field.onChange(e), handleProvinceChange() }} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full h-10 dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                        <SelectValue placeholder='Selecciona una opción' />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                                    <SelectItem value="CALLE">CALLE</SelectItem>
                                                                    <SelectItem value="AVENIDA">AVENIDA</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* STREET NAME */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="street_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Calle/Avenida</FormLabel>
                                                            <FormControl>
                                                                <Input className='uppercase font-medium' {...field} />
                                                            </FormControl>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* STREET NUMBER */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="street_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Casa/Apt #</FormLabel>
                                                            <FormControl>
                                                                <Input className='uppercase font-medium' {...field} />
                                                            </FormControl>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* ZIP CODE */}
                                                <FormField
                                                    control={formToCreateAddress?.control}
                                                    name="zip_code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className='text-gray-900 font-bold'>Código postal</FormLabel>
                                                            <FormControl>
                                                                <Input autoComplete='off' className='uppercase font-medium' {...field} />
                                                            </FormControl>
                                                            <FormMessage className='text-red-800' />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex items-top space-x-2">

                                                    {/* IS DEFAULT */}
                                                    <FormField
                                                        control={formToCreateAddress?.control}
                                                        name="isDefault"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Checkbox
                                                                        id='default'
                                                                        disabled={allTheAddresses && allTheAddresses?.length === 1 && allTheAddresses[0]?.isDefault === true ? true : false}
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className='text-red-800' />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="grid gap-1.5 leading-none">
                                                        <label
                                                            htmlFor="default"
                                                            className="text-sm font-medium leading-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            Esta será la dirección predeterminada
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>

                                            <div className='pt-8 grid grid-flow-col justify-stretch gap-4'>
                                                <SheetClose asChild>
                                                    <Button disabled={loading} type="button" className='bg-red-500 hover:bg-red-700 text-gray-100' onClick={clearAddressForm}>Cancelar</Button>
                                                </SheetClose>
                                                <Button type="submit" className='bg-gray-900 hover:bg-blue-600'>
                                                    {isUpdateActive ? loading ?
                                                        <>
                                                            <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                                </path>
                                                            </svg>
                                                            Actualizando...
                                                        </>
                                                        : 'Actualizar' : loading ?
                                                        <>
                                                            <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                                </path>
                                                            </svg>
                                                            Agregando...
                                                        </>
                                                        : 'Agregar dirección'}
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </SheetContent>
                            </Sheet >
                        </div >
                    </div >
                </div>
            </div>

            {/* <div className="grid grid-rows-[1fr] min-h-dvh"> */}
            <div className="min-h-dvh pb-10">
                {
                    allTheAddresses && allTheAddresses?.length === 0 ?
                        (
                            <div className="flex items-start justify-center pt-28">
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        No tienes direcciones
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Agrega una dirección y empieza a comprar.
                                    </p>
                                </div>
                            </div>
                        ) : (

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8 sm:pt-16 px-4 sm:px-6 lg:px-8">
                                {allTheAddresses && allTheAddresses.map((address: Models.Document) => (
                                    <Card key={address?.$id} className='w-full rounded-xl'>
                                        <CardHeader
                                            className={cn(
                                                address?.isDefault === true ? 'bg-teal-600 text-gray-100' : 'bg-slate-100 text-gray-800',
                                                "rounded-t-xl pb-2 text-center"
                                            )}
                                        >
                                            <CardTitle className='text-lg'>
                                                {address?.alias}
                                            </CardTitle>
                                            <CardDescription></CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-1">
                                            <div className="flex items-start text-gray-800 space-x-4 rounded-md p-0.5 transition-all">
                                                <div className="pt-5">
                                                    <p className="text-sm font-bold leading-none">{address?.fullname}</p>
                                                    <p className="pt-3 text-sm">
                                                        {address?.street_type === 'CALLE' ? 'C/' : 'AVE.'} {address?.street_name} #{address?.street_number}
                                                    </p>
                                                    <p className="text-sm">
                                                        {address?.neighborhood}
                                                    </p>
                                                    <p className="text-sm">
                                                        {address?.province}
                                                    </p>
                                                    <p className="text-sm">
                                                        {address?.country}
                                                    </p>
                                                    <p className="text-sm">
                                                        Código postal: {address?.zip_code}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-4 rounded-md p-0.5 text-accent-foreground transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold leading-none">Teléfono</p>
                                                    <p className="text-sm text-gray-800">
                                                        {address?.phone_number}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4 rounded-md p-0.5 text-accent-foreground transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold leading-none">Predeterminada</p>
                                                    <p className={cn(
                                                        address?.isDefault === true ? 'text-green-500' : 'text-red-600',
                                                        "text-sm font-bold"
                                                    )}
                                                    >
                                                        {address?.isDefault === true ? 'Sí' : 'No'}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-slate-100 p-3 justify-between">
                                            <Button
                                                variant="destructive"
                                                onClick={() => fillAddressToDelete(address)}
                                            >Eliminar
                                            </Button>
                                            <Button
                                                onClick={() => fillDataToUpdateAddress(address)}
                                            >Actualizar
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
            </div>

            {/* DELETEING ADDRESS ALERTDIALOG */}
            <AlertDialog open={deletingAddressDialog} onOpenChange={setDeletingAddressDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='flex items-center justify-center text-xl sm:text-2xl bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-purple-500'>{selectedAddress?.alias}</AlertDialogTitle>
                        <AlertDialogDescription className='flex flex-col text-base text-gray-900 text-center'>
                            <span className='text-base'>Se eliminará esta dirección.</span>

                            <span>
                                <span className='text-sm text-gray-700'>Debe seleccionar una dirección predeterminada o agregar una nueva.</span>
                            </span>

                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className='bg-gray-900 hover:bg-blue-900 text-gray-100 hover:text-gray-100'>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className='bg-red-500 hover:bg-red-700' onClick={() => deleteAddress(selectedAddress?.$id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CustomerAddressesPage