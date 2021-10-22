import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContexData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void;
}

export const AuthContext = createContext({} as AuthContexData)

type AuthProvider = {
    children: ReactNode;
}

type AuthResponse = {
    token: string;
    user: {
      id: string;
      avatar_url: string;
      name: string;
      login: string;
    }
  }
  

export function AuthProvider(props: AuthProvider) {
    const [ user, setUser] = useState<User | null>(null)

    const signInUrl = `http://github.com/login/oauth/authorize?scope=user&client_id=71cef1d885be3f2d8bd0`;
 
    async function signIn (githubCode: string) {
     const response = await api.post<AuthResponse>('authenticate', {
       code: githubCode,
     })

     console.log("response ", response )
   
   
     const { token, user } = response.data
   
     localStorage.setItem('@dowhile:token', token);

     api.defaults.headers.common.authorization = `Bearer ${token}`;

   
     setUser(user)
    }
    
    function signOut() {
        setUser(null)
        localStorage.removeItem('@dowhile:token')
    }


    useEffect(() => {
        const token = localStorage.getItem('@dowhile:token')
        
        if (token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;
            
            
            api.get<User>('profile').then(Response => {
                setUser(Response.data);
            })
        }
    
    }, [])
   
    useEffect(() => {
      const url = window.location.href;
      const hasGithubCode = url.includes('?code=');
   
      if (hasGithubCode) {
        const [urlwithoutCode, githubCode] = url.split('?code=') 
     
        window.history.pushState({}, '', urlwithoutCode);
   
        signIn(githubCode)
       }
     }, [])

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
        {props.children}
    </AuthContext.Provider>
  );
}