import { useContext, useEffect, useState,useRef} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import uniqBy from 'lodash/uniqBy';
import { UserContext } from "./UserContext";
import axios from "axios";

export default function Chat(){
    const [ws,setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const [selectedUserId,setSelectedUserId] = useState(null);
    const [newMessageText,setNewMessageText] = useState('');
    const [messages,setMessages] = useState([]);
    const {username,id} = useContext(UserContext);
    const divUnderMessages = useRef();
    useEffect(()=>{
        connectToWs();
    },[selectedUserId]);
    function connectToWs(){
        const ws = new WebSocket('ws://localhost:8800');
        setWs(ws);
        ws.addEventListener('message',handleMessage);
        ws.addEventListener('close',()=>{
            setTimeout(()=>{
                console.log('Disconnected. Trying to reconnect');
                connectToWs();
            },1000);
        });
    }

    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId,username})=>{
            people[userId] = username;
        });
        setOnlinePeople(people);
    }

    function handleMessage(e){
        const messageData = JSON.parse(e.data);
        console.log({e,messageData});
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        }else if('text' in messageData){
            // if(messageData.sender === selectedUserId){
                setMessages(prev=>([...prev, {...messageData}]));
            // }
        }
    }

    function sendMessage(e){
        e.preventDefault();
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev=>([...prev,{
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now(),
        }]));
    }

    useEffect(()=>{
        const div = divUnderMessages.current ;
        if(div){
            div.scrollIntoView({behaviour:'smooth',block:'end'});
        }
    }, [messages]);

    useEffect(() => {
        axios.get('/people').then(res=>{
            const offlinePeople = res.data
            .filter(p => p._id !== id)
            .filter(p => !Object.keys(onlinePeople).includes(p._id));
            console.log(offlinePeople);
        });
    }, [onlinePeople]);

    useEffect(()=>{
        if(selectedUserId){
            axios.get('/messages/'+selectedUserId).then(res =>{
                setMessages(res.data);
            });
        }
    },[selectedUserId]);

    function selectContact(userId){
        setSelectedUserId(userId);
    }

    const onlinePeopleExcluOurUser = {...onlinePeople};
    delete onlinePeopleExcluOurUser[id] ;
    const messagesWithOutDupes = uniqBy(messages, '_id') ;

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
                            <Avatar online={true} username={onlinePeople[userId]} userId={userId}/>
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
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithOutDupes.map(message=>(
                                    <div key={message._id} className={(message.sender===id ? 'text-right' : 'text-left')}>
                                        <div className={"text-left inline-block p-2 my-0.5 rounded-md text-sm " +(message.sender=== id ? 'bg-blue-500 text-white':'bg-white text-gray-500')}>{message.text}
                                    </div>
                                </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
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