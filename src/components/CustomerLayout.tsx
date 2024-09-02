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

    const [allTheSmartphones, setAllTheSmartphones] = useState<Models.Document[]>([]);
    const [allTheTablets, setAllTheTablets] = useState<Models.Document[]>([]);
    const [allTheSmartWatches, setAllTheSmartWatches] = useState<Models.Document[]>([]);
    const [allTheAccesories, setAllTheAccesories] = useState<Models.Document[]>([]);
    const customerInSession = useSellifyStore((state) => state.customerInSession)
    const setCustomerCartItemsInSession = useSellifyStore((state) => state.setCustomerCartItemsInSession)

    useEffect(() => {
        getAllCartItems()
        getProductsByCategory()
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

    const getProductsByCategory = async () => {

        let smartphones: any[] = []
        let tablets: any[] = []
        let smartWatches: any[] = []
        let accesories: any[] = []

        const products = await db.products.list();

        products.documents?.map((product: Models.Document) => {

            if (product?.category?.name === 'CELULARES') {
                smartphones.push(product)
            }

            if (product?.category?.name === 'TABLETS') {
                tablets.push(product)
            }

            if (product?.category?.name === 'SMART WATCHES') {
                smartWatches.push(product)
            }

            if (product?.category?.name === 'ACCESORIOS') {
                accesories.push(product)
            }
        })

        setAllTheSmartphones(smartphones)
        setAllTheTablets(tablets)
        setAllTheSmartWatches(smartWatches)
        setAllTheAccesories(accesories)
    }

    return (

        // <div className='grid grid-rows-[auto_1fr_auto] min-h-dvh'>
        <div className=''>
            {/* HEADER */}
            <Header
                theSmartphones={allTheSmartphones}
                theTablets={allTheTablets}
                theSmartwatches={allTheSmartWatches}
                theAccesories={allTheAccesories}
            />

            {/* CHILDREN */}
            <Outlet />

            {/* FOOTER */}
            <Footer />
        </div>
    )
}

export default CustomerLayout