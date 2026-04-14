import { useDispatch, useSelector } from 'react-redux';
import { setStatus, fetchMediaByCategoryAndStatus } from '../../features/media/media-slice';

const ProgressFilter = () => {
    const statusOptions = ['Planning', 'Completed', 'Consuming', 'Paused', 'Dropped'];
    const dispatch = useDispatch();

    // Get BOTH current values from Redux
    const selectedStatus = useSelector((state) => state.media.selectedStatus);
    const selectedCategory = useSelector((state) => state.media.selectedCategory);

    const handleStatusClick = (status) => {
        dispatch(setStatus(status));
        console.log("Selected Category ID:", selectedCategory, "Selected Status from Redux:", selectedStatus);
        dispatch(fetchMediaByCategoryAndStatus({ 
            categoryId: selectedCategory, 
            status: status 
        }));
    };

    return (
        <div className="d-flex flex-column align-items-end p-2">
            <button 
                className={`btn m-1 ${selectedStatus === null ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`} 
                onClick={() => handleStatusClick(null)}
            >
                All
            </button>
            {statusOptions.map((status) => (
                <button 
                    key={status} 
                    className={`btn m-1 ${selectedStatus === status ? 'btn-dark' : 'btn-outline-dark'} border-0 align-self-start`}
                    onClick={() => handleStatusClick(status)}
                >
                    {status}
                </button>
            ))}
        </div>
    );
};

export default ProgressFilter;