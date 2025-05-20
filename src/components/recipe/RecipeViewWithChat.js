import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recipeAPI } from '../../services/api';
import RecipeChat from '../chat/RecipeChat';
import NutritionModal from '../recipe/modals/NutritionModal';
import CookingAssistant from '../recipe/modals/CookingAssistant';
import SatisfactionModal from '../recipe/modals/SatisfactionModal';
import SubstituteIngredientModal from '../recipe/SubstituteIngredientModal';
import './RecipeViewWithChat.css';

const RecipeViewWithChat = ({ user, isAuthenticated }) => {
  const location = useLocation();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNutrition, setShowNutrition] = useState(false);
  const [showAssistance, setShowAssistance] = useState(false);
  const [showSatisfaction, setShowSatisfaction] = useState(false);
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [satisfactionSubmitted, setSatisfactionSubmitted] = useState(false);

  // 레시피 데이터 초기화
  useEffect(() => {
    // location.state에서 레시피 데이터 확인
    if (location.state?.generatedRecipe) {
      console.log('레시피 데이터 확인:', location.state.generatedRecipe);
      setRecipe(location.state.generatedRecipe);
      setLoading(false);

      // state를 URL 히스토리에서 제거 (새로고침 시 중복 표시 방지)
      window.history.replaceState({}, document.title);
    } else {
      setError('레시피 데이터를 찾을 수 없습니다.');
      setLoading(false);
    }
  }, [location]);

  // 영양 정보 가져오기
  const fetchNutrition = async () => {
    if (!recipe || !recipe.id) {
      setError('레시피 ID를 찾을 수 없습니다.');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`영양 정보 요청 - 레시피 ID: ${recipe.id}`);
      // 영양 정보 API 호출
      const response = await recipeAPI.getNutrition(recipe.id);
      console.log('영양 정보 응답:', response.data);
      
      if (response.data) {
        setNutritionData(response.data);
        setShowNutrition(true);
        setError(null);
      } else {
        // 응답은 성공했지만 데이터가 없는 경우
        setError('영양 정보가 제공되지 않았습니다');
        // 기본 영양 정보로 모달 표시
        setNutritionData({
          calories: 500,
          carbohydrate: 30,
          protein: 25,
          fat: 15,
          sugar: 5,
          sodium: 400,
          saturatedFat: 3,
          transFat: 0,
          cholesterol: 50
        });
        setShowNutrition(true);
      }
    } catch (err) {
      console.error('영양 정보 가져오기 오류:', err);
      
      // 오류가 발생해도 기본 영양 정보로 모달 표시
      setNutritionData({
        calories: 500,
        carbohydrate: 30,
        protein: 25,
        fat: 15,
        sugar: 5,
        sodium: 400,
        saturatedFat: 3,
        transFat: 0,
        cholesterol: 50
      });
      
      setError('영양 정보를 가져오는데 실패했습니다. 기본값을 표시합니다.');
      setShowNutrition(true);
    } finally {
      setLoading(false);
    }
  };
  
  // 만족도 제출 성공 처리
  const handleSatisfactionSuccess = () => {
    setSatisfactionSubmitted(true);
  };
  
  // 대체 레시피 생성 성공 처리
  const handleSubstituteSuccess = (newRecipe) => {
    if (newRecipe && newRecipe.success) {
      setRecipe(newRecipe);
    }
    setShowSubstitute(false);
  };

  // 로딩 중 상태 표시
  if (loading) {
    return <div className="loading-recipe">레시피 정보를 불러오는 중...</div>;
  }

  // 오류 상태 표시
  if (error && !recipe) {
    return <div className="error-message">{error}</div>;
  }

  // 레시피가 없는 경우
  if (!recipe) {
    return <div className="error-message">레시피를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="recipe-view-container">
      <div className="recipe-view-left-panel">
        <div className="recipe-view-header">
          <h2>{recipe.name || '이름 없는 레시피'}</h2>
          <p>{recipe.description || '설명이 없습니다.'}</p>
        </div>

        <div className="recipe-content">
          <div className="recipe-ingredients">
            <h3>재료</h3>
            <ul className="ingredients-list">
              {Array.isArray(recipe.ingredients) && recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="ingredient-item">
                  <span className="ingredient-name">{ingredient.name}</span>
                  <span className="ingredient-amount">{ingredient.amount || '적당량'}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="recipe-steps">
            <h3>조리 방법</h3>
            <ol>
              {Array.isArray(recipe.instructions) && recipe.instructions.map((step, idx) => (
                <li key={idx}>
                  {step.instruction || step.text || '조리 단계'}
                </li>
              ))}
            </ol>
          </div>
          
          <div className="recipe-actions">
            <button 
              onClick={fetchNutrition}
              className="recipe-button nutrition-button"
            >
              영양 정보
            </button>
            
            <button 
              onClick={() => setShowAssistance(true)}
              className="recipe-button assistance-button"
            >
              요리 어시스턴스
            </button>
            
            <button 
              onClick={() => setShowSatisfaction(true)}
              className={`recipe-button satisfaction-button ${satisfactionSubmitted ? 'submitted' : ''}`}
              disabled={satisfactionSubmitted}
            >
              {satisfactionSubmitted ? '평가 완료' : '레시피 평가'}
            </button>
            
            <button 
              onClick={() => setShowSubstitute(true)}
              className="recipe-button substitute-button"
            >
              대체 재료
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {/* 영양 정보 모달 */}
        {showNutrition && nutritionData && (
          <NutritionModal 
            nutrition={nutritionData} 
            recipeName={recipe.name}
            onClose={() => setShowNutrition(false)} 
          />
        )}
        
        {/* 요리 어시스턴스 모달 */}
        {showAssistance && (
          <CookingAssistant 
            recipe={recipe}
            onClose={() => setShowAssistance(false)} 
          />
        )}
        
        {/* 만족도 평가 모달 */}
        {showSatisfaction && (
          <SatisfactionModal
            recipeId={recipe.id}
            recipeName={recipe.name}
            onClose={() => setShowSatisfaction(false)}
            onSubmitSuccess={handleSatisfactionSuccess}
          />
        )}
        
        {/* 대체 재료 모달 */}
        {showSubstitute && (
          <SubstituteIngredientModal
            recipeId={recipe.id}
            recipeName={recipe.name}
            onClose={() => setShowSubstitute(false)}
            onSuccess={handleSubstituteSuccess}
          />
        )}
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