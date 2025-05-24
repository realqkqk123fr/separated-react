// 새로운 컴포넌트: RecipeUpdateNotification.js
import React, { useState, useEffect } from 'react';
import './RecipeUpdateNotification.css';

const RecipeUpdateNotification = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose,
  substitutionInfo 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // 애니메이션 완료 후 제거
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`recipe-update-notification ${type} ${visible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <div className="notification-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        
        <div className="notification-body">
          <div className="notification-message">{message}</div>
          
          {substitutionInfo && (
            <div className="substitution-summary">
              <span className="original-ingredient">{substitutionInfo.original}</span>
              <span className="arrow"> → </span>
              <span className="substitute-ingredient">{substitutionInfo.substitute}</span>
              
              {substitutionInfo.similarityScore && (
                <span className="similarity-badge">
                  {(substitutionInfo.similarityScore * 100).toFixed(0)}% 유사
                </span>
              )}
            </div>
          )}
        </div>
        
        <button 
          className="notification-close" 
          onClick={() => {
            setVisible(false);
            setTimeout(() => {
              if (onClose) onClose();
            }, 300);
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// RecipeViewWithChat.js에서 사용할 훅
export const useRecipeNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // 자동 제거
    setTimeout(() => {
      removeNotification(id);
    }, notification.duration || 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSubstituteSuccess = (originalIngredient, substituteIngredient, additionalInfo = {}) => {
    addNotification({
      type: 'success',
      message: '레시피가 성공적으로 업데이트되었습니다!',
      substitutionInfo: {
        original: originalIngredient,
        substitute: substituteIngredient,
        ...additionalInfo
      },
      duration: 4000
    });
  };

  const showSubstituteError = (message) => {
    addNotification({
      type: 'error',
      message: message || '대체 재료 처리 중 오류가 발생했습니다.',
      duration: 4000
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSubstituteSuccess,
    showSubstituteError
  };
};

// RecipeViewWithChat.js 수정된 부분
import { useRecipeNotification } from './RecipeUpdateNotification';

const RecipeViewWithChat = ({ user, isAuthenticated }) => {
  // ... 기존 상태들 ...
  const { 
    notifications, 
    removeNotification, 
    showSubstituteSuccess, 
    showSubstituteError 
  } = useRecipeNotification();

  // 대체 재료 성공 처리 개선
  const handleSubstituteSuccess = (substituteResult) => {
    if (substituteResult && substituteResult.success) {
      console.log('대체 재료 성공, 레시피 업데이트:', substituteResult);
      
      // 현재 레시피를 새로운 대체 레시피로 업데이트
      const updatedRecipe = {
        ...recipe,
        id: substituteResult.id || recipe.id,
        name: substituteResult.name || recipe.name,
        description: substituteResult.description || recipe.description,
        ingredients: substituteResult.ingredients || recipe.ingredients,
        instructions: substituteResult.instructions || recipe.instructions
      };
      
      // 레시피 상태 업데이트
      setRecipe(updatedRecipe);
      
      // 로컬 스토리지도 업데이트
      localStorage.setItem(LOCAL_STORAGE_RECIPE_KEY, JSON.stringify(updatedRecipe));
      
      // 성공 알림 표시
      showSubstituteSuccess(
        substituteResult.substitutionInfo?.original || '재료',
        substituteResult.substitutionInfo?.substitute || '대체재료',
        {
          similarityScore: substituteResult.substitutionInfo?.similarityScore,
          estimatedAmount: substituteResult.substitutionInfo?.estimatedAmount
        }
      );
      
      console.log('레시피 업데이트 완료:', updatedRecipe);
    } else {
      // 실패 알림 표시
      showSubstituteError(substituteResult?.message || '대체 재료 처리에 실패했습니다.');
    }
    
    setShowSubstitute(false);
  };

  return (
    <div className="recipe-view-container">
      {/* 알림 표시 영역 */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <RecipeUpdateNotification
            key={notification.id}
            {...notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
      
      {/* 기존 레시피 표시 부분 */}
      <div className="recipe-view-left-panel">
        {/* ... 기존 코드 ... */}
      </div>
      
      <div className="recipe-view-right-panel">
        <RecipeChat 
          user={user} 
          isAuthenticated={isAuthenticated} 
          initialRecipe={recipe}
          compactMode={true}
        />
      </div>
    </div>
  );
};

export default RecipeViewWithChat;