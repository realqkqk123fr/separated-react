import React, { useState, useEffect } from 'react';

function CookingAssistant({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // 자동 이동 옵션을 위한 상태 추가
  const [autoAdvance, setAutoAdvance] = useState(true);
  const steps = recipe && recipe.instructions ? recipe.instructions : [];
  
  // 현재 단계의 조리 시간 구하기 (초 단위)
  const getCurrentStepCookingTimeSeconds = () => {
    if (!steps || steps.length === 0 || currentStep >= steps.length) return 300; // 기본값 5분
    
    const currentInstruction = steps[currentStep];
    
    // 초 단위 값이 있으면 사용
    if (currentInstruction.cookingTimeSeconds) {
      return currentInstruction.cookingTimeSeconds;
    }
    
    // 초 단위 값이 없으면 분 단위에서 변환
    return (currentInstruction.cookingTime || 5) * 60;
  };
  
  // 타이머 설정
  const startTimer = () => {
    if (isTimerRunning) return;
    
    const seconds = getCurrentStepCookingTimeSeconds();
    setTimeRemaining(seconds);
    setIsTimerRunning(true);
    
    const interval = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          
          // 타이머 완료 시 알림음
          try {
            const audio = new Audio('/timer-alarm.mp3');
            audio.play().catch(e => console.log('타이머 알림음 재생 오류:', e));
          } catch (e) {
            console.log('알림음 재생 오류:', e);
          }
          
          // 자동 이동이 켜져 있고, 마지막 단계가 아닌 경우에만 다음 단계로 이동
          if (autoAdvance && currentStep < steps.length - 1) {
            setTimeout(() => {
              goToNextStep();
            }, 1500);
          }
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(interval);
  };
  
  // 자동 이동 옵션 토글 핸들러
  const toggleAutoAdvance = () => {
    setAutoAdvance(!autoAdvance);
  };

  // 타이머 취소
  const cancelTimer = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setIsTimerRunning(false);
    setTimeRemaining(0);
  };
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timer]);
  
  // 다음 단계로 이동
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (isTimerRunning) {
        cancelTimer();
      }
    }
  };
  
  // 이전 단계로 이동
  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (isTimerRunning) {
        cancelTimer();
      }
    }
  };
  
  // 현재 단계 표시 형식
  const formatStepCount = () => {
    return `${currentStep + 1}/${steps.length}`;
  };
  
  // 시간 형식 변환 (초 -> 분:초)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // 조리 시간 표시 형식 (초 단위는 분:초로 변환)
  const formatCookingTime = (stepIndex) => {
    if (!steps || steps.length === 0 || stepIndex >= steps.length) return '5분';
    
    const step = steps[stepIndex];
    
    // 초 단위 값이 있으면 사용
    if (step.cookingTimeSeconds) {
      const mins = Math.floor(step.cookingTimeSeconds / 60);
      const secs = step.cookingTimeSeconds % 60;
      
      if (secs === 0) {
        return `${mins}분`;
      } else {
        return `${mins}분 ${secs}초`;
      }
    }
    
    // 초 단위 값이 없으면 분 단위만 표시
    return `${step.cookingTime || 5}분`;
  };
  
  // 레시피 총 조리 시간 계산
  const calculateTotalCookingTime = () => {
    if (!recipe) return '30분';
    
    if (recipe.totalCookingTimeSeconds) {
      const mins = Math.floor(recipe.totalCookingTimeSeconds / 60);
      const secs = recipe.totalCookingTimeSeconds % 60;
      
      if (secs === 0) {
        return `총 ${mins}분`;
      } else {
        return `총 ${mins}분 ${secs}초`;
      }
    } else if (recipe.totalCookingTime) {
      return `총 ${recipe.totalCookingTime}분`;
    } else if (steps && steps.length > 0) {
      // 각 단계 시간 합산
      let totalSeconds = 0;
      steps.forEach(step => {
        if (step.cookingTimeSeconds) {
          totalSeconds += step.cookingTimeSeconds;
        } else if (step.cookingTime) {
          totalSeconds += step.cookingTime * 60;
        } else {
          totalSeconds += 300; // 기본값 5분
        }
      });
      
      const mins = Math.floor(totalSeconds / 60);
      return `총 ${mins}분`;
    }
    
    return '총 30분'; // 기본값
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cooking-assistant-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{recipe.name || '레시피'} 요리 어시스턴스</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* 레이아웃 수정: 명확한 좌우 분할 구조 */}
        <div className="cooking-layout">
          {/* 왼쪽 패널: 메인 조리 단계와 컨트롤 */}
          <div className="main-content-area">
            {/* 조리 단계 내용 영역 */}
            <div className="step-content">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`step-item ${index === currentStep ? 'active' : ''}`}
                  style={{ display: index === currentStep ? 'block' : 'none' }}
                >
                  <div className="step-header">
                    <h4>Step {step.stepNumber || index + 1}</h4>
                    <div className="step-time">{formatCookingTime(index)}</div>
                  </div>
                  <p className="step-instruction">{step.instruction || '조리 단계'}</p>
                  
                  <div className="timer-display-area">
                    {isTimerRunning ? (
                      <div className="timer-running">
                        <div className="timer-display">{formatTime(timeRemaining)}</div>
                        <button onClick={cancelTimer} className="timer-cancel-button">
                          취소
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={startTimer}
                        className="timer-button"
                      >
                        {formatCookingTime(index)} 타이머 시작
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 하단 컨트롤 영역 */}
            <div className="controls-area">
              <div className="navigation-controls">
                <button 
                  onClick={goToPrevStep} 
                  disabled={currentStep === 0}
                  className="nav-button prev-button"
                >
                  이전
                </button>
                <span className="step-counter">
                  {formatStepCount()}
                </span>
                <button 
                  onClick={goToNextStep} 
                  disabled={currentStep === steps.length - 1}
                  className="nav-button next-button"
                >
                  다음
                </button>
              </div>
              
              <div className="auto-advance-option">
                <label className="auto-advance-label">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={toggleAutoAdvance}
                    className="auto-advance-checkbox"
                  />
                  <span>타이머 종료 후 자동으로 다음 단계 이동</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* 오른쪽 패널: 재료 사이드바 */}
          <div className="ingredients-sidebar">
            <h4>재료</h4>
            <ul className="ingredients-list">
              {(recipe.ingredients || []).map((ingredient, index) => (
                <li key={index} className="ingredient-item">
                  <span className="ingredient-name">{ingredient.name || '재료'}</span>
                  <span className="ingredient-amount">
                    {ingredient.amount || '적당량'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookingAssistant;