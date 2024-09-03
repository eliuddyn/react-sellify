import { Fragment, useState } from 'react';
import { Models } from 'appwrite';
import { formatPrice } from '@/customFunctions/formatPrice';
import useSellifyStore from '@/store/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    PopoverPanel,
    CloseButton
} from '@headlessui/react'
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
} from '@headlessui/react'
import { CircleX, House } from "lucide-react"
import { Menu, ShoppingCart } from "lucide-react"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils';
import { account } from '@/appwrite/config';

type Props = {
    theSmartphones?: Models.Document[],
    theTablets?: Models.Document[],
    theSmartwatches?: Models.Document[],
    theAccesories?: Models.Document[],
}

const Header = ({ theSmartphones, theTablets, theSmartwatches, theAccesories }: Props) => {

    const navigate = useNavigate();
    const location = useLocation();
    const setUserSession = useSellifyStore((state) => state.setUserSession)
    const userSession = useSellifyStore((state) => state.userSession)
    const setCustomerInSession = useSellifyStore((state) => state.setCustomerInSession)
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const customerCartItemsInSession = useSellifyStore((state) => state.customerCartItemsInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)
    const [alertDialogForLogout, setAlertDialogForLogout] = useState<boolean>(false);
    const [menuOpen, setMenuOpen] = useState<boolean>(false);

    const logoutUser = async () => {
        setUserSession(null);
        setCustomerInSession(null);
        setCustomerCartItemsInSession(null, 'logout')
        localStorage.removeItem('slUserRole')
        await account.deleteSession('current')
        navigate('/')
    }

    return (

        <>
            <header className="relative z-10">

                {/* Mobile menu */}
                <Dialog open={menuOpen} onClose={setMenuOpen} className="relative z-40 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                        >
                            <div className="flex justify-end px-4 pb-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setMenuOpen(false)}
                                    className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                                >
                                    <span className="sr-only">Close menu</span>
                                    <CircleX aria-hidden="true" className="h-8 w-8 text-pink-800" />
                                </button>
                            </div>

                            {/* Links */}
                            <TabGroup className="mt-2">
                                <div className="border-b border-gray-200">
                                    <TabList className="-mb-px grid grid-cols-2 gap-y-4">
                                        <Tab
                                            className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-1 text-base font-medium text-gray-900 focus:outline-none data-[selected]:border-rose-600 data-[selected]:text-rose-600"
                                        >
                                            CELULARES
                                        </Tab>
                                        <Tab
                                            className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-1 text-base font-medium text-gray-900 focus:outline-none data-[selected]:border-rose-600 data-[selected]:text-rose-600"
                                        >
                                            TABLETS
                                        </Tab>
                                        <Tab
                                            className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-1 text-base font-medium text-gray-900 focus:outline-none data-[selected]:border-rose-600 data-[selected]:text-rose-600"
                                        >
                                            SMART WATCHES
                                        </Tab>
                                        <Tab
                                            className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-1 text-base font-medium text-gray-900 focus:outline-none data-[selected]:border-rose-600 data-[selected]:text-rose-600"
                                        >
                                            ACCESORIOS
                                        </Tab>
                                    </TabList>
                                </div>
                                <TabPanels as={Fragment}>

                                    {/* SMARTPHONES PRODUCTS */}
                                    <TabPanel className="space-y-12 px-4 py-6">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                            {theSmartphones?.slice(0, 6).map((product: Models.Document) => (
                                                <Link
                                                    key={product.$id}
                                                    to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="group relative rounded-2xl border border-dashed bg-rose-100 p-1"
                                                >
                                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                        <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                    </div>
                                                    <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        {product.name}
                                                    </span>
                                                    <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                        RD$ {formatPrice(product.price)}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </TabPanel>

                                    {/* TABLETS PRODUCTS */}
                                    <TabPanel className="space-y-12 px-4 py-6">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                            {theTablets?.slice(0, 6).map((product: Models.Document) => (
                                                <Link
                                                    key={product.$id}
                                                    to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="group relative rounded-2xl border border-dashed bg-rose-100 p-1"
                                                >
                                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                        <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                    </div>
                                                    <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        {product.name}
                                                    </span>
                                                    <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                        RD$ {formatPrice(product.price)}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </TabPanel>

                                    {/* SMART WATCHES PRODUCTS */}
                                    <TabPanel className="space-y-12 px-4 py-6">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                            {theSmartwatches?.slice(0, 6).map((product: Models.Document) => (
                                                <Link
                                                    key={product.$id}
                                                    to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="group relative rounded-2xl border border-dashed bg-rose-100 p-1"
                                                >
                                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                        <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                    </div>
                                                    <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        {product.name}
                                                    </span>
                                                    <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                        RD$ {formatPrice(product.price)}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </TabPanel>

                                    {/* ACCESORIES PRODUCTS */}
                                    <TabPanel className="space-y-12 px-4 py-6">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                            {theAccesories?.slice(0, 6).map((product: Models.Document) => (
                                                <Link
                                                    key={product.$id}
                                                    to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="group relative rounded-2xl border border-dashed bg-rose-100 p-1"
                                                >
                                                    <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-xl bg-gray-100 group-hover:opacity-75">
                                                        <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                    </div>
                                                    <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                        <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                        {product.name}
                                                    </span>
                                                    <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                        RD$ {formatPrice(product.price)}
                                                    </p>
                                                </Link>
                                            ))}
                                        </div>
                                    </TabPanel>

                                </TabPanels>
                            </TabGroup>
                        </DialogPanel>
                    </div >
                </Dialog >

                <nav aria-label="Top">

                    {/* Secondary navigation */}
                    <div className="bg-gray-900 backdrop-blur-md backdrop-filter">
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
                                        <PopoverGroup className={cn(
                                            location.pathname === '/login' ||
                                                location.pathname === '/registro' ||
                                                location.pathname === '/recuperar_password' ||
                                                location.pathname === '/nuevo_password'
                                                ? 'hidden' : '',
                                            "inset-x-0 bottom-0 px-4"
                                        )}>
                                            <div className="flex h-full justify-center space-x-8">
                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-base font-medium text-white hover:text-amber-200 transition-colors duration-200 ease-out">

                                                            <span className='group-data-[open]:text-amber-400'>
                                                                CELULARES
                                                            </span>

                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-1 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* SMARTPHONES PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {theSmartphones?.slice(0, 4).map((product: Models.Document) => (
                                                                        <CloseButton
                                                                            key={product.$id}
                                                                            as={Link}
                                                                            to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-rose-100 hover:bg-rose-200 p-1"
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
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </CloseButton>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverPanel>
                                                </Popover>

                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-base font-medium text-white hover:text-amber-200 transition-colors duration-200 ease-out">
                                                            <span className='group-data-[open]:text-amber-400'>
                                                                TABLETS
                                                            </span>

                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-1 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* TABLETS PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {theTablets?.slice(0, 4).map((product: Models.Document) => (
                                                                        <CloseButton
                                                                            key={product.$id}
                                                                            as={Link}
                                                                            to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-rose-100 hover:bg-rose-200 p-1"
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
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </CloseButton>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverPanel>
                                                </Popover>
                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-base font-medium text-white hover:text-amber-200 transition-colors duration-200 ease-out">
                                                            <span className='group-data-[open]:text-amber-400'>
                                                                SMART WATCHES
                                                            </span>

                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-1 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* SMART WATCHES PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {theSmartwatches?.slice(0, 4).map((product: Models.Document) => (
                                                                        <CloseButton
                                                                            key={product.$id}
                                                                            as={Link}
                                                                            to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-rose-100 hover:bg-rose-200 p-1"
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
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </CloseButton>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </PopoverPanel>
                                                </Popover>

                                                <Popover className="flex">
                                                    <div className="relative flex">
                                                        <PopoverButton className="group relative z-10 flex items-center justify-center text-base font-medium text-white hover:text-amber-200 transition-colors duration-200 ease-out">
                                                            <span className='group-data-[open]:text-amber-400'>
                                                                ACCESORIOS
                                                            </span>

                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-x-0 -bottom-px h-1 transition duration-200 ease-out group-data-[open]:bg-amber-400"
                                                            />
                                                        </PopoverButton>
                                                    </div>

                                                    {/* ACCESORIES PRODUCTS */}
                                                    <PopoverPanel
                                                        transition
                                                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                                    >
                                                        {/* Presentational element used to render the bottom shadow, if we put the shadow on the actual panel it pokes out the top, so we use this shorter element to hide the top of the shadow */}
                                                        <div aria-hidden="true" className="absolute inset-0 top-1/2 bg-white shadow" />

                                                        <div className="relative bg-white">
                                                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                                                <div className="grid grid-cols-4 gap-x-8 gap-y-10 py-16">
                                                                    {theAccesories?.slice(0, 4).map((product: Models.Document) => (
                                                                        <CloseButton
                                                                            key={product.$id}
                                                                            as={Link}
                                                                            to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                                                            className="group relative rounded-xl border border-dashed bg-rose-100 hover:bg-rose-200 p-1"
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
                                                                            <p aria-hidden="true" className="mt-1 text-center text-sm text-rose-700 font-bold">
                                                                                RD$ {formatPrice(product.price)}
                                                                            </p>
                                                                        </CloseButton>
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
                                    {/* <Link to={userSession ? "/tienda" : "/"} className="lg:hidden">
                                        <span className="sr-only">Logo</span>
                                        <img
                                            alt=""
                                            src="/logo.png"
                                            className="h-14 w-auto" />
                                    </Link> */}

                                    {/* Mobile menu (lg-) */}
                                    <div className={cn(
                                        location.pathname === '/login' ||
                                            location.pathname === '/registro' ||
                                            location.pathname === '/recuperar_password' ||
                                            location.pathname === '/nuevo_password'
                                            ? 'hidden' : 'flex flex-1 items-center lg:hidden',
                                        // "flex flex-1 items-center lg:hidden"
                                    )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setMenuOpen(true)}
                                            className="-ml-2 p-2 text-white"
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <Menu aria-hidden="true" className="h-8 w-8 text-rose-500" />
                                        </button>
                                    </div>

                                    <div className='flex items-center justify-center'>
                                        {/* Logo (lg-) */}
                                        <Link to={userSession ? "/tienda" : "/"} className="lg:hidden">
                                            {/* <span className="sr-only">Logo</span>
                                            <img
                                                alt=""
                                                src="/logo.png"
                                                className="h-14 w-auto" /> */}
                                            <House aria-hidden="true" className="h-8 w-8 text-white" />
                                        </Link>

                                    </div>

                                    <div className="flex flex-1 items-center justify-end">

                                        <div className="flex items-center lg:ml-8">
                                            {/* Login */}
                                            {!userSession &&
                                                <Link to="/login" className="text-base font-bold text-rose-700 px-3 py-1 bg-gray-50 hover:bg-rose-700 hover:text-white rounded-3xl">
                                                    Acceder
                                                </Link>
                                            }

                                            {/* Cart */}
                                            {userSession &&
                                                <>
                                                    <div className="mr-4 flow-root lg:mr-8">
                                                        <Link to="/carrito" className="group -m-2 flex items-center p-2">
                                                            <ShoppingCart aria-hidden="true" className="h-8 w-8 flex-shrink-0 text-white" />
                                                            <span className="ml-2 text-base font-bold text-white">{customerCartItemsInSession?.length}</span>
                                                            <span className="sr-only">Carrito</span>
                                                        </Link>
                                                    </div>

                                                    <DropdownMenu aria-hidden="false">
                                                        <DropdownMenuTrigger asChild>

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
                                                            <DropdownMenuLabel className='text-center text-lg'>Mi Cuenta</DropdownMenuLabel>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem className='cursor-pointer'>
                                                                <button
                                                                    className='w-full text-center text-gray-700 text-base font-bold'
                                                                    onClick={() => navigate('/pedidos')}
                                                                >
                                                                    Mis Pedidos
                                                                </button>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem className='cursor-pointer'>
                                                                <button
                                                                    className='w-full text-center text-base text-red-700 font-bold'
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
            </header >

            {/* LOGOUT ALERTDIALOG */}
            < AlertDialog open={alertDialogForLogout} onOpenChange={setAlertDialogForLogout} >
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
            </AlertDialog >

        </>
    )
}

export default Header