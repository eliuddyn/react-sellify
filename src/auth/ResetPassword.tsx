/* eslint-disable @typescript-eslint/no-unused-vars */
// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form';
// import { z } from 'zod'
// import { zodResolver } from '@hookform/resolvers/zod';
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//     AlertDialog,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
// } from "@/components/ui/alert-dialog"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { account } from '@/appwrite/config';
// import useSellifyStore from '@/store/user';

// const resetPasswordSchema = z.object({
//     email: z.string({ required_error: "Requerido" }).email({ message: "Correo inválido" }),
// })

const ResetPasswordPage = () => {

    //    // const navigate = useNavigate()
    //    // const [loading, setLoading] = useState<boolean>(false);
    //     const [isValidCredentials, setIsValidCredentials] = useState<boolean>(false);
    //     const theURL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_PRODUCTION_URL as string : import.meta.env.VITE_DEVELOPMENT_URL as string

    //    // const setUserSession = useSellifyStore((state) => state.setUserSession)

    //     const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    //         resolver: zodResolver(resetPasswordSchema),
    //         mode: "onSubmit",
    //         defaultValues: {
    //             email: '',
    //         },
    //     });

    //     async function resetThePassword(values: z.infer<typeof resetPasswordSchema>) {
    //         console.log(values)
    //         console.log(theURL)
    //         console.log(`${theURL}/reset-password`)

    //         //setLoading(true);

    //         await account.createRecovery(
    //             values.email,
    //             `${theURL}/verifyEmail`
    //         );

    //         setIsValidCredentials(true)

    // const promise = account.createEmailPasswordSession(values.email, values.password);

    // promise.then(async () => {

    //     // Success

    //     //console.log(await account.get());

    //     const { prefs } = await account.get()
    //     //const { labels } = await account.get()

    //     localStorage.setItem('slUserRole', prefs?.role as string);

    //     setUserSession(await account.get())
    //     navigate('/dashboard')


    // }, function (error) {
    //     setLoading(false);
    //     console.log(error); // Failure
    //     setIsValidCredentials(true)
    // });

    // }

    return (
        <>

            {/* <div className="bg-gradient-to-b from-blue-600 to-violet-500 h-full flex items-center justify-center sm:items-start sm:pt-32 px-4 ">
                <Card className="mx-auto w-96">
                    <CardHeader className='flex items-center justify-center'>

                        <img
                            className="mx-auto rounded-xl"
                            width={100}
                            height={100}
                            src="/logo.png"
                            alt="Logo"
                        />

                        <CardTitle className="text-3xl pt-6">Recuperar Contraseña</CardTitle>
                        <CardDescription>
                            Ingresa tu email para conprobar tus credenciales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...resetPasswordForm}>
                            <form onSubmit={resetPasswordForm.handleSubmit(resetThePassword)}>

                                <div className="grid grid-cols-1 gap-4">

                                   
                                    <FormField
                                        control={resetPasswordForm.control}
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
                                </div>

                                <div className='pt-8 grid grid-flow-col justify-strech gap-4'>
                                    <Button
                                        type="submit"
                                        className='bg-[#143a63] hover:bg-blue-800 text-lg'
                                        disabled={loading}
                                    >
                                        {loading ? 'Verificando..' : 'Confirmar'}
                                    </Button>
                                </div>

                            </form>
                        </Form>

                        <div className="mt-4 text-center text-sm">
                            ¿No tienes una cuenta?{" "}
                            <Link to="/register" className="text-red-700 hover:text-red-900 underline font-bold">
                                Regístrate
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            
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

                      
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        */}
        </>
    )
}

export default ResetPasswordPage