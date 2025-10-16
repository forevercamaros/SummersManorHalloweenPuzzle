import styled from 'styled-components';
import Modal from 'react-bootstrap/Modal';
import scaryGhostBackground from '../../images/ScaryGhost.png';

export const BottomPadding = styled.div`  
  min-height: 100px;
`;

export const FadeContainer = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
  color: white;
`;

export const BottomTimer = styled.div`
  position: fixed !important;
  bottom: 0 !important;
  z-index: 100;
  background-color: black;
  width: 100%;
`;

export const GroupNameDiv = styled.div`
  padding: 10%;
`;

export const SpookyWrapper = styled.div`
  height: 100vh;
  background-image: url(${scaryGhostBackground});
  background-repeat: no-repeat;
  background-position: center center;
  background-attachment: fixed;
  background-size: contain;
  position: relative;
  padding-top: 40px;
  padding-bottom: 40px;
  z-index: 1;
  overflow: hidden;
`;

export const SpookyTitle = styled.h1`
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
  color: #ff6b1a;
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: bold;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
  animation: flicker 1.1s infinite;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    letter-spacing: 1px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    padding: 0 1rem;
    margin-bottom: 1.5rem;
  }
`;

export const FlickerStyle = styled.div`
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    10% { opacity: 0.7; }
    20% { opacity: 0.9; }
    30% { opacity: 0.5; }
    40% { opacity: 0.8; }
    50% { opacity: 0.6; }
    60% { opacity: 0.85; }
    70% { opacity: 0.7; }
    80% { opacity: 0.95; }
    90% { opacity: 0.8; }
  }
  animation: flicker 1.3s infinite;
`;

export const StyledModal = styled(Modal)`
  .modal-content {
    background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
    border: 1px solid #ff6b1a;
    color: white;
  }
  
  .modal-header {
    border-bottom: 1px solid #ff6b1a;
    
    .modal-title {
      color: #ff6b1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      font-weight: bold;
    }
    
    .btn-close {
      filter: invert(1);
    }
  }
  
  .modal-footer {
    border-top: 1px solid #ff6b1a;
  }
`;

export const MistSVG = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 180px;
  z-index: 0;
  opacity: 0.22;
  pointer-events: none;
`;