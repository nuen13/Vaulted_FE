import React from 'react';







const ProgressFilter = () => {
    const statusOptions = ['Planning', 'Completed', 'Watching', 'Paused', 'Dropped'];


    return (
        <div className="d-flex flex-column align-items-end p-2">
            <button className="btn m-1 btn-dark align-self-start">
                All
            </button>
            {statusOptions.map((status) => (
                <button key={status} className="btn m-1 btn-outline-dark border-0 align-self-start">
                    {status}
                </button>
            ))}
        </div>
    );


};

export default ProgressFilter;





