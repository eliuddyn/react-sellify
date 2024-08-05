/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Fragment, useEffect, useState } from 'react'
import db from '@/appwrite/databases';
import { Models } from 'appwrite';
import { formatPrice } from '@/customFunctions/formatPrice';
import useSellifyStore from '@/store/user';

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
import { CircleX } from "lucide-react"
import { Link } from 'react-router-dom'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import Header from '@/components/Header';

const responsive = {
    xl: {
        // the naming can be any, depends on you.
        breakpoint: { max: 1535, min: 1280 },
        items: 4
    },
    lg: {
        breakpoint: { max: 1279, min: 1024 },
        items: 4
    },
    md: {
        breakpoint: { max: 1023, min: 768 },
        items: 3
    },
    sm: {
        breakpoint: { max: 767, min: 640 },
        items: 2
    },
    mobile: {
        breakpoint: { max: 639, min: 0 },
        items: 1
    }
};

const HomePage = () => {

    //const navigate = useNavigate();
    //const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [allTheProducts, setAllTheProducts] = useState<Models.Document[]>([]);
    const [allTheAndroidProducts, setAllTheAndroidProducts] = useState<Models.Document[]>([]);
    const [allTheIosProducts, setAllTheIosProducts] = useState<Models.Document[]>([]);
    //const [allTheCategories, setAllTheCategories] = useState<Models.Document[]>([]);
    const [allTheSubCategories, setAllTheSubCategories] = useState<string[]>([]);

    const userSession = useSellifyStore((state) => state.userSession)
    //const customerInSession = useSellifyStore((state) => state.customerInSession)

    const mobileMenuOpen = useSellifyStore((state) => state.mobileMenuOpen)
    const setMobileMenuOpen = useSellifyStore((state) => state.setMobileMenuOpen)

    useEffect(() => {
        getAllCategories()
        getAllProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllCategories = async () => {
        const categories = await db.categories.list();

        const categoriesByName = categories.documents;

        // setAllTheCategories(categories.documents)
        setAllTheSubCategories(categoriesByName[0]?.sub_categories)
    }

    const getAllProducts = async () => {
        const products = await db.products.list();
        getProductsByOperatingSystem(products.documents)
        setAllTheProducts(products.documents)
    }

    const getProductsByOperatingSystem = (products: Models.Document[]) => {

        let androidProducts: any[] = []
        let iosProducts: any[] = []

        products?.map((product: Models.Document) => {

            if (product.operating_system === 'ANDROID') {
                androidProducts.push(product)
            }

            if (product.operating_system === 'IOS') {
                iosProducts.push(product)
            }
        })

        setAllTheAndroidProducts(androidProducts)
        setAllTheIosProducts(iosProducts)
    }

    return (

        <div className="bg-white">

            {/* Mobile menu */}
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="relative z-40 lg:hidden">
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
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                            >
                                <span className="sr-only">Close menu</span>
                                <CircleX aria-hidden="true" className="h-7 w-7 text-indigo-500" />
                            </button>
                        </div>

                        {/* Links */}
                        <TabGroup className="mt-2">
                            <div className="border-b border-gray-200">
                                {/* <TabList className="-mb-px flex space-x-8 px-4">
                                    {navigation.categories.map((category) => (
                                        <Tab
                                            key={category.name}
                                            className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600"
                                        >
                                            {category.name}
                                        </Tab>
                                    ))}
                                </TabList> */}
                                <TabList className="-mb-px flex space-x-8 px-4">
                                    <Tab
                                        className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600"
                                    >
                                        ANDROID
                                    </Tab>
                                    <Tab
                                        className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-gray-900 data-[selected]:border-indigo-600 data-[selected]:text-indigo-600"
                                    >
                                        IOS
                                    </Tab>
                                </TabList>
                            </div>
                            <TabPanels as={Fragment}>

                                {/* ANDROID PRODUCTS */}
                                <TabPanel className="space-y-12 px-4 py-6">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                        {allTheAndroidProducts.slice(0, 6).map((product: Models.Document) => (
                                            <Link
                                                key={product.$id}
                                                to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                                className="group relative border border-dashed bg-indigo-100 p-1">
                                                <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-md bg-gray-100 group-hover:opacity-75">
                                                    <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                </div>
                                                <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                    <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                    {product.name}
                                                </span>
                                                <p aria-hidden="true" className="mt-1 text-center text-sm text-indigo-700 font-bold">
                                                    RD$ {formatPrice(product.price)}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </TabPanel>

                                {/* IOS PRODUCTS */}
                                <TabPanel className="space-y-12 px-4 py-6">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-10">
                                        {allTheIosProducts.slice(0, 6).map((product: Models.Document) => (
                                            <Link
                                                key={product.$id}
                                                to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                                className="group relative border border-dashed bg-indigo-100 p-1">
                                                <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-md bg-gray-100 group-hover:opacity-75">
                                                    <img alt={product.name} src={product.image} className="object-cover object-center" />
                                                </div>
                                                <span className="mt-6 block text-center text-sm font-medium text-gray-900">
                                                    <span aria-hidden="true" className="absolute inset-0 z-10" />
                                                    {product.name}
                                                </span>
                                                <p aria-hidden="true" className="mt-1 text-center text-sm text-indigo-700 font-bold">
                                                    RD$ {formatPrice(product.price)}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </TabPanel>

                            </TabPanels>
                        </TabGroup>

                        {/* <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                            {navigation.pages.map((page) => (
                                <div key={page.name} className="flow-root">
                                    <a href={page.href} className="-m-2 block p-2 font-medium text-gray-900">
                                        {page.name}
                                    </a>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                            <div className="flow-root">
                                <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
                                    Create an account
                                </a>
                            </div>
                            <div className="flow-root">
                                <a href="#" className="-m-2 block p-2 font-medium text-gray-900">
                                    Sign in
                                </a>
                            </div>
                        </div> */}

                        {/* <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                            {/* Currency selector 
                            <form>
                                <div className="inline-block">
                                    <label htmlFor="mobile-currency" className="sr-only">
                                        Currency
                                    </label>
                                    <div className="group relative -ml-2 rounded-md border-transparent focus-within:ring-2 focus-within:ring-white">
                                        <select
                                            id="mobile-currency"
                                            name="currency"
                                            className="flex items-center rounded-md border-transparent bg-none py-0.5 pl-2 pr-5 text-sm font-medium text-gray-700 focus:border-transparent focus:outline-none focus:ring-0 group-hover:text-gray-800"
                                        >
                                            {currencies.map((currency) => (
                                                <option key={currency}>{currency}</option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
                                            <CircleUser aria-hidden="true" className="h-5 w-5 text-gray-500" />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div> */}
                    </DialogPanel>
                </div>
            </Dialog>

            {/* Hero section */}
            <div className="relative bg-gray-900">
                {/* Decorative image and overlay */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                    <img
                        alt=""
                        //src="https://tailwindui.com/img/ecommerce-images/home-page-01-hero-full-width.jpg"
                        src="/hero-img.jpg"
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />

                {/* HEADER */}
                {!userSession &&
                    <Header androidProducts={allTheAndroidProducts} iosProducts={allTheIosProducts} />
                }

                <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-40 text-center sm:py-64 lg:px-0">
                    <h1 className="text-2xl font-bold tracking-tight text-white pt-32 pb-4 md:text-4xl lg:text-6xl">Descubre el futuro de los Smartphones</h1>
                    {/* <p className="mt-4 text-xl text-white">
                        The new arrivals have, well, newly arrived. Check out the latest options from our summer small-batch release
                        while they're still in stock.
                    </p> */}
                    {/* <a
                        href="#"
                        className="mt-8 inline-block rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
                    >
                        Shop New Arrivals
                    </a> */}
                </div>
            </div>

            <main>

                {/* Brands section */}
                <section aria-labelledby="category-heading" className="relative pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8">
                    <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
                        <h2 id="category-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            Compra por Marca
                        </h2>
                    </div>

                    <Carousel
                        swipeable={false}
                        draggable={true}
                        showDots={true}
                        renderDotsOutside={true}
                        responsive={responsive}
                        //slidesToSlide={1}
                        ssr={false} // means to render carousel on server-side.
                        infinite={true}
                        //autoPlay={this?.props.deviceType !== "mobile" ? true : false}
                        autoPlay={true}
                        autoPlaySpeed={3000}
                        keyBoardControl={true}
                        customTransition="all .5"
                        transitionDuration={1000}
                        //containerClass="flex items-center justify-around"
                        removeArrowOnDeviceType={["mobile", "sm", "md", "lg", "xl"]}
                        //deviceType={this.props.deviceType}
                        //dotListClass="py-4"
                        itemClass="px-4 py-8 h-full"
                        className='relative mx-4'
                    >
                        {allTheSubCategories.map((subc: string) => (
                            <Link
                                key={subc}
                                to={userSession ? `/tienda/productos/${subc.toLowerCase()}` : `/productos/${subc.toLowerCase()}`}
                                //className="relative bg-blue-600 flex flex-col items-center justify-center h-full w-52 overflow-hidden rounded-lg mb-10 pb-20 hover:opacity-75 xl:w-68"
                                className="relative bg-indigo-600 h-36 rounded-xl flex flex-col items-center justify-center"
                            >
                                {/* <span aria-hidden="true" className="absolute inset-0">
                                    <img alt="" src={product?.image} className="h-full w-full object-cover object-center" />
                                </span> */}

                                <span className='relative text-center text-2xl font-bold text-white'>{subc}</span>
                                {/* <span
                                    aria-hidden="true"
                                    //className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-teal-800 opacity-1000"
                                    className="absolute inset-x-0 bottom-0 h-full bg-blue-600 my-4"
                                />
                                <span className="relative mt-auto text-center text-xl font-bold text-white">{subc}</span> */}
                            </Link>
                        ))}
                    </Carousel>
                </section>

                {/* Products section */}
                <section aria-labelledby="category-heading" className="relative pt-24 sm:pt-32 xl:mx-auto xl:max-w-7xl xl:px-8">
                    <div className="px-4 pb-6 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
                        <h2 id="category-heading" className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                            Nuestros Productos
                        </h2>

                        <Link to={userSession ? "/tienda/productos/todos" : "/productos/todos"} className="hidden text-base font-semibold text-indigo-600 hover:text-indigo-500 sm:block">
                            Ver todos los productos
                            <span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </div>

                    <div className="">
                        <div className="mx-auto w-full px-4 py-8">
                            <h2 className="sr-only">Productos</h2>

                            <div className="grid justify-items-center grid-cols-1 gap-y-8 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {allTheProducts.slice(0, 8).map((product: Models.Document) => (
                                    <Link key={product.$id} to={userSession ? `/tienda/celulares/${product.$id}` : `/celulares/${product.$id}`}
                                        className="flex flex-col items-center justify-center bg-gray-100 hover:bg-indigo-200 
                                    rounded-xl text-gray-800 border border-dashed p-3"
                                    >
                                        <div className="h-96 w-[320px] lg:h-80 lg:w-80 xl:w-64 overflow-hidden rounded-lg bg-gray-200">
                                            <img
                                                alt={product.name}
                                                src={product.image}
                                                className="h-full w-full object-cover object-center hover:opacity-70"
                                            />
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold">{product.name}</h3>
                                        <h3 className="text-sm text-gray-700">4 comentarios</h3>
                                        <p className="mt-3 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 px-4 sm:hidden">
                        <Link to={userSession ? `/tienda/productos/todos` : `/productos/todos`}
                            className="block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                            Ver todos los productos
                            <span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </div>
                </section>

                {/* Featured section */}
                <section
                    aria-labelledby="social-impact-heading"
                    className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 sm:pt-32 lg:px-8"
                >
                    <div className="relative overflow-hidden rounded-lg">
                        <div className="absolute inset-0">
                            <img
                                alt=""
                                //src="https://tailwindui.com/img/ecommerce-images/home-page-01-feature-section-01.jpg"
                                src="/store-hero.svg"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="relative bg-gray-900 bg-opacity-75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
                            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                                <h2 id="social-impact-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    <span className="block sm:inline">Encuentra Tu </span>
                                    <span className="block sm:inline">Smartphone Perfecto</span>
                                </h2>
                                <p className="mt-3 text-xl text-white">
                                    Descubre modelos con cámaras de alta resolución, baterías de larga duración, y pantallas impresionantes que transformarán tu experiencia digital.
                                </p>
                                <Link
                                    to={userSession ? "/tienda/productos/todos" : "/productos/todos"}
                                    className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:text-white hover:bg-indigo-500 sm:w-auto"
                                >
                                    Ver los Smartphones
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Collection section */}
                <section
                    aria-labelledby="collection-heading"
                    className="mx-auto w-full px-4 pt-24 sm:px-6 sm:pt-32 lg:max-w-7xl lg:px-8"
                >
                    <h2 id="collection-heading" className="text-2xl font-bold tracking-tight text-gray-900">
                        Sistemas Operativos
                    </h2>
                    <p className="mt-4 text-base text-gray-500">
                        Los sistemas operativos más utilizados en el planeta.
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Link to={userSession ? `/tienda/productos/android` : `/productos/android`} className="group block">
                            <div
                                aria-hidden="true"
                                className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg lg:aspect-h-6 lg:aspect-w-5 group-hover:opacity-90"
                            >
                                <img
                                    alt='ANDROID'
                                    src='/android.jpg'
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </Link>

                        <Link to={userSession ? `/tienda/productos/ios` : `/productos/ios`} className="group block">
                            <div
                                aria-hidden="true"
                                className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg lg:aspect-h-6 lg:aspect-w-5 group-hover:opacity-90"
                            >
                                <img
                                    alt='IOS'
                                    src='/ios.jpg'
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Featured section */}
                <section aria-labelledby="comfort-heading" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="relative overflow-hidden rounded-lg">
                        <div className="absolute inset-0">
                            <img
                                alt=""
                                //src="https://tailwindui.com/img/ecommerce-images/home-page-01-feature-section-02.jpg"
                                src="iPhones.webp"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="relative bg-gray-900 bg-opacity-75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
                            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                                <h2 id="comfort-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    Todos los iPhones
                                </h2>
                                <p className="mt-3 text-xl text-white">
                                    Experimenta el poder y la elegancia de los iPhones, el estándar de oro en smartphones.
                                </p>
                                <Link
                                    to={userSession ? `/tienda/productos/ios` : `/productos/ios`}
                                    className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:text-white hover:bg-indigo-500 sm:w-auto"
                                >
                                    Compra un iPhone
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

        </div>
    )
}

export default HomePage