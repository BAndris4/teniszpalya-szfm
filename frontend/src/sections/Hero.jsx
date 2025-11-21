import { useState, useEffect } from 'react';
import { useReserveMenu } from '../contexts/ReserveMenuContext';

function Hero() {
    const [displayedText, setDisplayedText] = useState('');
    const fullText = 'Your game. Your court. Just a tap away.';
    const typingSpeed = 100;
    const [isLoaded, setIsLoaded] = useState(false);
    
    const { _, setIsReserveMenuVisible } = useReserveMenu();

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);
        let currentIndex = 0;
        setTimeout(() => {
            const typeTimer = setInterval(() => {
                if (currentIndex <= fullText.length) {
                    setDisplayedText(fullText.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typeTimer);
                }
            }, typingSpeed);
            
            return () => clearInterval(typeTimer);
        }, 700);
    }, []);
    
    return (
        <div>
            <div className="w-full flex justify-center">
                <div className='mt-[60px] mb-[60px] relative z-10 flex flex-row gap-[70px]'>
                    <div className={`bg-[url(/src/assets/tennis_court.jpg)] bg-cover bg-center w-[565px] h-[565px] rounded-[30px] cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}></div>
                        
                    <div className='flex flex-col justify-around my-[120px]'>
                        <div className='flex flex-col gap-[15px] mb-[20px]'>
                            <div data-testid="typewriter" className={`text-[40px] font-bold text-dark-green leading-tight min-h-[120px] max-w-[500px] transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                                {displayedText}
                                {displayedText.length < fullText.length && (
                                    <span className="animate-pulse">|</span>
                                )}
                            </div>
                            <div className={`text-[18px] text-dark-green-half leading-relaxed transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                                Turn your passion for tennis into action. Book courts easily and <br/> 
                                spend more time doing what you love — playing the game.
                            </div>
                        </div>
                            
                        <div className='flex flex-row'>
                            <div className={`group flex items-center gap-[8px] pl-[24px] pr-[24px] pt-[14px] pb-[14px] text-[16px] bg-green text-white font-semibold rounded-[30px] mr-[20px] cursor-pointer hover:bg-dark-green hover:shadow-lg transition-all duration-500 active:scale-95 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`} onClick={() => setIsReserveMenuVisible(true)} >
                                <span>Reserve</span>
                                <svg className='w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
                                </svg>
                            </div>
                            
                            <div className={`px-[32px] py-[16px] text-[16px] bg-white border-dark-green text-dark-green border rounded-[30px] cursor-pointer hover:bg-dark-green hover:text-white transition-all duration-500 active:scale-95 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`} onClick={() => {
                                document.getElementById("Courts").scrollIntoView({
                                    behavior: "smooth",
                                    block: "start"
                                });
                            }}>
                                View Courts
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Hero;