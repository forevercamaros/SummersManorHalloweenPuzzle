import styled, { keyframes } from 'styled-components';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const spookyFlicker = keyframes`
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
`;

const evilGlow = keyframes`
  0% { 
    box-shadow: 0 0 10px #8b0000, 0 0 20px #ff6b1a, 0 0 30px #8b0000;
    filter: brightness(1);
  }
  50% { 
    box-shadow: 0 0 20px #8b0000, 0 0 40px #ff6b1a, 0 0 60px #8b0000;
    filter: brightness(1.2);
  }
  100% { 
    box-shadow: 0 0 10px #8b0000, 0 0 20px #ff6b1a, 0 0 30px #8b0000;
    filter: brightness(1);
  }
`;

export const SpookyModal = styled(Modal)`
  .modal-content {
    background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
    border: 2px solid #ff6b1a;
    color: #dedede;
    box-shadow: 
      0 0 30px rgba(255, 107, 26, 0.5),
      0 0 60px rgba(139, 0, 0, 0.3);
    border-radius: 8px;
  }
  
  .modal-header {
    border-bottom: 2px solid #ff6b1a;
    background: rgba(139, 0, 0, 0.3);
    border-radius: 6px 6px 0 0;
    
    .modal-title {
      color: #ff6b1a;
      font-family: 'Creepster', cursive;
      text-shadow: 0 0 8px #8b0000;
      letter-spacing: 2px;
      text-transform: uppercase;
      animation: ${spookyFlicker} 2s infinite;
      font-size: 1.3rem;
      
      @media (max-width: 768px) {
        font-size: 1.1rem;
        letter-spacing: 1px;
      }
    }
    
    .btn-close {
      filter: invert(1);
      opacity: 0.8;
      transition: all 0.3s ease;
      
      &:hover {
        opacity: 1;
        transform: scale(1.1);
        filter: invert(1) drop-shadow(0 0 8px #ff6b1a);
      }
    }
  }
  
  .modal-body {
    font-family: 'Crimson Text', serif;
    font-size: 1.1rem;
    line-height: 1.5;
    padding: 1.5rem;
    background: rgba(10, 10, 10, 0.3);
    text-shadow: 0 0 4px rgba(255, 107, 26, 0.3);
    color: #dedede;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      padding: 1rem;
    }
  }
  
  .modal-footer {
    border-top: 2px solid #ff6b1a;
    background: rgba(139, 0, 0, 0.2);
    padding: 1rem;
    border-radius: 0 0 6px 6px;
  }
  
  /* Enhanced backdrop */
  &.modal {
    backdrop-filter: blur(5px);
  }
  
  .modal-backdrop {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

export const SpookyButton = styled(Button)`
  background: linear-gradient(135deg, #8b0000 0%, #ff6b1a 100%) !important;
  border: 2px solid #ff6b1a !important;
  color: #dedede !important;
  font-family: 'Creepster', cursive !important;
  font-size: 1rem !important;
  text-shadow: 0 0 8px #8b0000 !important;
  letter-spacing: 2px !important;
  padding: 12px 24px !important;
  text-transform: uppercase !important;
  transition: all 0.3s ease !important;
  animation: ${spookyFlicker} 3s infinite !important;
  
  @media (max-width: 768px) {
    font-size: 0.9rem !important;
    padding: 10px 20px !important;
    letter-spacing: 1px !important;
  }
  
  &:hover {
    background: linear-gradient(135deg, #ff6b1a 0%, #8b0000 100%) !important;
    border-color: #ff6b1a !important;
    color: #fff !important;
    box-shadow: 
      0 0 20px rgba(255, 107, 26, 0.5),
      0 0 40px rgba(139, 0, 0, 0.3) !important;
    transform: translateY(-2px) !important;
  }
  
  &:focus {
    box-shadow: 
      0 0 0 0.2rem rgba(255, 107, 26, 0.25),
      0 0 20px rgba(255, 107, 26, 0.5) !important;
  }
  
  &:active {
    transform: translateY(0) !important;
  }
`;

export const DangerButton = styled(SpookyButton)`
  background: linear-gradient(135deg, #8b0000 0%, #dc3545 100%) !important;
  border-color: #dc3545 !important;
  
  &:hover {
    background: linear-gradient(135deg, #dc3545 0%, #8b0000 100%) !important;
    border-color: #dc3545 !important;
    box-shadow: 
      0 0 20px rgba(220, 53, 69, 0.5),
      0 0 40px rgba(139, 0, 0, 0.3) !important;
  }
`;

export const SuccessButton = styled(SpookyButton)`
  background: linear-gradient(135deg, #2cba3f 0%, #198754 100%) !important;
  border-color: #2cba3f !important;
  
  &:hover {
    background: linear-gradient(135deg, #198754 0%, #2cba3f 100%) !important;
    border-color: #2cba3f !important;
    box-shadow: 
      0 0 20px rgba(44, 186, 63, 0.5),
      0 0 40px rgba(25, 135, 84, 0.3) !important;
  }
`;

export const WarningButton = styled(SpookyButton)`
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%) !important;
  border-color: #ffc107 !important;
  color: #212529 !important;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5) !important;
  
  &:hover {
    background: linear-gradient(135deg, #fd7e14 0%, #ffc107 100%) !important;
    border-color: #ffc107 !important;
    color: #000 !important;
    box-shadow: 
      0 0 20px rgba(255, 193, 7, 0.5),
      0 0 40px rgba(253, 126, 20, 0.3) !important;
  }
`;

export const VictoryImage = styled.img`
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(255, 107, 26, 0.3);
  animation: ${evilGlow} 3s infinite;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;