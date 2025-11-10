import { motion } from "framer-motion";

function CourtCard({ court, isSelected = false, onClick = () => {} }) {
    const id = court.id ?? court.ID ?? court.Id;
    return (
        <motion.div
            id={`court-${id}`}
            onClick={() => onClick(court)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(court); } }}
            whileHover={{ y: -6, scale: 1.02 }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className={`bg-white rounded-[24px] w-3xs border p-[23px] h-[380px] z-10 transition-all duration-300 group cursor-pointer ${isSelected ? 'border-green shadow-lg -translate-y-2' : 'border-gray-200 hover:shadow-lg hover:-translate-y-2 hover:border-green'}`}
        >
            <div className={`h-[220px] w-[212px] ${isSelected ? 'ring-2 ring-green/40' : ''} bg-green rounded-[10px] overflow-hidden relative transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1`}></div>
            <div className="pt-4">
                <h2 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isSelected ? 'text-green' : 'text-dark-green group-hover:text-green'}`}>
                    Tennis court #{id}
                </h2>
                <span className={`text-lg transition-all duration-300 ${isSelected ? 'text-dark-green' : 'text-dark-green-half group-hover:text-dark-green'}`}>
                    Type: {court.material}
                </span>
                <div className={`font-semibold mt-2 transition-all duration-300 ${isSelected ? 'text-dark-green' : 'text-dark-green-half group-hover:text-dark-green'}`}>
                    {court.outdoors ? "Outdoor" : "Indoor"}
                </div>
            </div>
        </motion.div>
    );
}

export default CourtCard;