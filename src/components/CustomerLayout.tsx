/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import db from '@/appwrite/databases'
import { Models, Query } from "appwrite";
import Header from './Header'
import Footer from './Footer'
import useSellifyStore from '@/store/user'

const CustomerLayout = () => {

    const [allTheAndroidProducts, setAllTheAndroidProducts] = useState<Models.Document[]>([]);
    const [allTheIosProducts, setAllTheIosProducts] = useState<Models.Document[]>([]);
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)

    useEffect(() => {
        getAllCartItems()
        getProductsByOperatingSystem()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAllCartItems = async () => {
        const cartItems = await db.cartItems.list([
            Query.equal('customer', customerInSession?.id as string),
            Query.equal("purchased", "NO")
        ]);

        let theCartItems: Models.Document | any = [];
        let unvailableCartItems: Models.Document | any = [];

        cartItems?.documents?.forEach((ci: Models.Document) => {

            if (ci?.product[0]?.status === 'DISPONIBLE' && ci?.product[0]?.quantity >= ci?.quantity) {
                theCartItems.push(ci)

            } else {
                unvailableCartItems.push(ci)
            }
        });

        setCustomerCartItemsInSession(theCartItems, 'login')
    }

    const getProductsByOperatingSystem = async () => {

        let androidProducts: any[] = []
        let iosProducts: any[] = []

        const products = await db.products.list();

        products.documents?.map((product: Models.Document) => {

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

        // <div className='grid grid-rows-[auto_1fr_auto] min-h-dvh'>
        <div className=''>
            {/* HEADER */}
            <Header androidProducts={allTheAndroidProducts} iosProducts={allTheIosProducts} />

            {/* CHILDREN */}
            <Outlet />

            {/* FOOTER */}
            <Footer />
        </div>
    )
}

export default CustomerLayout