/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, Outlet } from 'react-router-dom'
import useSellifyStore from '@/store/user';

export const PublicRoute = () => {

    const userSession = useSellifyStore((state) => state.userSession)

    //console.log(userSession)

    return userSession === null ? <Outlet /> : userSession?.prefs?.role === 'Admin' ? <Navigate to="/dashboard" /> : <Navigate to="/my_dashboard" />
}
