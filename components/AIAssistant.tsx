import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { Service } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, services }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the AI chat session
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a detailed system instruction
    const serviceList = services.map(s => `- ${s.name}: ${s.description} ราคา ${s.price} บาท ใช้เวลา ${s.duration} นาที`).join('\n');
    const systemInstruction = `You are a friendly and professional AI assistant for "ChaiLai Nails & Spa". Your name is Chai-AI.
    Your goal is to help customers with their questions about services, promotions, and general information.
    Do not answer questions unrelated to the nail spa.
    Always be polite and use Thai language.
    Here is the list of available services:
    ${serviceList}
    
    The spa is open from 10:00 to 20:00 daily.
    Promotions are announced on the homepage.
    You cannot book appointments, but you can guide users to the booking page.`;

    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
    setChat(chatSession);

    // Initial message from the assistant
    setMessages([
        { role: 'model', text: 'สวัสดีค่ะ Chai-AI ยินดีให้บริการค่ะ มีอะไรให้ช่วยไหมคะ? ถามเกี่ยวกับบริการของเราได้เลยค่ะ' }
    ]);
  }, [services]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await chat.sendMessageStream({ message: input });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '...' }]); // Placeholder for streaming

      for await (const chunk of responseStream) {
        modelResponse += chunk.text;
        // Update the last message in the array with the streaming content
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => {
        const newMessages = prev.filter(msg => msg.text !== '...');
        return [...newMessages, { role: 'model', text: 'ขออภัยค่ะ เกิดข้อผิดพลาดบางอย่าง โปรดลองอีกครั้ง' }];
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50 flex items-end justify-end p-4 sm:p-6" onClick={onClose} aria-modal="true" role="dialog">
        <div 
          className="w-full max-w-md h-[80vh] sm:h-[70vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b bg-pink-50 rounded-t-2xl">
            <h3 className="text-xl font-bold text-black">Chai-AI Assistant</h3>
            <button onClick={onClose} className="text-black/50 hover:text-black" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-rose-50/50 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-pink-500 text-white rounded-br-none' : 'bg-gray-200 text-black rounded-bl-none'}`}>
                  {msg.text.split('\n').map((line, i) => <p key={i} className="whitespace-pre-wrap">{line || ' '}</p>)}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.text === '...' && (
               <div className="flex justify-start">
                <div className="max-w-sm px-4 py-2 rounded-2xl bg-gray-200 text-black rounded-bl-none">
                  <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="สอบถามเกี่ยวกับบริการ..."
                className="flex-1 block w-full px-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                disabled={isLoading}
                aria-label="Chat input"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 disabled:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                aria-label="Send message"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
       <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default AIAssistant;
