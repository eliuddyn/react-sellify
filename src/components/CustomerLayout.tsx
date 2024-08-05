/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import db from '@/appwrite/databases'
import { Models } from 'appwrite'
import Header from './Header'
import Footer from './Footer'

const CustomerLayout = () => {

    const [allTheAndroidProducts, setAllTheAndroidProducts] = useState<Models.Document[]>([]);
    const [allTheIosProducts, setAllTheIosProducts] = useState<Models.Document[]>([]);

    useEffect(() => {
        getProductsByOperatingSystem()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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