import React, { useEffect, useState } from 'react';

export default function AlertComponent(props) {
    const [alert, setAlert] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setAlert(false);
        }, 3000);
    }, [props.message]);
    return (
        <>
            <div>{alert ? props.message : ""}</div>
        </>
    )
}
