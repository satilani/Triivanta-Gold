import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MESSAGE_DATA, EMPLOYEE_DATA } from '../constants';
import { Message, Employee } from '../types';
import Card from './ui/Card';

const Messaging: React.FC = () => {
    // Hardcode the current user's ID for this demo.
    const currentUserId = 'EMP-001';

    const [messages, setMessages] = useState<Message[]>(MESSAGE_DATA);
    const [selectedUserId, setSelectedUserId] = useState<string | null>('EMP-003');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const employeeMap = useMemo(() => {
        return new Map(EMPLOYEE_DATA.map(emp => [emp.id, emp]));
    }, []);

    const conversationPartners = useMemo(() => {
        const partnerIds = new Set<string>();
        messages.forEach(msg => {
            if (msg.senderId === currentUserId) partnerIds.add(msg.receiverId);
            if (msg.receiverId === currentUserId) partnerIds.add(msg.senderId);
        });
        
        return Array.from(partnerIds)
            .map(id => employeeMap.get(id))
            .filter((emp): emp is Employee => emp !== undefined)
            .map(emp => {
                const conversationMessages = messages
                    .filter(m => (m.senderId === emp.id && m.receiverId === currentUserId) || (m.senderId === currentUserId && m.receiverId === emp.id))
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                
                const lastMessage = conversationMessages[conversationMessages.length - 1];
                const unreadCount = conversationMessages.filter(m => m.receiverId === currentUserId && !m.read).length;
                
                return {
                    ...emp,
                    lastMessage,
                    unreadCount,
                };
            })
            .sort((a, b) => {
                if (!a.lastMessage) return 1;
                if (!b.lastMessage) return -1;
                return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
            });
    }, [messages, currentUserId, employeeMap]);

    const activeConversation = useMemo(() => {
        if (!selectedUserId) return [];
        return messages
            .filter(msg => (msg.senderId === currentUserId && msg.receiverId === selectedUserId) || (msg.senderId === selectedUserId && msg.receiverId === currentUserId))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages, selectedUserId]);

    const handleSelectUser = (userId: string) => {
        setSelectedUserId(userId);
        // Mark messages as read
        setMessages(prevMessages => 
            prevMessages.map(msg => 
                msg.senderId === userId && msg.receiverId === currentUserId ? { ...msg, read: true } : msg
            )
        );
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        const message: Message = {
            id: `msg-${Date.now()}`,
            senderId: currentUserId,
            receiverId: selectedUserId,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
            read: false,
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');
    };
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation]);

    const selectedEmployee = selectedUserId ? employeeMap.get(selectedUserId) : null;

    return (
        <Card className="p-0">
            <div className="flex flex-col md:flex-row h-[calc(100vh-10rem)]">
                {/* Contacts/Conversations List */}
                <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-brand-border flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-brand-border">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-brand-text">Conversations</h2>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversationPartners.map(user => (
                            <div key={user.id} onClick={() => handleSelectUser(user.id)}
                                className={`flex items-center p-3 cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-brand-accent/10 dark:bg-brand-accent/20' : 'hover:bg-slate-100 dark:hover:bg-brand-border/50'}`}>
                                <div className="relative">
                                    <img src={user.photoUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                                </div>
                                <div className="ml-4 flex-grow">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-slate-800 dark:text-brand-text">{user.name}</p>
                                        {user.lastMessage && <p className="text-xs text-slate-400 dark:text-brand-text-secondary">{new Date(user.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-slate-500 dark:text-brand-text-secondary truncate w-4/5">{user.lastMessage?.text}</p>
                                        {user.unreadCount > 0 && <span className="bg-brand-accent text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{user.unreadCount}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-grow flex flex-col bg-slate-50 dark:bg-brand-dark">
                    {selectedEmployee ? (
                        <>
                            <div className="p-4 border-b border-slate-200 dark:border-brand-border flex items-center">
                                <img src={selectedEmployee.photoUrl} alt={selectedEmployee.name} className="h-10 w-10 rounded-full object-cover mr-3" />
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-brand-text">{selectedEmployee.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-brand-text-secondary">{selectedEmployee.role}</p>
                                </div>
                            </div>

                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {activeConversation.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === currentUserId ? 'bg-brand-accent text-white' : 'bg-white dark:bg-brand-secondary text-slate-800 dark:text-brand-text'}`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 ${msg.senderId === currentUserId ? 'text-white/70' : 'text-slate-400 dark:text-brand-text-secondary'} text-right`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-brand-border bg-white dark:bg-brand-secondary">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full bg-slate-100 dark:bg-brand-dark border-slate-300 dark:border-brand-border rounded-full p-2 px-4 focus:ring-brand-accent focus:border-brand-accent text-sm"
                                    />
                                    <button type="submit" className="bg-brand-accent hover:bg-brand-accent-light text-white font-bold p-2 rounded-full flex items-center justify-center transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-grow flex items-center justify-center text-center text-slate-500 dark:text-brand-text-secondary">
                            <div>
                                <h3 className="text-lg font-semibold">Select a conversation</h3>
                                <p>Choose a colleague from the list to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default Messaging;