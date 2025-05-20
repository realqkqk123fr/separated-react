import React, { useState } from 'react';
import { recipeAPI } from '../../../services/api';

function SatisfactionModal({ recipeId, recipeName, onClose, onSubmitSuccess }) {
  const [rating, setRating] = useState(5); // 기본값 5점
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // 별점 변경 핸들러
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };
  
  // 코멘트 변경 핸들러
  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
  
  // 만족도 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 로딩 상태 설정
    setLoading(true);
    setError(null);

    console.log('만족도 평가 제출 - 레시피 ID:', recipeId); // 디버깅 로그 추가
  
    if (!recipeId) {
      setError('레시피 ID가 없습니다. 다시 시도해주세요.');
      setLoading(false);
      return;
    }
      
    try {
      // 만족도 데이터 생성
      const satisfactionData = {
        rate: rating,
        comment: comment
      };
      
      // API 호출
      await recipeAPI.submitSatisfaction(recipeId, satisfactionData);
      
      // 성공 처리
      setSuccess(true);
      
      // 부모 컴포넌트에 성공 알림
      if (onSubmitSuccess) {
        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 1500);
      } else {
        setTimeout(() => {
          onClose();
        }, 1500);
      }
      
    } catch (err) {
      console.error('만족도 평가 제출 오류:', err);
      setError(err.message || '만족도 평가 제출에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content satisfaction-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{recipeName} 만족도 평가</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="satisfaction-content">
          {success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <p>만족도 평가가 성공적으로 제출되었습니다!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="rating-container">
                <p className="rating-label">별점을 선택해주세요:</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'filled' : 'empty'}`}
                      onClick={() => handleRatingChange(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="rating-text">{rating}/5</div>
              </div>
              
              <div className="comment-container">
                <label htmlFor="comment">코멘트 (선택사항):</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="레시피에 대한 의견을 남겨주세요..."
                  rows="4"
                ></textarea>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={onClose}
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? '제출 중...' : '평가 제출'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SatisfactionModal;