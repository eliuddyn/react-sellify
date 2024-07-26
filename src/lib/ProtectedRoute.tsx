/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate, Outlet } from 'react-router-dom'

import useSellifyStore from '@/store/user';

export const ProtectedRoute = () => {

    const userSession = useSellifyStore((state) => state.userSession)

    // console.log(userSession)

    return userSession !== null ? <Outlet /> : <Navigate to="/" />
}
