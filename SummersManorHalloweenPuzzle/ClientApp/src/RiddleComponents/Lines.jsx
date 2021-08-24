import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
  border: ${props => (props.isFullyCompleted ? 'none' : '1px solid lightgrey')};
  border-radius: ${props => (props.isFullyCompleted ? '0px' : '2px')};
  padding: ${props => (props.isFullyCompleted ? '0px' : '8px')};
  margin-bottom: ${props => (props.isFullyCompleted ? '0px' : '8px')};
  background-color: ${props => (props.isFullyCompleted ? 'black' : props.isDragDisabled ? 'lightgrey' : props.isDragging ? 'red' : 'white')};
`;

const Line = styled.div`
  background-color: ${props => (props.isFullyCompleted ? 'black' : props.isDragDisabled ? 'lightgrey' : props.isDragging ? 'red' : 'white')};
  color: ${props => (props.isFullyCompleted ? 'white' : 'back')};
`;

export default class Lines extends React.Component {
    render() {
        const isDragDisabled = this.props.column.completed === true;
        const isFullyCompleted = this.props.column.inCorrectPosition === true;
        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index} isDragDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        isDragging={snapshot.isDragging}
                        isDragDisabled={isDragDisabled}
                        isFullyCompleted={isFullyCompleted}
                    >
                        <Line
                            isDragging={snapshot.isDragging}
                            isDragDisabled={isDragDisabled}
                            isFullyCompleted={isFullyCompleted}
                        >
                            {this.props.task.line1}
                        </Line>
                        <Line
                            isDragging={snapshot.isDragging}
                            isDragDisabled={isDragDisabled}
                            isFullyCompleted={isFullyCompleted}
                        >
                            {this.props.task.line2}
                        </Line>
                    </Container>                    
                )}
            </Draggable>
        );
    }
}
