import { useState } from 'react';
import { Models } from 'appwrite';
import { formatPrice } from '@/customFunctions/formatPrice';
import useSellifyStore from '@/store/user';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription
} from "@/components/ui/alert-dialog"
import {
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel

} from '@headlessui/react'
import { Menu, ShoppingCart } from "lucide-react"
import { Link, useNavigate } from 'react-router-dom'
import 'react-multi-carousel/lib/styles.css';
import { cn } from '@/lib/utils';
import { account } from '@/appwrite/config';

type Props = {
    androidProducts?: Models.Document[],
    iosProducts?: Models.Document[],
}

const Header = ({ androidProducts, iosProducts }: Props) => {

    const navigate = useNavigate();
    const setUserSession = useSellifyStore((state) => state.setUserSession)
    const userSession = useSellifyStore((state) => state.userSession)
    const setCustomerInSession = useSellifyStore((state) => state.setCustomerInSession)
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const setMobileMenuOpen = useSellifyStore((state) => state.setMobileMenuOpen)
    const [alertDialogForLogout, setAlertDialogForLogout] = useState<boolean>(false);

    const logoutUser = async () => {
        await account.deleteSession('current')
        setUserSession(null);
        setCustomerInSession(null);
        setCustomerCartItemsInSession(null, 'logout')
        localStorage.removeItem('slUserRole')
        navigate('/')
    }

    return (

        <>
            <header className="relative z-10">
                <nav aria-label="Top">

                    {/* Secondary navigation */}
                    <div className="bg-indigo-900 backdrop-blur-md backdrop-filter">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div>
                                <div className="flex h-16 items-center justify-between">
                                    {/* Logo (lg+) */}
                                    <div className="hidden lg:flex lg:flex-1 lg:items-center">
                                        <Link to={userSession ? "/tienda" : "/"}>
                                            <span className="sr-only">Your Company</span>
                                            <img
                                                alt=""
                                                src="/logo.png"
                                                className="h-14 w-auto"
                                            />
                                        </Link>
                                    </div>

                                    <div className="hidden h-full lg:flex">
                                        {/* Flyout menus */}
                                        <PopoverGroup className="inset-x-0 bottom-0 px-4">
                                            <div className="flex h-full justify-center space-x-8">
                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-sm font-medium text-white transition-colors duration-200 ease-out">
                                                            ANDROID
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-0.5 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* ANDROID PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {androidProducts?.slice(0, 4).map((product: Models.Document) => (
                                                                        <Link
                                                                            key={product.$id}
                                                                            to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-indigo-100 hover:bg-indigo-200 p-1"
                                                                        >
                                                                            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                                                <img
                                                                                    alt={product.name}
                                                                                    src={product.image}
                                                                                    className="object-cover object-center"
                                                                                />
                                                                            </div>
                                                                            <span className="mt-4 block text-center font-medium text-gray-900">
                                                                                <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                                                {product.name}
                                                                            </span>
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-indigo-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverPanel>
                                                </Popover>

                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-sm font-medium text-white transition-colors duration-200 ease-out">
                                                            IOS
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-0.5 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* IOS PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {iosProducts?.slice(0, 4).map((product: Models.Document) => (
                                                                        <Link
                                                                            key={product.$id}
                                                                            to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-indigo-100 hover:bg-indigo-200 p-1"
                                                                        >
                                                                            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                                                <img
                                                                                    alt={product.name}
                                                                                    src={product.image}
                                                                                    className="object-cover object-center"
                                                                                />
                                                                            </div>
                                                                            <span className="mt-4 block text-center font-medium text-gray-900">
                                                                                <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                                                {product.name}
                                                                            </span>
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-indigo-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverPanel>
                                                </Popover>
                                            </div>
                                        </PopoverGroup>
                                    </div>

                                    {/* Logo (lg-) */}
                                    <Link to={userSession ? "/tienda" : "/"} className="lg:hidden">
                                        <span className="sr-only">Logo</span>
                                        <img
                                            alt=""
                                            //src="https://tailwindui.com/img/logos/mark.svg?color=white"
                                            src="/logo.png"
                                            className="h-14 w-auto" />
                                    </Link>

                                    {/* Mobile menu and search (lg-) */}
                                    <div className="flex flex-1 items-center lg:hidden">
                                        <button
                                            type="button"
                                            onClick={() => setMobileMenuOpen(true)}
                                            className="-ml-2 p-2 text-white"
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <Menu aria-hidden="true" className="h-6 w-6" />
                                        </button>

                                        {/* Search */}
                                        {/* <a href="#" className="ml-2 p-2 text-white">
                                <span className="sr-only">Search</span>
                                <CircleUser aria-hidden="true" className="h-6 w-6" />
                            </a> */}
                                    </div>

                                    <div className="flex flex-1 items-center justify-end">
                                        {/* <a href="#" className="hidden text-sm font-medium text-white lg:block">
                                Search
                            </a> */}

                                        <div className="flex items-center lg:ml-8">
                                            {/* Login */}
                                            {!userSession &&
                                                <Link to="/login" className="text-base font-bold text-indigo-800 px-3 py-1 bg-gray-50 hover:bg-indigo-500 hover:text-white rounded-3xl">
                                                    Acceder
                                                </Link>
                                            }

                                            {/* Cart */}
                                            {userSession &&
                                                <>
                                                    {/* Login */}
                                                    {/* <Link to="#" className="p-2 text-white">
                                                <span className="sr-only">Help</span>
                                                <CircleUser aria-hidden="true" className="h-6 w-6" />
                                            </Link> */}

                                                    <div className="mr-4 flow-root lg:mr-8">
                                                        <Link to="/carrito" className="group -m-2 flex items-center p-2">
                                                            <ShoppingCart aria-hidden="true" className="h-6 w-6 flex-shrink-0 text-white" />
                                                            <span className="ml-2 text-sm font-medium text-white">{customerCartItemsInSession?.length}</span>
                                                            <span className="sr-only">Carrito</span>
                                                        </Link>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            {/* <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button> */}
                                                            <Avatar className='cursor-pointer h-10 w-10'>
                                                                <Avatar>
                                                                    <AvatarImage src={undefined} alt="Foto" />
                                                                    <AvatarFallback className={cn(
                                                                        customerInSession?.gender === 'M' ? 'bg-blue-600' : 'bg-pink-600',
                                                                        'text-gray-100 font-bold'
                                                                    )}>
                                                                        <span className='grid grid-cols-1 justify-items-center'>
                                                                            {/* NAMES  */}
                                                                            <span className="text-xs">
                                                                                {customerInSession?.names && customerInSession?.names?.split(" ")?.map((name: string) =>
                                                                                    <span key={name}>{name[0][0]}</span>
                                                                                )}
                                                                            </span>

                                                                            {/* LASTNAMES  */}
                                                                            <span className="text-xs">
                                                                                {customerInSession?.lastnames && customerInSession?.lastnames?.split(" ")?.map((lastname: string) =>
                                                                                    <span key={lastname}>{lastname[0][0]}</span>
                                                                                )}
                                                                            </span>
                                                                        </span>
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </Avatar>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel className='text-center text-xl'>Mi Cuenta</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>Mis pedidos</DropdownMenuItem>
                                                            {/* <DropdownMenuSeparator /> */}
                                                            {/* <DropdownMenuItem>Support</DropdownMenuItem> */}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className='cursor-pointer'>
                                                                <button
                                                                    className='w-full text-center text-red-700 font-bold'
                                                                    onClick={() => setAlertDialogForLogout(true)}
                                                                >
                                                                    Salir
                                                                </button>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>

                                                </>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            {/* LOGOUT ALERTDIALOG */}
            <AlertDialog open={alertDialogForLogout} onOpenChange={setAlertDialogForLogout}>
                <AlertDialogContent className='bg-gray-300 border border-gray-600 flex flex-col items-center justify-between'>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-gray-800 text-2xl text-center'>¿Está seguro de salir?</AlertDialogTitle>
                        <AlertDialogDescription></AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            className='bg-blue-900 hover:bg-blue-800 text-gray-100 hover:text-gray-100'
                        >
                            NO
                        </AlertDialogCancel>
                        <AlertDialogAction className='bg-rose-500 hover:bg-rose-600' onClick={() => logoutUser()}>SALIR</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </>
    )
}

export default Header