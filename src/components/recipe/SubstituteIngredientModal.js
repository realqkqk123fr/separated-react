import React, { useState } from 'react';
import './modals/Modals.css';
import './SubstituteIngredientModal.css';
import { recipeAPI } from '../../services/api';

const SubstituteIngredientModal = ({ recipeName, recipeId, onClose, onSuccess }) => {
  const [originalIngredient, setOriginalIngredient] = useState('');
  const [substituteIngredient, setSubstituteIngredient] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [newRecipe, setNewRecipe] = useState(null);

  // 원래 재료 입력 핸들러
  const handleOriginalChange = (e) => {
    setOriginalIngredient(e.target.value);
    setError(''); // 입력 시 오류 메시지 초기화
  };

  // 대체 재료 입력 핸들러
  const handleSubstituteChange = (e) => {
    setSubstituteIngredient(e.target.value);
    setError(''); // 입력 시 오류 메시지 초기화
  };

  // 대체 재료 요청 핸들러 (수정됨)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!originalIngredient.trim() || !substituteIngredient.trim()) {
      setError('원래 재료와 대체 재료를 모두 입력해주세요.');
      return;
    }

    // 같은 재료인지 확인
    if (originalIngredient.trim().toLowerCase() === substituteIngredient.trim().toLowerCase()) {
      setError('같은 재료로는 대체할 수 없습니다.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('대체 재료 요청 시작:', {
        originalIngredient,
        substituteIngredient,
        recipeName,
        recipeId
      });

      // 대체 재료 API 호출
      const response = await recipeAPI.substituteIngredient({
        originalIngredient: originalIngredient.trim(),
        substituteIngredient: substituteIngredient.trim(),
        recipeName,
        recipeId
      });
      
      console.log('대체 재료 API 응답:', response);
      
      // 응답 확인
      const responseData = response.data;
      
      // 응답이 없거나 빈 응답인 경우
      if (!responseData) {
        console.error('빈 응답 수신');
        setError('서버에서 응답을 받지 못했습니다. 다시 시도해주세요.');
        return;
      }

      // 대체 불가 메시지 확인 (강화된 검사)
      const isSubstituteFailure = 
        // 명시적 실패 플래그 확인
        responseData.substituteFailure === true ||
        responseData.success === false ||
        
        // 설명 문구에서 실패 키워드 검사
        (responseData.description && (
          responseData.description.includes("적절하지 않") || 
          responseData.description.includes("생성할 수 없") ||
          responseData.description.includes("대체할 수 없") ||
          responseData.description.includes("불가능") ||
          responseData.description.includes("적절하지 않아") ||
          responseData.description.includes("유사도") ||
          responseData.description.includes("레시피를 생성할 수 없습니다")
        )) || 
        
        // 메시지 필드에서 실패 키워드 검사
        (responseData.message && (
          responseData.message.includes("대체할 수 없") ||
          responseData.message.includes("적절하지 않") ||
          responseData.message.includes("불가능")
        )) ||
        
        // 필수 데이터 누락 확인
        (!responseData.ingredients || responseData.ingredients.length === 0) ||
        (!responseData.instructions || responseData.instructions.length === 0) ||
        (!responseData.name || responseData.name.trim() === '') ||
        
        // 이름에 실패 표시가 포함된 경우
        (responseData.name && (
          responseData.name.includes("적절하지 않") ||
          responseData.name.includes("생성할 수 없")
        ));
      
      if (isSubstituteFailure) {
        // 대체 재료 사용 실패로 처리
        let errorMessage = '';
        
        if (responseData.description) {
          errorMessage = responseData.description;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else {
          errorMessage = `${originalIngredient}를 ${substituteIngredient}로 대체할 수 없습니다. 재료의 특성이 너무 달라 적절한 레시피를 만들 수 없습니다.`;
        }
        
        console.log('대체 실패 감지:', errorMessage);
        setError(errorMessage);
        
        // 실패 정보를 포함하여 콜백 호출 (채팅에 오류 메시지 표시용)
        if (onSuccess) {
          onSuccess({
            success: false,
            message: errorMessage,
            description: responseData.description || responseData.message
          });
        }
        
        // 5초 후 모달 자동 닫기 (사용자가 오류를 읽을 시간 제공)
        setTimeout(() => {
          onClose();
        }, 5000);
        
        return;
      }
      
      // 성공 처리 - 더 상세한 정보 포함
      console.log('대체 성공:', responseData);
      setNewRecipe(responseData);
      setSuccess(true);
      
      // 대체 정보 추가
      const substitutionDetails = {
        original: originalIngredient,
        substitute: substituteIngredient,
        similarityScore: responseData.substitutionInfo?.similarityScore,
        estimatedAmount: responseData.substitutionInfo?.estimatedAmount
      };
      
      // 성공 콜백 호출 - 상세 정보 포함
      if (onSuccess) {
        onSuccess({
          ...responseData,
          success: true,
          substitutionInfo: substitutionDetails
        });
      }

      // 성공 시 3초 후 모달 자동 닫기
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (err) {
      console.error('대체 재료 요청 오류:', err);
      
      let errorMessage = '대체 재료 처리 중 오류가 발생했습니다.';
      
      // HTTP 상태 코드별 오류 처리
      if (err.response) {
        const status = err.response.status;
        const responseData = err.response.data;
        
        console.log('HTTP 오류 상태:', status);
        console.log('오류 응답 데이터:', responseData);
        
        switch (status) {
          case 400:
            errorMessage = responseData?.error || 
                          responseData?.message || 
                          '잘못된 요청입니다. 재료명을 다시 확인해주세요.';
            break;
          case 404:
            errorMessage = '요청한 레시피를 찾을 수 없습니다.';
            break;
          case 500:
            errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 503:
            errorMessage = 'AI 서비스가 일시적으로 이용할 수 없습니다. 잠시 후 다시 시도해주세요.';
            break;
          default:
            errorMessage = `서버 오류가 발생했습니다 (${status}). 다시 시도해주세요.`;
        }

        // 응답 본문에 대체 실패 정보가 있는 경우
        if (responseData && (responseData.substituteFailure || responseData.success === false)) {
          errorMessage = responseData.message || responseData.description || errorMessage;
        }
      } else if (err.request) {
        // 네트워크 오류
        errorMessage = '네트워크 연결을 확인해주세요. 인터넷 연결이 불안정하거나 서버에 접근할 수 없습니다.';
      } else if (err.message && err.message.includes('timeout')) {
        // 타임아웃 오류
        errorMessage = '요청 시간이 초과되었습니다. AI 처리에 시간이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
      
      // 오류 정보를 포함하여 콜백 호출
      if (onSuccess) {
        onSuccess({
          success: false,
          message: errorMessage
        });
      }

      // 오류 시 5초 후 모달 자동 닫기
      setTimeout(() => {
        onClose();
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content substitute-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{recipeName} - 대체 재료</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {success ? (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <h4>레시피가 성공적으로 업데이트되었습니다!</h4>
              
              <div className="substitution-details">
                <p className="substitution-summary">
                  <strong className="original-ingredient">{originalIngredient}</strong>
                  <span className="arrow"> → </span>
                  <strong className="substitute-ingredient">{substituteIngredient}</strong>
                </p>
                
                {newRecipe?.substitutionInfo?.similarityScore && (
                  <p className="similarity-info">
                    재료 유사도: <strong>{(newRecipe.substitutionInfo.similarityScore * 100).toFixed(1)}%</strong>
                  </p>
                )}
                
                {newRecipe?.substitutionInfo?.estimatedAmount && (
                  <p className="amount-info">
                    권장 수량: <strong>{newRecipe.substitutionInfo.estimatedAmount}</strong>
                  </p>
                )}
              </div>
              
              <p className="recipe-description">{newRecipe?.description}</p>
              
              {newRecipe?.ingredients && newRecipe.ingredients.length > 0 && (
                <div className="updated-ingredients-preview">
                  <h5>업데이트된 주요 재료</h5>
                  <ul>
                    {newRecipe.ingredients.slice(0, 5).map((ingredient, index) => (
                      <li key={index} className={ingredient.name.toLowerCase().includes(substituteIngredient.toLowerCase()) ? 'highlighted' : ''}>
                        <span className="ingredient-name">{ingredient.name}</span>
                        <span className="ingredient-amount">{ingredient.amount}</span>
                      </li>
                    ))}
                    {newRecipe.ingredients.length > 5 && (
                      <li className="more-ingredients">외 {newRecipe.ingredients.length - 5}개 재료</li>
                    )}
                  </ul>
                </div>
              )}
              
              <button className="close-modal-button" onClick={onClose}>
                확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={`substitute-form ${loading ? 'loading' : ''}`}>
              {error && (
                <div className="error-message" role="alert">
                  <strong>⚠️ 대체 불가능</strong>
                  <p>{error}</p>
                  <p className="error-hint">다른 재료를 시도해보시거나, 더 비슷한 특성을 가진 재료를 선택해주세요.</p>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="originalIngredient">대체할 재료</label>
                <input
                  type="text"
                  id="originalIngredient"
                  value={originalIngredient}
                  onChange={handleOriginalChange}
                  placeholder="예: 버터, 당근, 밀가루"
                  required
                  disabled={loading}
                  className={error && !originalIngredient.trim() ? 'error' : ''}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="substituteIngredient">대체 재료</label>
                <input
                  type="text"
                  id="substituteIngredient"
                  value={substituteIngredient}
                  onChange={handleSubstituteChange}
                  placeholder="예: 마가린, 시금치, 쌀가루"
                  required
                  disabled={loading}
                  className={error && !substituteIngredient.trim() ? 'error' : ''}
                />
              </div>
              
              <div className="form-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="cancel-button"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading || !originalIngredient.trim() || !substituteIngredient.trim()}
                >
                  {loading ? '처리 중...' : '대체 레시피 생성'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubstituteIngredientModal;