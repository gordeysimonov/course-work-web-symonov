import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../css/Chat.css';
import { PlayerContext } from '../context/PlayerContext';

const Chats = ({ user }) => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [musicFiles, setMusicFiles] = useState([]);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});

    const location = useLocation();
    const openChatId = location.state?.openChatId;

    const messagesEndRef = useRef(null);
    const { playTrack } = useContext(PlayerContext);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // ==============================
    // Загрузка чатов
    // ==============================
    useEffect(() => {
        if (!user?.sub) return;

        const fetchChats = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8080/api/chats/user/${user.sub}`
                );
                setChats(response.data);
            } catch (err) {
                console.error('Error fetching chats:', err);
                setError('Не вдалося завантажити чати.');
            }
        };

        fetchChats();
    }, [user]);

    // ==============================
    // Загрузка unreadCounts
    // ==============================
    useEffect(() => {
        if (!user?.sub || chats.length === 0) return;

        const fetchUnreadCounts = async () => {
            const unreadMap = {};
            for (let chat of chats) {
                try {
                    const res = await axios.get(
                        `http://localhost:8080/api/messages/unread/${chat.id}`,
                        { params: { userId: user.sub } }
                    );
                    unreadMap[String(chat.id)] = res.data; // ключ как строка
                } catch (err) {
                    console.error('Error fetching unread count:', err);
                    unreadMap[String(chat.id)] = 0;
                }
            }
            setUnreadCounts(unreadMap);
        };

        fetchUnreadCounts();
    }, [chats, user?.sub]);

    // ==============================
    // Загрузка треков
    // ==============================
    useEffect(() => {
        axios.get('http://localhost:8080/api/music-files')
            .then((response) => setMusicFiles(response.data))
            .catch((err) => {
                console.error('Error fetching music files:', err);
                setError('Не вдалося завантажити музичні файли.');
            });
    }, []);

    // ==============================
    // Открытие чата из профиля
    // ==============================
    useEffect(() => {
        if (openChatId && chats.length > 0) {
            const chatToOpen = chats.find(c => c.id === openChatId);
            if (chatToOpen) selectChat(chatToOpen);
        }
    }, [chats, openChatId]);

    // ==============================
    // Выбор чата
    // ==============================
    const selectChat = async (chat) => {
        setSelectedChat(chat);

        try {
            const response = await axios.get(
                `http://localhost:8080/api/messages/chat/${chat.id}`
            );

            setMessages(response.data);

            // 🔴 Отмечаем все сообщения как прочитанные
            await axios.put(
                `http://localhost:8080/api/messages/read/${chat.id}`,
                null,
                { params: { userId: user.sub } }
            );

            // Обновляем локальные счётчики непрочитанных
            setUnreadCounts(prev => ({
                ...prev,
                [String(chat.id)]: 0
            }));

        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    // ==============================
    // Отправка сообщения
    // ==============================
    const recalcUnreadCounts = (chatsArr, currentUserId) => {
        const newCounts = {};
        for (let chat of chatsArr) {
            newCounts[String(chat.id)] = chat.messages?.filter(
                msg => msg.sender?.id !== currentUserId && !msg.read
            ).length || 0;
        }
        return newCounts;
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const responsePost = await axios.post(
                'http://localhost:8080/api/messages',
                null,
                {
                    params: {
                        chatId: selectedChat.id,
                        senderId: user.sub,
                        content: newMessage
                    }
                }
            );

            const newMsg = responsePost.data;

            // Обновляем сообщения в правой панели
            setMessages(prev =>
                [...prev.map(msg => ({ ...msg, read: true })), newMsg]
            );

            // Обновляем чат в списке чатов
            setChats(prevChats =>
                prevChats.map(c =>
                    c.id === selectedChat.id
                        ? { ...c, messages: [...(c.messages || []).map(msg => ({ ...msg, read: true })), newMsg] }
                        : c
                )
            );

            // Пересчитываем непрочитанные
            setUnreadCounts(prev => recalcUnreadCounts([...chats], user.sub));

            setNewMessage('');

            // Помечаем чат на сервере как прочитанный
            await axios.put(
                `http://localhost:8080/api/messages/read/${selectedChat.id}`,
                null,
                { params: { userId: user.sub } }
            );

        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!user?.sub) {
        return (
            <div style={{ color: 'white', padding: '20px' }}>
                Авторизуйтесь для перегляду чатів
            </div>
        );
    }

    const findTrackFromMessage = (msgContent) => {
        const match = msgContent.match(/\/music-file\/(\d+)/);
        if (!match) return null;
        const trackId = Number(match[1]);
        return musicFiles.find(file => file.id === trackId);
    };

    return (
        <div className="chat-page">

            {/* ================= LEFT SIDE ================= */}
            <div className="chat-list">
                {chats.map(chat => {
                    const otherUser = chat.participants?.find(
                        p => String(p.id) !== String(user.sub)
                    );

                    const lastMsg = chat.messages?.[chat.messages.length - 1];

                    let lastMessageText = "Немає повідомлень";
                    let lastMessageTime = "";

                    if (lastMsg) {
                        lastMessageText = lastMsg.content.length > 25
                            ? lastMsg.content.slice(0, 25) + "..."
                            : lastMsg.content;

                        const date = new Date(lastMsg.sentAt);
                        if (!isNaN(date.getTime()))
                            lastMessageTime = date.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                    }

                    return (
                        <div
                            key={chat.id}
                            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                            onClick={() => selectChat(chat)}
                        >
                            <div className="chat-avatar">
                                {otherUser?.id ? (
                                    <Link to={`/user-profile/${otherUser.id}`}>
                                        <img
                                            src={`http://localhost:8080/api/users/${otherUser.id}/image`}
                                            alt={otherUser.name}
                                            className="avatar-img"
                                        />
                                    </Link>
                                ) : (
                                    <span>?</span>
                                )}
                            </div>

                            <div className="chat-info">
                                <div className="chat-name">
                                    {otherUser?.name || "Unknown"}
                                </div>

                                <div className="chat-last">
                                    {lastMessageText}
                                    {lastMessageTime &&
                                        <span className="chat-last-time">{lastMessageTime}</span>
                                    }
                                </div>
                            </div>

                            {/* 🔵 Синяя точка напротив чата */}
                            {unreadCounts[String(chat.id)] > 0 && (
                                <div className="chat-unread-dot"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ================= RIGHT SIDE ================= */}
            <div className="chat-window">
                {selectedChat ? (
                    <>
                        <div className="messages-container">
                            {messages.map(msg => {
                                const isMyMessage =
                                    String(msg.sender?.id) === String(user.sub);

                                let time = "";
                                if (msg.sentAt) {
                                    const date = new Date(msg.sentAt);
                                    if (!isNaN(date.getTime()))
                                        time = date.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });
                                }

                                const track = findTrackFromMessage(msg.content);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`message-row ${isMyMessage ? 'my-row' : 'other-row'}`}
                                    >
                                        <div
                                            className={`message-bubble ${isMyMessage ? 'my-message' : 'other-message'}`}
                                        >
                                            {!track &&
                                                <div className="message-content">
                                                    {msg.content}
                                                </div>
                                            }

                                            {track && (
                                                <div style={{ margin: '10px 0' }}>
                                                    <strong>{track.title}</strong>
                                                    <button
                                                        className="play-btn"
                                                        onClick={() =>
                                                            playTrack({
                                                                id: track.id,
                                                                src: `http://localhost:8080/api/music-files/${track.id}`,
                                                                coverImage: track.coverImage,
                                                                title: track.title
                                                            })
                                                        }
                                                    >
                                                        ▶ Play
                                                    </button>
                                                </div>
                                            )}

                                            {time &&
                                                <div className="message-time">
                                                    {time}
                                                </div>
                                            }
                                        </div>

                                        {!isMyMessage && !msg.read && (
                                            <div className="message-unread-dot"></div>
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="message-input-container">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Введіть повідомлення..."
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") sendMessage();
                                }}
                            />
                            <button onClick={sendMessage}>
                                Надіслати
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat">Виберіть чат</div>
                )}
            </div>
        </div>
    );
};

export default Chats;