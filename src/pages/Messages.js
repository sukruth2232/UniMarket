import React, { useState, useEffect, useRef } from 'react';
import { messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import s from './Messages.module.css';

export default function Messages() {
  const { user } = useAuth();
  const [convs, setConvs] = useState([]);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    messageAPI.getConversations()
      .then(r => setConvs(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!active) return;
    messageAPI.getConversation(active.conversationId)
      .then(r => setMsgs(r.data.data || []))
      .catch(() => {});
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMsg = async e => {
    e.preventDefault();
    if (!text.trim() || !active) return;
    setSending(true);
    try {
      const r = await messageAPI.send({ receiverId: active.otherUser.id, content: text });
      setMsgs(m => [...m, r.data.data]);
      setText('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.layout}>
        {/* Conversation list */}
        <aside className={s.sidebar}>
          <div className={s.sHead}><h2 className={s.sTitle}>Messages</h2></div>
          {loading ? (
            <div className={s.loading}>
              {Array(5).fill(0).map((_,i) => (
                <div key={i} className={s.convSk}>
                  <div className="skeleton" style={{width:42,height:42,borderRadius:'50%',flexShrink:0}}/>
                  <div style={{flex:1,display:'flex',flexDirection:'column',gap:6}}>
                    <div className="skeleton" style={{height:14,width:'60%'}}/>
                    <div className="skeleton" style={{height:12,width:'80%'}}/>
                  </div>
                </div>
              ))}
            </div>
          ) : convs.length === 0 ? (
            <div className={s.emptyConv}>
              <FiMessageSquare size={32} color="var(--t4)"/>
              <p>No conversations yet</p>
            </div>
          ) : (
            convs.map(c => (
              <button key={c.conversationId} className={`${s.conv} ${active?.conversationId === c.conversationId ? s.convActive : ''}`} onClick={() => setActive(c)}>
                <div className={s.convAvatar}>{c.otherUser?.username?.[0]?.toUpperCase()}</div>
                <div className={s.convInfo}>
                  <div className={s.convName}>{c.otherUser?.firstName || c.otherUser?.username}</div>
                  <div className={s.convLast}>{c.lastMessage?.content?.slice(0, 40)}{c.lastMessage?.content?.length > 40 ? '...' : ''}</div>
                  {c.productTitle && <div className={s.convProduct}>📦 {c.productTitle}</div>}
                </div>
                {c.unreadCount > 0 && <span className={s.unread}>{c.unreadCount}</span>}
              </button>
            ))
          )}
        </aside>

        {/* Chat window */}
        <main className={s.chat}>
          {!active ? (
            <div className={s.selectConv}>
              <FiMessageSquare size={48} color="var(--t4)"/>
              <h3>Select a conversation</h3>
              <p>Choose from your messages on the left</p>
            </div>
          ) : (
            <>
              <div className={s.chatHead}>
                <div className={s.chatAvatar}>{active.otherUser?.username?.[0]?.toUpperCase()}</div>
                <div>
                  <p className={s.chatName}>{active.otherUser?.firstName || active.otherUser?.username}</p>
                  {active.productTitle && <p className={s.chatProduct}>Re: {active.productTitle}</p>}
                </div>
              </div>

              <div className={s.messages}>
                {msgs.map(m => {
                  const mine = m.sender?.id === user?.id || m.sender?.username === user?.username;
                  return (
                    <div key={m.id} className={`${s.msg} ${mine ? s.mine : s.theirs}`}>
                      <div className={s.bubble}>{m.content}</div>
                      <span className={s.time}>{m.createdAt ? formatDistanceToNow(new Date(m.createdAt), {addSuffix:true}) : ''}</span>
                    </div>
                  );
                })}
                <div ref={bottomRef}/>
              </div>

              <form onSubmit={sendMsg} className={s.inputRow}>
                <input
                  className={`input ${s.msgInput}`}
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
                  <FiSend size={16}/>
                </button>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
