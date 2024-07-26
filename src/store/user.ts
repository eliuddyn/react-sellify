/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand'
import { Models } from 'appwrite'
import { devtools, persist } from 'zustand/middleware'

type UserState = {
    userSession: Models.Session | object | null;
    setUserSession: (newUserSession: Models.Session | Models.User<Models.Preferences> | null) => void;
}

const useSellifyStore = create<UserState>()(

    devtools(
        persist(
            (set) => ({
                userSession: null,
                setUserSession: (newUserSession: Models.Session | Models.User<Models.Preferences> | null) => set(
                    { userSession: newUserSession }
                )
            }),
            { name: "sellify_zustand_user_Store" }
        )
    )
)

export default useSellifyStore;
