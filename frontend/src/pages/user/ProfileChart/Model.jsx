import React from "react";

function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
                <button onClick={onClose} className="float-right text-gray-600 hover:text-gray-900">
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

export default Modal;