import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import chatbotCloud from "@/assets/chatbot-cloud.png";

const Chatbot = () => {
  const handleChatbotClick = () => {
    window.open("https://chatgpt.com/g/g-690c5b245b2c81919efafe3052e7ccfd-indian-income-tax-consultant", "_blank");
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.5 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={handleChatbotClick}
        className="h-16 w-16 rounded-full shadow-[var(--shadow-gold)] bg-gradient-to-br from-primary to-accent p-0 overflow-hidden"
        size="icon"
      >
        <motion.img 
          src={chatbotCloud} 
          alt="AI Assistant" 
          className="w-12 h-12 object-contain"
          animate={{ 
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Button>
    </motion.div>
  );
};

export default Chatbot;
