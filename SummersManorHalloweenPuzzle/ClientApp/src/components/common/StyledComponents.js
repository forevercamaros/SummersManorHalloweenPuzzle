import styled from 'styled-components';
import { Container, Card, Form } from 'react-bootstrap';

export const StyledContainer = styled(Container)`
  margin-top: 20px;
  background: linear-gradient(135deg, #0a0a0a 80%, #8b0000 100%);
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

export const StyledCard = styled(Card)`
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid #ff6b1a;
  margin-bottom: 20px;
  
  .card-header {
    background: #8b0000;
    color: #ff6b1a;
    font-weight: bold;
  }
  
  .card-body {
    color: white;
  }
`;

export const SpookyTitle = styled.h1`
  font-family: 'Creepster', cursive;
  color: #ff6b1a;
  text-align: center;
  margin-bottom: 2rem;
  text-shadow: 0 0 12px #8b0000, 0 0 24px #ff6b1a;
  animation: flicker 1.3s infinite;
`;

export const SettingsItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
  
  h5 {
    color: #ff6b1a;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #ccc;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
`;

export const StoredDataText = styled.small`
  color: #bbb;
  font-size: 0.85rem;
  font-style: italic;
`;

export const SpookyFormControl = styled(Form.Control)`
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.2) 100%) !important;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#ff6b1a'} !important;
  color: #ff6b1a !important;
  font-family: 'Crimton Text', serif !important;
  
  &:focus {
    background: linear-gradient(135deg, rgba(10, 10, 10, 0.9) 0%, rgba(139, 0, 0, 0.3) 100%) !important;
    border-color: ${props => props.hasError ? '#dc3545' : '#ff6b1a'} !important;
    box-shadow: 0 0 0 0.2rem ${props => props.hasError ? 'rgba(220, 53, 69, 0.25)' : 'rgba(255, 107, 26, 0.25)'} !important;
    color: #ff6b1a !important;
  }
`;

export const SpookyFormLabel = styled(Form.Label)`
  color: #ff6b1a !important;
  font-weight: bold !important;
  margin-bottom: 0.5rem !important;
`;

export const ErrorText = styled.div`
  color: #dc3545 !important;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: bold;
`;