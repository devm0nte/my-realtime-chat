import React, { useEffect, useRef } from 'react';

export default function MessageBoxComponent({ messageList, currentUserId }) {
    const bottomRef = useRef(null);

    const msgBoxList = messageList.map((obj) => {
        console.log(obj.id, currentUserId);
        return <div key={obj.datetime} className={currentUserId === obj.id ? "message-box-me" : "message-box"}>
            <p className='message-box-sender'>{obj.username}</p>
            <p className='message-box-message'>{obj.message}</p>
        </div>
    })

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messageList]);
    return (
        <>
            <div className='box'>
                {msgBoxList}
                <div ref={bottomRef}></div>

            </div>
        </>
    )
}