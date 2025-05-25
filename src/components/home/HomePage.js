import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ isAuthenticated }) => {
  return (
    <div className="homepage">
      {/* 히어로 섹션 */}
      <section className="hero">
        {/* 플로팅 음식 이미지 */}
        <div className="floating-image img-1">🥕</div>
        <div className="floating-image img-2">🍅</div>
        <div className="floating-image img-3">🧅</div>
        <div className="floating-image img-4">🥩</div>
        
        <div className="hero-content">
          <h1>사진 한 장으로 시작하는 쉬운 요리</h1>
          <p>냉장고 속 재료로 무엇을 만들지 고민되시나요? 요리한컷에 식재료 사진 한 장만 올리면 AI가 맞춤형 레시피를 제안해드립니다.</p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/recipe/upload" className="primary-button">레시피 만들기</Link>
            ) : (
              <Link to="/register" className="primary-button">시작하기</Link>
            )}
            <a href="#how-it-works" className="secondary-button">자세히 알아보기</a>
          </div>
        </div>
      </section>
      
      {/* 기능 섹션 */}
      <section className="features" id="features">
        <div className="section-title">
          <h2>요리한컷의 특별한 기능</h2>
          <p>AI 기술로 구현된 다양한 기능으로 요리를 더 쉽고 즐겁게 만들어보세요</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-image">
              <div className="feature-emoji">📸</div>
            </div>
            <div className="feature-content">
              <div className="feature-icon">✨</div>
              <h3>이미지 인식 레시피</h3>
              <p>식재료 사진 한 장만 업로드하면 AI가 자동으로 재료를 인식하고 가능한 레시피를 추천해드립니다.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-image">
              <div className="feature-emoji">⏱️</div>
            </div>
            <div className="feature-content">
              <div className="feature-icon">⚡</div>
              <h3>실시간 요리 어시스턴스</h3>
              <p>각 요리 단계별로 타이머 기능과 상세 설명을 제공하여 초보자도 쉽게 따라할 수 있습니다.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-image">
              <div className="feature-emoji">🥦</div>
            </div>
            <div className="feature-content">
              <div className="feature-icon">🍃</div>
              <h3>영양 정보 분석</h3>
              <p>생성된 레시피의 상세한 영양 정보를 확인하고 건강한 식단 관리에 활용하세요.</p>
            </div>
          </div>
          
          <div className="feature-card">
            <div className="feature-image">
              <div className="feature-emoji">🔄</div>
            </div>
            <div className="feature-content">
              <div className="feature-icon">🧩</div>
              <h3>대체 재료 제안</h3>
              <p>없는 재료가 있다면 AI가 적절한 대체 재료를 추천하고, 레시피를 자동으로 조정해드립니다.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 사용 방법 섹션 */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-title">
          <h2>어떻게 사용하나요?</h2>
          <p>요리한컷은 누구나 쉽게 사용할 수 있습니다. 간단한 4단계로 맛있는 요리를 시작해보세요!</p>
        </div>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>사진 업로드</h3>
            <p>냉장고 속 재료나 요리하고 싶은 식재료 사진을 찍어 업로드하세요.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>지시사항 입력</h3>
            <p>간단한 요구사항이나 선호하는 요리 스타일을 입력하세요.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>레시피 생성</h3>
            <p>AI가 맞춤형 레시피를 생성하고 상세한 요리 단계를 제공합니다.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>요리 시작</h3>
            <p>실시간 가이드와 함께 맛있는 요리를 완성하세요!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;