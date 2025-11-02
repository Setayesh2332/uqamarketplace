import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabaseClient";


const AuthContext = createContext({
    session: null,
    user: null,
    loading: true
})

export function AuthProvider({children}) {
const [session, setSession] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return // si la session utilisateur existe déja ==> isMoutend = false
        setSession(data.session ?? null) 
        setLoading(false) 
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession) 
    })

    return () =>  {  
        isMounted = false   //Raw function
        subscription.subscription.unsubscribe()
    }
}, [])

const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading

}), [session, loading])

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}


export function useAuth() {
    return useContext(AuthContext)
}