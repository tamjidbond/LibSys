import { motion } from "framer-motion";

const Popup = ({ type, message, onClose }) => {
  const isSuccess = type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-sm w-full text-center">
        {isSuccess ? (
          <>
            <div className="text-green-500 text-5xl">✔</div>
            <h2 className="text-xl font-bold text-green-600 mt-3">SUCCESS</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={onClose}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <div className="text-red-500 text-5xl">😞</div>
            <h2 className="text-xl font-bold text-red-600 mt-3">ERROR!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button
              onClick={onClose}
              className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Popup; 