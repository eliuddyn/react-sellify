/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import db from '@/appwrite/databases';
import { Models } from 'appwrite';
import { formatPrice } from '@/customFunctions/formatPrice';
import useSellifyStore from '@/store/user';
import { Link } from 'react-router-dom'
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

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

    const [allTheProducts, setAllTheProducts] = useState<Models.Document[]>([]);
    const [allTheSubCategories, setAllTheSubCategories] = useState<string[]>([]);

    const userSession = useSellifyStore((state) => state.userSession)

    useEffect(() => {
        getAllCategories()
        getAllProducts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllCategories = async () => {
        const categories = await db.categories.list();

        let allSubCategories: string[] = [];

        categories.documents?.forEach((category: Models.Document) => {

            if (category.name !== 'ACCESORIOS') {
                category.sub_categories.forEach((subCategory: string) => {
                    allSubCategories.push(subCategory);
                });
            }
        });

        setAllTheSubCategories([...new Set(allSubCategories)])
    }

    const getAllProducts = async () => {
        const products = await db.products.list();
        //getProductsByOperatingSystem(products.documents)
        setAllTheProducts(products.documents)
    }

    return (

        <div className="bg-white">

            {/* Hero section */}
            <div className="relative bg-gray-900">
                {/* Decorative image and overlay */}
                <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                    <img
                        alt=""
                        src="/hero-img.jpg"
                        className="h-full w-full object-cover object-center"
                    />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-gray-900 opacity-50" />

                <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pt-40 text-center sm:py-64 lg:px-0">
                    <h1 className="text-2xl font-bold tracking-tight text-white pt-32 pb-4 md:text-4xl lg:text-6xl">Descubre el futuro de los Smartphones</h1>
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
                                className="relative bg-rose-600 h-36 rounded-xl flex flex-col items-center justify-center"
                            >

                                <span className='relative text-center text-2xl font-bold text-white'>{subc}</span>
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

                        <Link to={userSession ? "/tienda/productos/todos" : "/productos/todos"} className="hidden text-base font-semibold text-rose-600 hover:text-rose-500 sm:block">
                            Ver todos los productos
                            <span aria-hidden="true"> &rarr;</span>
                        </Link>
                    </div>

                    <div className="">
                        <div className="mx-auto w-full px-4 py-8">
                            <h2 className="sr-only">Productos</h2>

                            <div className="grid justify-items-center grid-cols-1 gap-y-8 gap-x-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {allTheProducts.slice(0, 8).map((product: Models.Document) => (
                                    <Link key={product.$id} to={userSession ? `/tienda/los_productos/${product.$id}` : `/los_productos/${product.$id}`}
                                        className="flex flex-col items-center justify-center bg-gray-100 hover:bg-rose-200 
                                    rounded-xl text-gray-800 border border-dashed p-3"
                                    >
                                        <div className="h-96 w-[320px] lg:h-80 lg:w-80 xl:w-64 overflow-hidden rounded-lg bg-gray-200">
                                            <img
                                                alt={product.name}
                                                src={product.image}
                                                className="h-full w-full object-cover object-center hover:opacity-70"
                                            />
                                        </div>
                                        <h3 className="mt-4 text-sm text-blue-600 font-medium">{product?.category?.name}</h3>
                                        <h3 className="mt-1 text-lg font-bold">{product.name}</h3>
                                        <h3 className="text-sm text-gray-700">{product?.reviews?.length} {product?.reviews?.length > 1 ? 'reseñas' : 'reseña'}</h3>
                                        <p className="mt-3 text-base font-medium text-gray-800">RD$ {formatPrice(product?.price)}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 px-4 sm:hidden">
                        <Link to={userSession ? `/tienda/productos/todos` : `/productos/todos`}
                            className="block text-sm font-semibold text-rose-600 hover:text-rose-500">
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
                                src="/store-hero.svg"
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                        <div className="relative bg-gray-900 bg-opacity-75 px-6 py-32 sm:px-12 sm:py-40 lg:px-16">
                            <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
                                <h2 id="social-impact-heading" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                    <span className="block sm:inline">Encuentra Tu </span>
                                    <span className="block sm:inline">Producto Perfecto</span>
                                </h2>
                                <p className="mt-3 text-xl text-white">
                                    Descubre Smartphones, Tablets, Smart Watches y todos los accesorios que necesitas.
                                </p>
                                <Link
                                    to={userSession ? "/tienda/productos/todos" : "/productos/todos"}
                                    className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:text-white hover:bg-rose-500 sm:w-auto"
                                >
                                    Ver los productos
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

                    <div className="mt-10 grid md:grid-cols-2 gap-3">

                        <Link to={userSession ? `/tienda/productos/android` : `/productos/android`} className="flex">
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

                        <Link to={userSession ? `/tienda/productos/ios` : `/productos/ios`} className="flex">
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

                        <Link to={userSession ? `/tienda/productos/ipad os` : `/productos/ipad os`} className="flex">
                            <div
                                aria-hidden="true"
                                className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg lg:aspect-h-6 lg:aspect-w-5 group-hover:opacity-90"
                            >
                                <img
                                    alt='IPADOS'
                                    src='/ipados.jpg'
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>
                        </Link>

                        <Link to={userSession ? `/tienda/productos/watch os` : `/productos/watch os`} className="flex">
                            <div
                                aria-hidden="true"
                                className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg lg:aspect-h-6 lg:aspect-w-5 group-hover:opacity-90"
                            >
                                <img
                                    alt='WATCHOS'
                                    src='/watchos.jpg'
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
                                    className="mt-8 block w-full rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-gray-900 hover:text-white hover:bg-rose-500 sm:w-auto"
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