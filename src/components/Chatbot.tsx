import { Button } from "@/components/ui/button";
import chatbotCloud from "@/assets/chatbot-cloud.png";

const Chatbot = () => {
  const handleChatbotClick = () => {
    window.open("https://chatgpt.com/g/g-690c5b245b2c81919efafe3052e7ccfd-indian-income-tax-consultant", "_blank");
  };

  return (
    <Button
      onClick={handleChatbotClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-[var(--shadow-gold)] bg-gradient-to-br from-primary to-accent hover:scale-110 transition-transform p-0 overflow-hidden"
      size="icon"
    >
      <img 
        src={chatbotCloud} 
        alt="AI Assistant" 
        className="w-12 h-12 object-contain"
      />
    </Button>
  );
};

export default Chatbot;
