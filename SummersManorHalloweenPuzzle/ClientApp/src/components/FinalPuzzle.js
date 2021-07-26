import React from 'react';
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import initialData from './initial-data';
import Column from './column';
import styled from 'styled-components';

const Container = styled.div``;

export default function FinalPuzzle() {
    const [data, setData] = React.useState(initialData);

    const onDragEnd = result => {
        const { destination, source, draggableId, type } = result;
        if (!destination) {
            return;
        }
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if(type === "column"){
            const newColumnOrder = Array.from(data.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);
            const newData = {
                ...data,
                columnOrder: newColumnOrder
            };
            setData(newData);
            return;
        }

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = {
                ...start,
                taskIds: newTaskIds
            };

            const newData = {
                ...data,
                columns: {
                    ...data.columns,
                    [newColumn.id]: newColumn
                }
            };
            setData(newData);
        } else {
            const startTaskIds = Array.from(start.taskIds);
            startTaskIds.splice(source.index, 1);
            const newStart = {
                ...start,
                taskIds: startTaskIds
            };

            const finishTaskIds = Array.from(finish.taskIds);
            finishTaskIds.splice(source.index, 0, draggableId);
            const newFinish = {
                ...finish,
                taskIds: finishTaskIds
            };

            const newData = {
                ...data,
                columns: {
                    ...data.columns,
                    [newStart.id]: newStart,
                    [newFinish.id]: newFinish
                }
            };
            setData(newData);
        }


    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-columns" type="column">
                {(provided) => (
                    <Container {...provided.droppableProps} ref={provided.innerRef}>
                    {
                        data.columnOrder.map((columnId,index) => {
                            const column = data.columns[columnId];
                            const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

                            return <Column key={column.id} column={column} tasks={tasks} index={index} />;
                        })
                    }
                        {provided.placeholder}
                    </Container>
                )}                
            </Droppable>
        </DragDropContext>
    )
}