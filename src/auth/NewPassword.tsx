/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form';
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

const setNewPasswordSchema = z.object({
    newPassword: z.string({ required_error: "Requerido" }).min(8, '8 caracteres mínimo'),
    newConfirmationPassword: z.string({ required_error: "Requerido" }).min(8, '8 caracteres mínimo'),
}).superRefine(({ newConfirmationPassword, newPassword }, ctx) => {
    if (newConfirmationPassword !== newPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Las contraseñas no coinciden",
            path: ['newConfirmationPassword']
        });
    }
})

const NewPasswordPage = () => {

    const navigate = useNavigate()
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId')
    const secret = searchParams.get('secret')
    const [loading, setLoading] = useState<boolean>(false);
    const [isNewPasswordSet, setIsNewPasswordSet] = useState<boolean>(false);

    const setNewPasswordForm = useForm<z.infer<typeof setNewPasswordSchema>>({
        resolver: zodResolver(setNewPasswordSchema),
        mode: "onSubmit",
        defaultValues: {
            newPassword: '',
            newConfirmationPassword: '',
        },
    });

    async function setThePasswordForCustomer(values: z.infer<typeof setNewPasswordSchema>) {

        if (values?.newPassword === values?.newConfirmationPassword && userId && secret) {
            await account.updateRecovery(
                userId && userId,
                secret,
                values?.newPassword

            ).then(() => {
                setLoading(false)
                setIsNewPasswordSet(true)

            }, function (error) {
                setLoading(false)
                console.log(error)

                // if (error.type === 'user_not_found') {
                //     setIsCustomerNotFound(true)
                // }
            })
        }
    }

    return (
        <>

            <div className='grid grid-rows-[1fr] min-h-dvh'>
                <div className="bg-gradient-to-b from-[#f5576c] to-[#d57eeb] h-full flex items-center justify-center sm:items-start sm:pt-32 px-4 ">
                    <Card className="mx-auto w-96">
                        <CardHeader className='flex items-center justify-center'>

                            <img
                                className="mx-auto rounded-xl"
                                width={100}
                                height={100}
                                src="/logo.png"
                                alt="Logo"
                            />

                            <CardTitle className="text-3xl pt-6">Crear Nueva Contraseña</CardTitle>
                            <CardDescription>
                                Ingresa la nueva contraseña para tu cuenta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...setNewPasswordForm}>
                                <form onSubmit={setNewPasswordForm.handleSubmit(setThePasswordForCustomer)}>

                                    <div className="grid grid-cols-1 gap-4">

                                        {/* NEW PASSWORD */}
                                        <FormField
                                            control={setNewPasswordForm.control}
                                            name="newPassword"
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

                                        {/* NEW CONFIRMATION PASSWORD */}
                                        <FormField
                                            control={setNewPasswordForm.control}
                                            name="newConfirmationPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className='text-base font-bold text-[#143a63]'>Confirmar Contraseña</FormLabel>
                                                    <FormControl>
                                                        <Input type='password' className='font-medium text-base focus-visible:ring-[#143a63]' {...field} />
                                                    </FormControl>
                                                    <FormMessage className='text-red-700 text-xs flex items-center justify-end' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='pt-8 grid grid-flow-col justify-strech gap-4'>
                                        <Button
                                            type="submit"
                                            className='bg-[#143a63] hover:bg-blue-700 text-lg'
                                            disabled={
                                                loading
                                                // setNewPasswordForm.getValues('newConfirmationPassword') !== setNewPasswordForm.getValues('newPassword') ||
                                                // setNewPasswordForm.getValues('newPassword') === '' ||
                                                // setNewPasswordForm.getValues('newConfirmationPassword') === ''
                                            }
                                        >
                                            {loading ?
                                                <>
                                                    <svg width="20" height="20" fill="currentColor" className="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
                                                        </path>
                                                    </svg>
                                                    Actualizando...
                                                </>
                                                :
                                                'Guardar'}
                                        </Button>
                                    </div>

                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AlertDialog open={isNewPasswordSet} onOpenChange={setIsNewPasswordSet}>
                <AlertDialogContent className='mx-2'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-teal-600 text-xl sm:text-2xl'>Nueva contraseña actualizada!</AlertDialogTitle>
                        <AlertDialogDescription className='text-base font-medium text-gray-900'>
                            Luego de cerrar esta confirmación, será redirigido al login.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className='bg-rose-600 text-gray-100 hover:text-gray-100' onClick={() => navigate('/login')}>Entendido</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default NewPasswordPage