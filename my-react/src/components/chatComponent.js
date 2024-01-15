import React, { useEffect, useState } from "react";
import { socket } from '../socketio';
import MessageBoxComponent from "./messageBoxComponent";
import AlertComponent from "./alertComponent";

export default function ChatComponent() {
    // const [isConnected, setIsConnected] = useState(socket.connected);

    const [name, setName] = useState("")
    const [nameEdit, setNameEdit] = useState("")
    const [socketId, setSocketId] = useState(socket.id)

    const [messages, setMessages] = useState([]);

    const [msgInput, setMsgInput] = useState("")

    const [msgAlert, setMsgAlert] = useState("")

    const [isJoined, setIsJoined] = useState(false)

    const [isEditName, setIsEditName] = useState(false)


    useEffect(() => {
        // no-op if the socket is already connected
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {

        function onAlertEvent(value) {
            console.log("onAlert", value);
            setMsgAlert(value);
        }

        function onMessage(value) {
            console.log(value);
            setMessages((prevMessage) => [...prevMessage, value]);

        }

        function onIsJoined(value) {
            console.log(value);
            setIsJoined(value);
            setSocketId(socket.id);

        }

        function onEditNameCallback(value) {
            if (value) {
                setName(value);
                setIsEditName(false);
            }
            setMsgAlert("CAN NOT CHANGE USERNAME");

        }

        socket.on('isJoined', onIsJoined);

        socket.on('statusAlert', onAlertEvent);

        socket.on('receiveMessage', onMessage);

        socket.on('edit-name-callback', onEditNameCallback);


        return () => {
            socket.off('isJoined', onIsJoined);

            socket.off('statusAlert', onAlertEvent);

            socket.off('receiveMessage', onMessage);

            socket.off('edit-name-callback', onEditNameCallback);

        };
    }, []);


    const toggleEditName = () => {
        setIsEditName((prevIsEditName) => !prevIsEditName)
    }


    const handleJoinRoom = () => {
        socket.emit('join', name);
        console.log("SOCKET", socket)
    }

    const handleChangeName = (e) => {
        console.log('change name', e.target.value);
        setName(e.target.value)
    }

    const handleChangeNameEdit = (e) => {
        setNameEdit(e.target.value)
    }

    const handleLogOut = (e) => {
        window.location.reload(false);
    }

    const handleChangeMsg = (e) => {
        console.log('change msg', e.target.value);
        setMsgInput(e.target.value);
    }

    const handleSendMsg = () => {
        socket.emit('sendMsg', msgInput)
        //Clear Input
        setMsgInput("");

    }

    const handleEditName = () => {
        socket.emit('edit-name', nameEdit)
    }

    return (
        <div className="chat-container">

            {name && isJoined &&
                <div className="head">
                    <div>
                        {!isEditName ?
                            <h1 className="head-name">User : {name}</h1>
                            :
                            <input name="name-edit" className="left-edit" placeholder="Enter Your Name" value={nameEdit} onChange={handleChangeNameEdit} />
                        }
                    </div>
                    <div className="btn-container">
                        {!isEditName ?
                            <button className="btn-user" onClick={toggleEditName}>Edit Name</button>
                            :
                            <button className="btn-user" onClick={handleEditName}>OK</button>
                        }
                        <button className="btn-user" onClick={handleLogOut}>Log Out</button>
                    </div>
                </div>
            }
            {/* {alert &&
                <AlertComponent message={alert} />} */}
            <MessageBoxComponent messageList={messages} currentUserId={socketId} />
            <div className="input-container">
                <br />
                {!isJoined ?
                    <div className="input-name">
                        <input name="name" className="left" placeholder="Enter Your Name" value={name} onChange={handleChangeName} />
                        <button type="submit" className="right" onClick={handleJoinRoom}>
                            Enter
                        </button>
                    </div>
                    :
                    <div className="input-message">

                        <input name="msg" className="left" value={msgInput} onChange={handleChangeMsg} />
                        <button type="submit" className="right" disabled={!msgInput} onClick={handleSendMsg}>
                            Send Message
                        </button>
                    </div>
                }

            </div>
            <div className="bottom">
                <AlertComponent message={msgAlert} />
            </div>
        </div>
    );
}