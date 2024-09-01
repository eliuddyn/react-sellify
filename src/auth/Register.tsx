/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import upperCaseFunction from '@/customFunctions/upperCaseFunction';
import { account } from '@/appwrite/config';
import { ID } from 'appwrite';
import useSellifyStore from '@/store/user';
import db from '@/appwrite/databases';

const RegisterSchema = z.object({
    names: z.string({ required_error: "Requerido" }).min(2, '2 caracteres mínimo'),
    lastnames: z.string({ required_error: "Requerido" }).min(2, '2 caracteres mínimo'),
    gender: z.string({ required_error: "Requerido" }).min(1, '1 caracteres mínimo'),
    email: z.string({ required_error: "Requerido" }).email({ message: "Correo inválido" }),
    password: z.string({ required_error: "Requerido" }).min(8, '8 caracteres mínimo'),
})

const genderList = [
    { name: 'MASCULINO', value: 'M' },
    { name: 'FEMENINO', value: 'F' },
]

const RegisterPage = () => {

    const navigate = useNavigate();
    const setUserSession = useSellifyStore((state) => state.setUserSession)
    const [loading, setLoading] = useState<boolean>(false);
    const [isValidCredentials, setIsValidCredentials] = useState<boolean>(false);
    const [theGenders, setTheGenders] = useState<any>([]);

    const userRegisterForm = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        mode: "onSubmit",
        defaultValues: {
            names: '',
            lastnames: '',
            gender: '',
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        setTheGenders(genderList)
    }, [])


    async function registerUser(values: z.infer<typeof RegisterSchema>) {

        setLoading(true);

        let myAppUserId: string = '';

        const myCustomer = {
            names: upperCaseFunction(values?.names),
            lastnames: upperCaseFunction(values?.lastnames),
            gender: upperCaseFunction(values?.gender),
            email: values?.email,
            password: values?.password
        }

        try {
            const result = await account.create(
                ID.unique(),
                myCustomer.email,
                myCustomer.password,
                myCustomer.names + ' ' + myCustomer.lastnames
            );

            myAppUserId = result?.$id;

            const promise = account.createEmailPasswordSession(myCustomer.email, myCustomer.password);

            //create customer on stripe

            promise.then(async () => {

                //create customer on stripe
                const myStripeCustomer = {
                    customerName: upperCaseFunction(values?.names) + ' ' + upperCaseFunction(values?.lastnames),
                    customerEmail: values?.email,
                }

                try {

                    await fetch('https://66b94e60ecb482096469.appwrite.global/create_customer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(myStripeCustomer)
                    })
                        .then(async (res) => {
                            const data = await res.json()

                            const myCustomer2 = {
                                names: upperCaseFunction(values?.names),
                                lastnames: upperCaseFunction(values?.lastnames),
                                gender: upperCaseFunction(values?.gender),
                                email: values?.email,
                                app_user_ID: myAppUserId,
                                stripe_customer_ID: data?.stripeCustomerID
                            }

                            const newCustomerCreated = await db.customers.create(myCustomer2);

                            await account.updatePrefs({ role: 'Customer', customerDBCollectionID: newCustomerCreated?.$id as string });
                        })

                } catch (error) {
                    console.log(error)
                }

                setLoading(false);
                logoutUser()

            }, function (error) {
                setLoading(false);
                console.log(error);

            });

            userRegisterForm.reset()

            const maleAddedDescription = 'Cliente registrado exitosamente.';
            const femaleAddedDescription = 'Cliente registrada exitosamente.';

            toast(`${myCustomer?.names} ${myCustomer?.lastnames}`, {
                description: myCustomer?.gender === 'M' ? maleAddedDescription : femaleAddedDescription
            })

            setTimeout(() => {
                navigate('/login')
            }, 2000);

        } catch (error) {
            console.log(error)
        }
    }

    const logoutUser = async () => {
        await account.deleteSession('current')
        setUserSession(null);
    }

    return (

        <>
            <div className='grid grid-rows-[1fr] min-h-dvh'>
                <div className="bg-gradient-to-b from-[#f5576c] to-[#d57eeb] h-full flex items-center justify-center sm:items-start sm:pt-32 px-4 ">
                    <Card className="mx-auto w-96 sm:w-[500px]">
                        <CardHeader className='flex items-center justify-center px-2 pb-4 pt-4'>

                            <img
                                className="mx-auto rounded-xl"
                                width={100}
                                height={100}
                                src="/logo.png"
                                alt="Logo"
                            />

                            <CardTitle className="text-3xl pt-4">Regístrate</CardTitle>
                            <CardDescription>
                                Ingresa tu información para crear una cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...userRegisterForm}>
                                <form onSubmit={userRegisterForm.handleSubmit(registerUser)}>

                                    <div className="grid grid-cols-1 gap-3">

                                        {/* NAMES */}
                                        <FormField
                                            control={userRegisterForm.control}
                                            name="names"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Nombres</FormLabel>
                                                    <FormControl>
                                                        <Input type='text' className='font-medium text-base uppercase focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700 text-xs flex items-center justify-end' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* LASTNAMES */}
                                        <FormField
                                            control={userRegisterForm.control}
                                            name="lastnames"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Apellidos</FormLabel>
                                                    <FormControl>
                                                        <Input type='text' className='font-medium text-base uppercase focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700 text-xs flex items-center justify-end' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* GENDER */}
                                        <FormField
                                            control={userRegisterForm?.control}
                                            name="gender"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Género</FormLabel>
                                                    <Select onValueChange={(e) => field.onChange(e)} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full h-10 font-medium dark:text-gray-700 bg-background dark:bg-slate-300">
                                                                <SelectValue placeholder='Selecciona tu género' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="max-h-[--radix-select-content-available-height]">
                                                            {theGenders.map((gender: any) => (
                                                                <SelectItem key={gender?.value as string} value={gender?.value as string}>
                                                                    {gender?.name as string}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className='text-red-800' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* EMAIL */}
                                        <FormField
                                            control={userRegisterForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Correo</FormLabel>
                                                    <FormControl>
                                                        <Input type='email' className='font-medium text-base focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700 text-xs flex items-center justify-end' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* PASSWORD */}
                                        <FormField
                                            control={userRegisterForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type='password' className='font-medium text-base focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700 text-xs flex items-center justify-end' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='pt-4 grid grid-flow-col justify-strech gap-4'>
                                        <Button type="submit" className='bg-[#143a63] hover:bg-blue-700 text-lg'>

                                            {loading ?
                                                <>
                                                    <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                        </path>
                                                    </svg>
                                                    Registrando...
                                                </>
                                                :
                                                'Registrarse'
                                            }
                                        </Button>
                                    </div>

                                </form>
                            </Form>

                            <div className="mt-4 text-center text-sm">
                                ¿Ya tienes una cuenta?{" "}
                                <Link to="/login" className="text-red-700 hover:text-red-900 underline font-bold">
                                    Inicia sesión
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* INVALID CREDENTIALS ALERT DIALOG */}
            <AlertDialog open={isValidCredentials} onOpenChange={setIsValidCredentials}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-red-700 text-xl sm:text-2xl'>Credenciales Incorrectas!</AlertDialogTitle>
                        <AlertDialogDescription className='text-base font-medium text-gray-900'>
                            Verifique sus credenciales para acceder a la plataforma.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>

                        <AlertDialogCancel className='bg-[#143a63] hover:bg-black text-gray-100 hover:text-gray-100'>
                            Entendido
                        </AlertDialogCancel>

                        {/* <AlertDialogAction className='bg-red-500' onClick={() => deleteDepartment(departmentToDelete?.id)}>Eliminar</AlertDialogAction> */}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default RegisterPage