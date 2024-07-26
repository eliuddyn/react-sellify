import {
    CircleUser,
    Home,
    Package2,
    ShoppingCart,
    Users,
    BaggageClaim,
    ChartBarStacked
} from "lucide-react"

export const adminNavigation = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: Home,
    },
    {
        title: 'Categorías',
        url: '/categorias',
        icon: ChartBarStacked,
    },
    {
        title: 'Productos',
        url: '/productos',
        icon: Package2,
    },
    {
        title: 'Órdenes',
        url: '/ordenes',
        icon: ShoppingCart,
    },
    {
        title: 'Clientes',
        url: '/clientes',
        icon: Users,
    },
]

export const customerNavigation = [
    {
        title: 'Dashboard',
        url: '/my_dashboard',
        icon: Home,
    },
    {
        title: 'Perfil',
        url: '/perfil',
        icon: CircleUser,
    },
    {
        title: 'Pedidos',
        url: '/pedidos',
        icon: BaggageClaim,
    },
    {
        title: 'Carrito',
        url: '/carrito',
        icon: ShoppingCart,
    }
]
