import { useState } from 'react';

export const useAlert = () => {
    const [alert, setAlert] = useState({ show: false, type: '', message: '' });

    const showAlert = (type, message) => {
        setAlert({ show: true, type, message });
        setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
    };

    return {
        alert,
        showAlert,
        setAlert
    };
};