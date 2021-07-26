import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Lines from './Lines';

const Container = styled.div`
  margin: 8px;
  border: 1px solid lightgrey;
  border-radius: 2px;
  background-color: white;
  display: flex;
  flex-direction: column;
`;
const DragHeader = styled.h3`
  padding: 8px;
`;
const TaskList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${props => (props.isDropDisabled ? 'red' : props.isDraggingOver ? 'skyblue' : 'inherit')};
  flex-grow: 1;
  min-height: 100px;
`;

export default class Stanza extends React.Component {
    render() {
        const isDropDisabled = this.props.column.id === 'column-3';
        return (
            <Draggable draggableId={this.props.column.id} index={this.props.index}>
                {(provided) => (
                    <Container {...provided.draggableProps} ref={provided.innerRef}>
                        <DragHeader {...provided.dragHandleProps}>{this.props.column.title}</DragHeader>
                        <Droppable droppableId={this.props.column.id} isDropDisabled={isDropDisabled} type="task">
                            {(provided, snapshot) => (
                                <TaskList ref={provided.innerRef} {...provided.droppableProps} isDraggingOver={snapshot.isDraggingOver} isDropDisabled={isDropDisabled} >
                                    {this.props.tasks.map((task, index) => (
                                        <Lines key={task.id} task={task} index={index} />
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
