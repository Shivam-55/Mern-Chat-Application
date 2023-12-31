import { useContext, useState } from "react"
import axios from "axios" ;
import { UserContext } from "./UserContext";

export default function Register(){
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
    const{setUsername:setLoggedInUsername,setId} = useContext(UserContext);
    async function handleSubmit(e){
        e.preventDefault();
        const url= isLoginOrRegister === 'register' ? 'register' : 'login' ;
        const {data} = await axios.post(url,{username,password});
        setLoggedInUsername(username);
        setId(data.id);
    }
    const settingUsername=(e)=>{
        setUsername(e.target.value);
    }
    const settingPassword=(e)=>{
        setPassword(e.target.value);
    }
    const settingIsLoginOrRegister=()=>{
        if(isLoginOrRegister==='register') setIsLoginOrRegister('login');
        else setIsLoginOrRegister('register');
    }
    return(
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-80 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={username} onChange={settingUsername} type="text" placeholder="UserName"       
                    className="block w-full rounded-sm p-2 mb-2 border"/>
                <input value={password} onChange={settingPassword} type="password" placeholder="Password" 
                    className="block w-full rounded-sm p-2 mb-2 border"/>
                <button className="block w-full bg-blue-500 text-white rounded-md p-2">
                    {isLoginOrRegister==='register'? 'Register' : 'Login'}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister==='register' && (
                        <div>Already Registered ?&nbsp;
                            <button className="underline" onClick={settingIsLoginOrRegister}>Login here</button>
                        </div>
                    )}
                    {isLoginOrRegister==='login' &&(
                        <div>Don't have an account !!&nbsp;
                            <button className="underline" onClick={settingIsLoginOrRegister}>Register here</button>
                        </div>
                    )}
                </div>
            </form>

        </div>
    );
}