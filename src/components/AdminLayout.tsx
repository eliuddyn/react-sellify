/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import useSellifyStore from '@/store/user'
import { account } from '@/appwrite/config'
import { adminNavigation } from '@/lib/routes'
import { cn } from '@/lib/utils'

const AdminLayout = () => {

    const navigate = useNavigate();
    //const userSession = useSellifyStore((state) => state.userSession)
    const setUserSession = useSellifyStore((state) => state.setUserSession)
    const [isSheetOpened, setIsSheetOpened] = useState<boolean>(false);
    const [alertDialogForLogout, setAlertDialogForLogout] = useState<boolean>(false);
    const location = useLocation();

    // console.log(userSession)

    const logoutUser = async () => {
        await account.deleteSession('current')
        setUserSession(null);
        localStorage.removeItem('slUserRole')
        navigate('/')
    }

    return (

        <>
            <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">

                {/* DESTKOP SIDEBAR */}
                <div className="hidden border-r border-gray-700 bg-slate-800 md:block h-screen sticky top-0">
                    <div className="flex h-full max-h-screen flex-col gap-2">
                        <div className="flex items-center justify-center px-4">
                            <div className="flex flex-col items-center py-1.5">

                                <img
                                    className="mx-auto rounded-xl"
                                    width={88}
                                    height={88}
                                    src="/logo.png"
                                    alt="Logo"
                                />

                                <span className="text-xl lg:text-2xl text-amber-400">Sellify eCommerce</span>
                            </div>
                            {/* <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button> */}
                        </div>
                        <div className="flex-1 border-t border-gray-700">
                            <nav className="grid gap-1 items-start px-2 py-5 text-xl font-medium lg:px-4">
                                {adminNavigation.map((item) => (
                                    <Link
                                        key={item.title}
                                        to={item.url}
                                        className={cn(
                                            item.url === location.pathname ? 'text-white bg-blue-600' : 'text-gray-200 hover:text-blue-400',
                                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.title}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div className="mt-auto p-4">
                            {/* <Button
                                size="sm"
                                className="w-full text-lg flex items-center justify-center gap-x-3 rounded-lg text-gray-200 hover:bg-rose-500"
                                onClick={() => setAlertDialogForLogout((prev: boolean) => prev = true)}
                            >
                                <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                                <span>SALIR</span>
                            </Button> */}
                            {/* <Card x-chunk="dashboard-02-chunk-0">
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle>Upgrade to Pro</CardTitle>
                                <CardDescription>
                                    Unlock all features and get unlimited access to our support
                                    team.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                <Button size="sm" className="w-full">
                                    Upgrade
                                </Button>
                            </CardContent>
                        </Card> */}
                        </div>

                    </div>
                </div>

                {/* MOBILE SIDEBAR */}
                <div className="flex flex-col">
                    <header className="flex h-14 items-center gap-4 border-b bg-slate-800 px-4 lg:h-[60px] lg:px-6">
                        <Sheet open={isSheetOpened} onOpenChange={setIsSheetOpened}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex flex-col bg-slate-800 border border-transparent">

                                <div className="flex items-center justify-center px-4">
                                    <div className="flex flex-col items-center py-1.5">

                                        <img
                                            className="mx-auto rounded-xl"
                                            width={88}
                                            height={88}
                                            src="/logo.png"
                                            alt="Logo"
                                        />

                                        <span className="text-xl lg:text-2xl text-amber-400">Sellify eCommerce</span>
                                    </div>
                                </div>

                                <nav className="grid gap-2 text-lg font-medium px-4">
                                    {adminNavigation.map((item) => (
                                        <Link
                                            key={item.title}
                                            to={item.url}
                                            onClick={() => setIsSheetOpened(false)}
                                            className={cn(
                                                item.url === location.pathname ? 'text-white bg-blue-600' : 'text-gray-200 hover:text-blue-400',
                                                "flex items-center gap-4 rounded-xl px-3 py-2 transition-all"
                                            )}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>

                                {/* <div className="mt-auto">

                                    {/* <Button
                                        size="sm"
                                        className="w-full text-lg flex items-center justify-center gap-x-3 rounded-lg text-gray-200 hover:bg-rose-500"
                                        onClick={() => setAlertDialogForLogout((prev: boolean) => prev = true)}
                                    >
                                        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        <span>SALIR</span>
                                    </Button> 

                                    <Card>
                                    <CardHeader>
                                        <CardTitle>Upgrade to Pro</CardTitle>
                                        <CardDescription>
                                            Unlock all features and get unlimited access to our
                                            support team.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button size="sm" className="w-full">
                                            Upgrade
                                        </Button>
                                    </CardContent>
                                </Card> 
                                </div> */}

                            </SheetContent>
                        </Sheet>
                        <div className="w-full flex items-center justify-end">
                            {/* <form>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search products..."
                                        className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                    />
                                </div>
                            </form> */}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    {/* <Button variant="secondary" size="icon" className="rounded-full">
                                        <CircleUser className="h-5 w-5" />
                                        <span className="sr-only">Toggle user menu</span>
                                    </Button> */}
                                    <Avatar className='cursor-pointer'>
                                        <AvatarImage src={undefined} alt="Foto" />
                                        <AvatarFallback className='text-gray-900 font-bold bg-amber-400'>
                                            <span className=''>A</span>
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel className='text-center'>Mi Cuenta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {/* <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuItem>Support</DropdownMenuItem> */}
                                    {/* <DropdownMenuSeparator /> */}
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
                        </div>

                    </header>
                    <main className="bg-slate-50 flex flex-1 flex-col gap-4 p-3 lg:gap-6 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* LOGOUT ALERTDIALOG */}
            <AlertDialog open={alertDialogForLogout} onOpenChange={setAlertDialogForLogout}>
                <AlertDialogContent className='bg-gray-300 border border-gray-600 flex flex-col items-center justify-between'>
                    <AlertDialogHeader className=''>
                        <AlertDialogTitle className='text-gray-800 text-2xl text-center'>¿Está seguro de salir?</AlertDialogTitle>
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

export default AdminLayout