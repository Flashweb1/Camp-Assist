import React, { useState, useEffect, useRef } from 'react';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import './ChatBox.css';

export default function ChatBox({ orderId, otherPartyName }) {
  const { currentUser, userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chats', orderId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', orderId, 'messages'), {
        senderId: currentUser.uid,
        senderName: userProfile?.name || 'User',
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
      setText('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <span className="chat__icon">💬</span>
        <span className="chat__title">Chat with {otherPartyName || 'them'}</span>
      </div>
      <div className="chat__messages">
        {messages.length === 0 && (
          <div className="chat__empty">No messages yet. Say hello 👋</div>
        )}
        {messages.map(msg => {
          const isMe = msg.senderId === currentUser.uid;
          return (
            <div key={msg.id} className={`chat__bubble ${isMe ? 'chat__bubble--me' : 'chat__bubble--them'}`}>
              {!isMe && <div className="chat__sender">{msg.senderName}</div>}
              <div className="chat__text">{msg.text}</div>
              <div className="chat__time">
                {msg.timestamp?.toDate
                  ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form className="chat__form" onSubmit={send}>
        <input
          className="chat__input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button type="submit" className="chat__send" disabled={!text.trim() || sending}>
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
