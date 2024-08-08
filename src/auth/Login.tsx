/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { account } from '@/appwrite/config';
import useSellifyStore from '@/store/user';
import db from '@/appwrite/databases';
import { Query } from 'appwrite';
import { Customer } from '@/types/myTypes';

const LoginSchema = z.object({
    email: z.string({ required_error: "Requerido" }).email({ message: "Correo inválido" }),
    password: z.string({ required_error: "Requerido" }),
})

const LoginPage = () => {

    const navigate = useNavigate()
    const [loading, setLoading] = useState<boolean>(false);
    const [isValidCredentials, setIsValidCredentials] = useState<boolean>(false);

    const setUserSession = useSellifyStore((state) => state.setUserSession)
    const setCustomerInSession = useSellifyStore((state) => state.setCustomerInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)

    const userLoginForm = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        mode: "onSubmit",
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const logoutUser = async () => {
        userLoginForm?.setValue('email', '')
        userLoginForm?.setValue('password', '')
        await account.deleteSession('current')
        setUserSession(null);
        setCustomerInSession(null);
        setCustomerCartItemsInSession(null, 'logout')
        localStorage.removeItem('slUserRole')
        navigate('/')
    }

    const addUserToInputs = (role: string) => {

        if (role === 'ADMIN') {
            userLoginForm?.setValue('email', '2019-0013@unad.edu.do')
            userLoginForm?.setValue('password', '12345678')
        }

        if (role === 'CLIENTE 1') {
            userLoginForm?.setValue('email', 'luisf1828@gmail.com')
            userLoginForm?.setValue('password', '12345678')
        }

        if (role === 'CLIENTE 2') {
            userLoginForm?.setValue('email', 'amdcore@hotmail.com')
            userLoginForm?.setValue('password', '12345678')
        }

        if (role === 'DELETE') {
            userLoginForm?.setValue('email', '')
            userLoginForm?.setValue('password', '')
        }
    }

    async function loginTheUser(values: z.infer<typeof LoginSchema>) {

        setLoading(true);

        const promise = account.createEmailPasswordSession(values.email, values.password);

        promise.then(async () => {

            const { prefs } = await account.get()

            localStorage.setItem('slUserRole', prefs?.role as string);

            if (prefs?.role as string === 'Customer') {

                const singleCustomer = await db.customers.get(prefs?.customerDBCollectionID as string);

                const cartItems = await db.cartItems.list([
                    Query.equal('customer', singleCustomer?.$id as string),
                    Query.equal("purchased", "NO")
                ]);

                const myCustomer: Customer = {
                    id: singleCustomer?.$id,
                    names: singleCustomer?.names,
                    lastnames: singleCustomer?.lastnames,
                    gender: singleCustomer?.gender,
                    email: singleCustomer?.email,
                    app_user_ID: singleCustomer?.app_user_ID,
                }

                setCustomerInSession(myCustomer)
                setCustomerCartItemsInSession(cartItems?.documents, 'login')
            }

            setUserSession(await account.get())
            navigate('/dashboard')


        }, function (error) {
            setLoading(false);
            console.log(error); // Failure
            setIsValidCredentials(true)
        });

    }

    return (
        <>
            <div className='grid grid-rows-[1fr] min-h-dvh'>
                <div className="bg-gradient-to-b from-blue-600 to-violet-500 h-full flex items-center justify-center sm:items-start sm:pt-32 px-4 ">
                    <Card className="mx-auto w-96">
                        <CardHeader className='flex items-center justify-center'>

                            <img
                                className="mx-auto rounded-xl"
                                width={100}
                                height={100}
                                src="/logo.png"
                                alt="Logo"
                            />

                            <CardTitle className="text-3xl pt-6">Inicia sesión</CardTitle>
                            <CardDescription>
                                Accede con tus credenciales.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...userLoginForm}>
                                <form onSubmit={userLoginForm.handleSubmit(loginTheUser)}>

                                    <div className="grid grid-cols-1 gap-4">

                                        {/* EMAIL */}
                                        <FormField
                                            control={userLoginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type='email' className='font-medium text-lg focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700' />
                                                </FormItem>
                                            )}
                                        />

                                        {/* PASSWORD */}
                                        <FormField
                                            control={userLoginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type='password' className='font-medium text-lg focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* <div className="mt-4 text-end text-sm">
                                    <Link to="/reset-password" className="text-blue-700 hover:text-[#143a63] font-bold">
                                        Olvidé mi contraseña
                                    </Link>
                                </div> */}

                                    <div className='pt-8 grid grid-cols-3 justify-strech gap-1'>
                                        <Button type="button" className='bg-gray-900' onClick={() => addUserToInputs('ADMIN')}>Admin</Button>
                                        <Button type="button" className='bg-pink-500' onClick={() => addUserToInputs('CLIENTE 1')}>Cliente 1</Button>
                                        <Button type="button" className='bg-blue-500' onClick={() => addUserToInputs('CLIENTE 2')}>Cliente 2</Button>
                                        {/* <Button type="button" className='bg-red-500' onClick={() => addUserToInputs('DELETE')}>Borrar</Button> */}
                                    </div>

                                    <div className='pt-8 grid grid-flow-col justify-strech gap-4'>
                                        <Button
                                            type="submit"
                                            className='bg-[#143a63] hover:bg-blue-800 text-lg'
                                            disabled={loading}
                                        >
                                            {loading ? 'Verificando..' : 'Acceder'}
                                        </Button>

                                        <Button
                                            variant='destructive'
                                            className='text-lg text-white'
                                            onClick={() => logoutUser()}
                                        >
                                            LOGOUT
                                        </Button>
                                    </div>

                                </form>
                            </Form>

                            <div className="mt-4 text-center text-sm">
                                ¿No tienes una cuenta?{" "}
                                <Link to="/registro" className="text-red-700 hover:text-red-900 underline font-bold">
                                    Regístrate
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

export default LoginPage