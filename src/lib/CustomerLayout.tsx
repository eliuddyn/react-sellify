import { account } from '@/appwrite/config'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import useSellifyStore from '@/store/user'

const CustomerLayout = () => {

    const navigate = useNavigate();
    const setUserSession = useSellifyStore((state) => state.setUserSession)

    const logoutUser = async () => {
        await account.deleteSession('current')
        setUserSession(null);
        navigate('/')
    }

    return (
        <div className='h-full flex items-center justify-center'>
            <Button
                variant='destructive'
                className='text-lg text-white'
                onClick={() => logoutUser()}
            >
                LOGOUT
            </Button>
        </div>
    )
}

export default CustomerLayout