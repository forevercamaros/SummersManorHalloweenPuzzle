import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import initialData from './initial-data';
import Stanza from './Stanza';
import styled from 'styled-components';
import Card from 'react-bootstrap/Card';

const Container = styled.div``;

export default function FinalPuzzle() {
    const [data, setData] = useState(initialData);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [solved])

    const checkAllStanzasComplete = newData => {
        var keys = Object.keys(newData.columns);
        var fullyCompleted = true;
        for (let i = 0; i < keys.length; i++) {
            if (newData.columns[keys[i]].completed === false) {
                fullyCompleted = false;
            }
        }
        return fullyCompleted;
    }

    const checkForCompletion = newData => {
        var keys = Object.keys(newData.columns);
        for (let i = 0; i < keys.length; i++) {
            if (Object.keys(newData.columns[keys[i]].taskIds).length === 2) {
                if (data.tasks[newData.columns[keys[i]].taskIds[0]].realOrder === 1 && newData.columns[keys[i]].taskIds.length === 2 &&
                    data.tasks[newData.columns[keys[i]].taskIds[1]].realOrder === 2 &&
                    data.tasks[newData.columns[keys[i]].taskIds[0]].realStanza === data.tasks[newData.columns[keys[i]].taskIds[1]].realStanza) {

                    const newColumn = {
                        ...newData.columns[keys[i]],
                        completed: true,
                        realStanza: data.tasks[newData.columns[keys[i]].taskIds[0]].realStanza
                    };

                    newData = {
                        ...newData,
                        columns: {
                            ...newData.columns,
                            [newColumn.id]: newColumn
                        }
                    };
                    if (checkAllStanzasComplete(newData)) {
                        for (let i2 = 0; i2 < newData.columnOrder.length; i2++) {
                            if (newData.columns[newData.columnOrder[i2]].realStanza === i2 + 1) {
                                const newColumn2 = {
                                    ...newData.columns[newData.columnOrder[i2]],
                                    inCorrectPosition: true
                                };

                                newData = {
                                    ...newData,
                                    columns: {
                                        ...newData.columns,
                                        [newColumn2.id]: newColumn2
                                    }
                                };
                                if (newData.columnOrder.length === i2 + 1) {
                                    setSolved(true);
                                    console.log("Final Puzzle Solved");
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
            }            
        }
        setData(newData);
    };

    const onDragEnd = result => {
        const { destination, source, draggableId, type } = result;
        if (!destination) {
            return;
        }
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        if (type === "column") {            
            const newColumnOrder = Array.from(data.columnOrder);
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);
            const newData = {
                ...data,
                columnOrder: newColumnOrder
            };
            for (let i = destination.index; i < newData.columnOrder.length; i++) {
                if (newData.columns[newData.columnOrder[i]].inCorrectPosition === true) {
                    return;
                }
            }
            checkForCompletion(newData);            
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
            checkForCompletion(newData);
        } else {
            const startTaskIds = Array.from(start.taskIds);
            startTaskIds.splice(source.index, 1);
            const newStart = {
                ...start,
                taskIds: startTaskIds
            };

            const finishTaskIds = Array.from(finish.taskIds);
            finishTaskIds.splice(destination.index, 0, draggableId);
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
            checkForCompletion(newData);
        }
    };

    function ShowAuthor({ isSolved }) {
        if (isSolved) {
            return (
                <Card className="bg-dark text-white">
                    <Card.Body>
                        <Card.Title>The Little Ghost</Card.Title>
                        <Card.Text>
                            Edna St. Vincent Millay - 1892-1950
                    </Card.Text>
                    </Card.Body>
                </Card>
                )
        } else {
            return "";
        }
        
    }

    return (
        <>
            <ShowAuthor isSolved={solved}/>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="all-columns" type="column">
                    {(provided) => (
                        <Container {...provided.droppableProps} ref={provided.innerRef}>
                            {
                                data.columnOrder.map((columnId, index) => {
                                    const column = data.columns[columnId];
                                    const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

                                    return <Stanza key={column.id} column={column} tasks={tasks} index={index} />;
                                })
                            }
                            {provided.placeholder}
                        </Container>
                    )}
                </Droppable>
            </DragDropContext>
            </>  
    )
}