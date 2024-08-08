/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
//import { Overview } from './dashboard/overview'
import RecentSales from './dashboard/recent-sales'
import PageHeader from "@/components/PageHeader"
import db from "@/appwrite/databases"
import { Models, Query } from "appwrite"
import { formatPrice } from "@/customFunctions/formatPrice"
import PieChartGender from "./dashboard/PieChartGender"

const AdminDashboardPage = () => {

    const [adminDashboardData, setAdminDashboardData] = useState<any>();

    useEffect(() => {
        getAdminDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getAdminDashboardData = async () => {

        // GETTING ALL ORDERS
        const orders = await db.orders.list([Query.orderDesc("orderDate")]);

        let allTotalAmount: number = 0;
        let allRecentSales: any[] = [];

        orders.documents.forEach((order: Models.Document) => {
            allTotalAmount += order?.totalAmount

            const myRecentSale = {
                orderID: order?.$id,
                customerNames: order?.customer?.names,
                customerLastnames: order?.customer?.lastnames,
                customerEmail: order?.customer?.email,
                customerGender: order?.customer?.gender,
                orderDate: order?.orderDate,
                totalAmount: order?.totalAmount,
            }

            allRecentSales.push(myRecentSale)
        })

        // GETTING ALL CUSTOMERS
        const customers = await db.customers.list();

        let totalFemaleCustomers: number = 0;
        let totalMaleCustomers: number = 0;

        customers.documents.forEach((customer: Models.Document) => {
            if (customer?.gender === 'F') { totalFemaleCustomers += 1 }
            if (customer?.gender === 'M') { totalMaleCustomers += 1 }
        })

        const customerData = {
            totalCustomers: customers.documents?.length,
            totalMaleCustomers,
            totalFemaleCustomers
        }

        // GETTING ALL PRODUCTS
        const products = await db.products.list();

        const dashboardData = {
            totalRevenue: allTotalAmount,
            totalSales: orders.documents?.length,
            recentSales: allRecentSales,
            customers: customerData,
            totalProducts: products.documents?.length,
        }

        setAdminDashboardData(dashboardData)
    }

    return (
        <>

            <PageHeader pageName="Dashboard" />

            <div className="flex-col md:flex">

                <div className="flex-1 space-y-4 pt-6">

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    INGRESOS TOTALES
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl lg:text-xl text-pink-800 font-bold">RD$ {formatPrice(adminDashboardData?.totalRevenue)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    CLIENTES
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-pink-800 font-bold">{adminDashboardData?.customers?.totalCustomers}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    PRODUCTOS
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-pink-800 font-bold">{adminDashboardData?.totalProducts}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">VENTAS</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <rect width="20" height="14" x="2" y="5" rx="2" />
                                    <path d="M2 10h20" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl text-pink-800 font-bold">{adminDashboardData?.totalSales}</div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <PieChartGender data={adminDashboardData?.customers} />

                        <Card>
                            <CardHeader>
                                <CardTitle>Ventas Recientes</CardTitle>
                                <CardDescription>
                                    {/* You made 265 sales this month. */}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSales data={adminDashboardData?.recentSales} />
                            </CardContent>
                        </Card>
                    </div>



                    {/* <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview />
                            </CardContent>
                        </Card>
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Ventas Recientes</CardTitle>
                                <CardDescription>
                                    
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentSales data={adminDashboardData?.recentSales} />
                            </CardContent>
                        </Card>
                    </div> */}

                </div>
            </div>
        </>
    )
}

export default AdminDashboardPage