function DatePicker({date, setDate}) {
    function prevDate() {
        const currentDate = new Date();
        const newDate = new Date(date);
        if (newDate < currentDate) return;
        newDate.setDate(newDate.getDate() - 1);
        setDate(newDate);
    }

    function nextDate() {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1);
        setDate(newDate);
    }

    const formattedDate = date.toLocaleDateString('hu-HU', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="flex justify-center select-none">
            <div className="flex flex-row gap-4">
                <div className="w-[50px] h-[50px] rounded-full bg-white border border-dark-green-octa shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all duration-300" onClick={() => prevDate()}>
                    <img src="./src/assets/chevron_left.svg" alt=""/>
                </div>
                <div className="cursor-pointer w-[200px] h-[50px] rounded-3xl bg-white border border-dark-green-octa shadow-md flex items-center justify-center font-semibold text-dark-green">{formattedDate}</div>
                <div className="w-[50px] h-[50px] rounded-full bg-white border border-dark-green-octa shadow-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all duration-300 " onClick={() => nextDate()}>
                    <img src="./src/assets/chevron_right.svg" alt=""/>
                </div>
            </div>
        </div>
    );
}

export default DatePicker;