import { useContext, useEffect, useState} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
// import uniqBy from "lodash" ;
import uniqBy from 'lodash/uniqBy';
import { UserContext } from "./UserContext";

export default function Chat(){
    const [ws,setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [newMessageText,setNewMessageText] = useState(null);
    const [messages,setMessages] = useState([]);
    const {username,id} = useContext(UserContext);
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:8800');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
    },[]);

    function handleMessage(e){
        const messageData = JSON.parse(e.data);
        console.log({e,messageData});
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        }else if('text' in messageData){
            setMessages(prev=>([...prev,{...messageData}]));
        }
    }

    const messagesWithOutDupes = uniqBy(messages,'id') ;

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId,username})=>{
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function selectContact(userId){
        setSelectedUserId(userId);
    }

    function sendMessage(e){
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev=>([...prev,{text: newMessageText,isOur:true}]));
    }

    const onlinePeopleExcluOurUser = {...onlinePeople};
    delete onlinePeopleExcluOurUser[id] ;

    return(
        <div className="flex h-screen">
            <div className="bg-blue-100 w-1/3">
                <Logo/>
                {Object.keys(onlinePeopleExcluOurUser).map(userId=>(
                    <div key={userId} onClick={()=>selectContact(userId)} className={"border-b border-gray-100  flex items-center gap-2 cursor-pointer "+(userId === selectedUserId ? 'bg-blue-300':'')}>
                        {userId === selectedUserId && (
                            <div className="w-2 bg-blue-500 h-12"></div>
                        )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                            <Avatar username={onlinePeople[userId]} userId={userId}/>
                            <span className="text-gray-800">{onlinePeople[userId]}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-300 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId &&(
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-600">&larr; Start chatting by selecting someone who is currently online😊😀</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div>
                            {messagesWithOutDupes.map(message=>(
                                <div>{message.text}</div>
                            ))}
                        </div>
                    )}
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text"
                            value={newMessageText} onChange={e=>setNewMessageText(e.target.value)} 
                            placeholder="Type your message here" className="bg-white border p-2 flex-grow rounded-sm"/>
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}