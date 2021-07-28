import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 2px;
  padding: 8px;
  margin-bottom: 8px;
  background-color: ${props => (props.isDragDisabled ? 'lightgrey' : props.isDragging ? 'lightgreen' : 'white')};
`;

const Line = styled.div`
  background-color: ${props => (props.isDragDisabled ? 'lightgrey' : props.isDragging ? 'lightgreen' : 'white')};
`;

export default class Lines extends React.Component {
    render() {
        const isDragDisabled = this.props.column.completed === true;
        return (
            <Draggable draggableId={this.props.task.id} index={this.props.index} isDragDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                    <Container
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        isDragging={snapshot.isDragging}
                        isDragDisabled={isDragDisabled}
                    >
                        <Line
                            isDragging={snapshot.isDragging}
                            isDragDisabled={isDragDisabled}
                        >
                            {this.props.task.line1}
                        </Line>
                        <Line
                            isDragging={snapshot.isDragging}
                            isDragDisabled={isDragDisabled}
                        >
                            {this.props.task.line2}
                        </Line>
                    </Container>                    
                )}
            </Draggable>
        );
    }
}
