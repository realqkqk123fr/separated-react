import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import './RecipeChat.css';
import './RecipeChatCompact.css'; // 컴팩트 모드용 추가 스타일

const RecipeChat = ({ user, isAuthenticated, initialRecipe, compactMode = false }) => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [connecting, setConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [initialMessageAdded, setInitialMessageAdded] = useState(false); // 초기 메시지 추가 여부 추적

  const messagesEndRef = useRef(null);

  // 컴포넌트 마운트 시 채팅 연결 설정
  useEffect(() => {
    console.log("채팅 컴포넌트 마운트 - 연결 설정");
    
    // 시스템 메시지 초기화
    setMessages([
      {
        username: 'system',
        message: '채팅 서버에 연결 중...'
      }
    ]);

    // 채팅 연결 설정
    const setupConnection = () => {
      // 연결 성공 콜백
      const onConnected = () => {
        setConnecting(false);
        setConnectionError(false);
        
        // 시스템 메시지 추가
        setMessages(prevMessages => [
          ...prevMessages,
          {
            username: 'system',
            message: '채팅 서버에 연결되었습니다. 레시피에 대해 질문해보세요!'
          }
        ]);
        
        // 인증 상태에 따른 메시지
        if (!chatService.isAuthenticated()) {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              username: 'system',
              message: '로그인하시면 개인화된 답변을 받을 수 있습니다.'
            }
          ]);
        }
      };

      // 연결 오류 콜백
      const onError = (error) => {
        console.error('WebSocket 연결 오류:', error);
        setConnecting(false);
        setConnectionError(true);
        
        // 시스템 오류 메시지 추가
        setMessages(prevMessages => [
          ...prevMessages,
          {
            username: 'system',
            message: '채팅 서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
          }
        ]);
      };

      // 메시지 수신 콜백
      const messageCallback = (message) => {
        console.log('채팅 메시지 수신:', message);

        // 세션 ID가 있으면 저장
        if (message.sessionId) {
          console.log('세션 ID 업데이트:', message.sessionId);
          setSessionId(message.sessionId);
        }

        setMessages(prevMessages => [...prevMessages, message]);
      };

      // 메시지 콜백 등록 및 연결
      chatService.registerMessageCallback(messageCallback);
      chatService.connect(onConnected, onError);

      // 컴포넌트 언마운트 시 정리
      return () => {
        console.log('채팅 컴포넌트 정리 - 연결 종료');
        chatService.unregisterMessageCallback(messageCallback);
        chatService.disconnect();
      };
    };

    return setupConnection();
  }, []);

  // initialRecipe가 제공되면 첫 메시지로 추가 - 중복 방지 로직 추가
  useEffect(() => {
    if (initialRecipe && !initialMessageAdded) { // 초기 메시지가 아직 추가되지 않았을 때만 실행
      console.log("초기 레시피 메시지 추가:", initialRecipe.name);
      
      // 연결 상태 확인
      if (!connecting && !connectionError) {
        // AI 레시피 안내 메시지 추가
        const recipeMessage = {
          username: 'AI 요리사',
          message: `안녕하세요! "${initialRecipe.name}" 레시피에 관한 질문이 있으시면 물어보세요.`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => {
          // 이미 동일한 메시지가 있는지 확인
          const isDuplicate = prevMessages.some(msg => 
            msg.username === 'AI 요리사' && 
            msg.message.includes(initialRecipe.name)
          );
          
          // 중복이 아닌 경우에만 메시지 추가
          if (!isDuplicate) {
            return [...prevMessages, recipeMessage];
          }
          return prevMessages;
        });
        
        // 초기 메시지 추가 상태 업데이트
        setInitialMessageAdded(true);
      }
    }
  }, [initialRecipe, connecting, connectionError, initialMessageAdded]);

  // 메시지 스크롤 관리
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 입력 핸들러
  const handleMessageChange = (e) => {
    setCurrentMessage(e.target.value);
  };

  // 메시지 전송 핸들러
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!currentMessage.trim()) {
      return;
    }
    
    if (!chatService.isConnected()) {
      alert('채팅 서버에 연결되어 있지 않습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    // 사용자 메시지 추가
    const userMessage = {
      username: user?.username || 'me',
      message: currentMessage,
      sentByMe: true
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // WebSocket으로 메시지 전송 (세션 ID 포함)
    const sent = chatService.sendMessage(currentMessage, null, sessionId);
    
    if (sent) {
      // 입력 필드 초기화
      setCurrentMessage('');
    } else {
      // 메시지 전송 실패 시 알림
      setMessages(prevMessages => [
        ...prevMessages,
        {
          username: 'system',
          message: '메시지 전송에 실패했습니다. 연결 상태를 확인해주세요.'
        }
      ]);
    }
  };

  // 다시 연결 시도 핸들러
  const handleReconnect = () => {
    setConnecting(true);
    setConnectionError(false);
    setMessages([
      {
        username: 'system',
        message: '채팅 서버에 다시 연결 중...'
      }
    ]);
    
    chatService.connect(
      () => {
        setConnecting(false);
        setConnectionError(false);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            username: 'system',
            message: '채팅 서버에 다시 연결되었습니다.'
          }
        ]);
      },
      (error) => {
        console.error('WebSocket 재연결 오류:', error);
        setConnecting(false);
        setConnectionError(true);
        setMessages(prevMessages => [
          ...prevMessages,
          {
            username: 'system',
            message: '채팅 서버 재연결에 실패했습니다. 잠시 후 다시 시도해주세요.'
          }
        ]);
      }
    );
  };

  // 채팅창 하단으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 메시지 렌더링 함수
  const renderMessage = (message, index) => {
    const isSystem = message.username === 'system';
    const isError = message.messageType === 'error';
    const isSentByMe = message.sentByMe || (user && message.username === user.username);
    
    return (
      <div 
        key={index} 
        className={`message-container ${isSystem ? 'system-message' : 
                     isError ? 'error-message' : 
                     isSentByMe ? 'sent-message' : 'received-message'}`}
      >
        {!isSystem && (
          <div className="message-username">{isSentByMe ? '나' : message.username}</div>
        )}
        
        <div className="message-content">
          <div className="message-text">{message.message}</div>
          
          {message.imageUrl && (
            <div className="message-image-container">
              <img 
                src={message.imageUrl} 
                alt="채팅 이미지" 
                className="message-image" 
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-container ${compactMode ? 'compact-mode' : ''}`}>
      <div className="chat-header">
        <h2>AI 요리 챗봇</h2>
      </div>
      
      <div className="chat-messages">
        {connecting ? (
          <div className="chat-connecting">
            <p>채팅 서버에 연결 중...</p>
          </div>
        ) : connectionError ? (
          <div className="chat-error">
            <p>채팅 서버에 연결할 수 없습니다.</p>
            <button onClick={handleReconnect}>다시 연결</button>
          </div>
        ) : (
          <>
            {messages.map((message, index) => renderMessage(message, index))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <div className="chat-input-container">
          <input
            type="text"
            value={currentMessage}
            onChange={handleMessageChange}
            placeholder={isAuthenticated ? "레시피에 대해 물어보세요..." : "로그인 후 메시지를 입력할 수 있습니다"}
            disabled={connecting || connectionError || !isAuthenticated}
          />
          
          <button
            type="submit"
            disabled={!currentMessage.trim() || connecting || connectionError || !isAuthenticated}
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeChat;