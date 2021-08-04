import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Lines from './Lines';

const Container = styled.div`
  margin: ${props => (props.isDragDisabled ? '0px' : '8px')};
  border: ${props => (props.isDragDisabled ? 'none' : '1px solid lightgrey')};
  border-radius: ${props => (props.isDragDisabled ? '0px' : '2px')};
  background-color: ${props => (props.isDragDisabled ? 'black' : props.isDropDisabled ? 'lightgrey' : 'white')};
  display: flex;
  flex-direction: column;
`;
const DragHeader = styled.h3`
  padding: ${props => (props.isDragDisabled ? '0px' :'8px')};
  background-color: ${props => (props.isDragDisabled ? 'black' : 'grey')};;
`;
const TaskList = styled.div`
  padding: ${props => (props.isDragDisabled ? '0px' : '8px')};
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDragDisabled? 'black': props.isDropDisabled ? 'lightgrey' : props.isDraggingOver ? 'lightgrey' : 'inherit')};
  flex-grow: 1;
  min-height: ${props => (props.isDragDisabled ? '0px' :'100px')};
`;

export default class Stanza extends React.Component {
    render() {
        const isDropDisabled = this.props.column.completed === true;
        const isDragDisabled = this.props.column.inCorrectPosition === true;
        return (
            <Draggable draggableId={this.props.column.id} index={this.props.index} isDragDisabled={isDragDisabled}>
                {(provided) => (
                    <Container {...provided.draggableProps} ref={provided.innerRef} isDropDisabled={isDropDisabled} isDragDisabled={isDragDisabled}>
                        <DragHeader {...provided.dragHandleProps} isDragDisabled={isDragDisabled}>{""}</DragHeader>
                        <Droppable droppableId={this.props.column.id} isDropDisabled={isDropDisabled} type="task">
                            {(provided, snapshot) => (
                                <TaskList ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver} isDropDisabled={isDropDisabled} isDragDisabled={isDragDisabled} >
                                    {this.props.tasks.map((task, index) => (
                                        <Lines key={task.id} task={task} index={index} column={ this.props.column} />
                                    ))}
                                    {provided.placeholder}
                                </TaskList>
                            )}
                        </Droppable>
                    </Container>
                    )}                
            </Draggable>
        );
    }
}
